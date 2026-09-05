// Explicit integration check: all synthetic records live in one rolled-back transaction.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { listOwnedManuscripts, loadOwnedManuscript, writeOwnedManuscript } from '../lib/manuscript-repository.ts';
import { INITIAL } from '../lib/manuscript-data.ts';
dotenv.config({path:['.env.local','.env'],quiet:true});
const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.DATABASE_URL})});
const rollback=new Error('Rollback integration fixtures');
const ids=[randomUUID(),randomUUID()];
try {
 try {
  await db.$transaction(async tx=>{
   const users=await Promise.all(ids.map(id=>tx.user.create({data:{supabaseId:id,email:`test-${id}@example.invalid`}})));
   const record=await tx.manuscript.create({data:{ownerId:users[0].id,title:INITIAL.name,styleId:INITIAL.theme,pages:{create:INITIAL.pages.map((content,position)=>({content,position}))}}});
   assert.equal((await listOwnedManuscripts(tx,users[0].id)).length,1);
   assert.equal((await listOwnedManuscripts(tx,users[1].id)).length,0);
   assert.equal(await loadOwnedManuscript(tx,users[1].id,record.id),null);
   const foreign=await writeOwnedManuscript(tx,users[1].id,record.id,record.updatedAt,{...INITIAL,name:'Forbidden'});
   assert.ok('error' in foreign);
   const changed={...INITIAL,name:'Saved test',pages:[...INITIAL.pages].reverse()};
   const saved=await writeOwnedManuscript(tx,users[0].id,record.id,record.updatedAt,changed);
   assert.ok('version' in saved);
   const stale=await writeOwnedManuscript(tx,users[0].id,record.id,record.updatedAt,{...INITIAL,name:'Stale write'});
   assert.ok('error' in stale);
   const loaded=await loadOwnedManuscript(tx,users[0].id,record.id);
   assert.equal(loaded.title,'Saved test');
   assert.deepEqual(loaded.pages.map(page=>page.content),changed.pages);
   throw rollback;
  },{timeout:15000});
 } catch(error){if(error!==rollback)throw error;}
 assert.equal(await db.user.count({where:{supabaseId:{in:ids}}}),0);
 console.log('PASS: owner-only listing/loading, guarded saving, stale-write rejection, ordered page round-trip, fixture rollback.');
} catch(error){console.error('Database integration check failed:',error instanceof assert.AssertionError?error.message:error.code??error.name);process.exitCode=1;}
finally {await db.$disconnect();}
