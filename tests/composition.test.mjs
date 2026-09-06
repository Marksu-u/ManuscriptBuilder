import test from 'node:test';
import assert from 'node:assert/strict';
import {accessSync} from 'node:fs';
import {assetIds,blankComposition,compositionSchema,formatRange,snapBox,canEdit,visible} from '../lib/composition.ts';
import {composePage} from '../lib/composition-migration.ts';
import {INITIAL,exportManuscript,parseManuscriptExport} from '../lib/manuscript-data.ts';

test('universal composition survives export with custom layers and mixed fonts',()=>{
 const c=blankComposition('Title','Body');c.layers.push({id:'custom',name:'Annotations',hidden:false,locked:false});c.elements[1]={...c.elements[1],layerId:'custom',text:'Two fonts',runs:[{text:'Two ',font:'hand',bold:false,italic:false},{text:'fonts',font:'technical',bold:true,italic:false}]};
 const doc={...INITIAL,pages:[{...INITIAL.pages[0],composition:c}]};assert.deepEqual(parseManuscriptExport(exportManuscript(doc)),doc);
});
test('rejects dangling references, duplicate IDs and untrusted font or image data',()=>{
 const c=blankComposition('Title','Body');
 for(const patch of [{layers:[c.layers[0],c.layers[0]]},{elements:[c.elements[0],c.elements[0]]},{surfaceId:'missing'},{elements:[{...c.elements[1],layerId:'missing'}]},{elements:[{...c.elements[0],asset:'uploaded',image:'https://tracker.invalid/a.png'}]},{elements:[{...c.elements[1],font:'url(evil)'}]},{elements:[{...c.elements[1],text:'x',runs:[{text:'other',font:'serif',bold:false,italic:false}]}]}])assert.equal(compositionSchema.safeParse({...c,...patch}).success,false);
});
test('legacy migration preserves text and decorations without reintroducing removed objects',()=>{
 const c=composePage(INITIAL.pages[0],'royal',{kicker:'Label',signature:'Signed',folio:'1'},{page:'Document'});
 assert.equal(c.elements.filter(e=>e.kind==='text').length,5);assert.equal(c.elements.filter(e=>e.asset==='royal-divider').length,3);
 const changed={...c,elements:c.elements.filter(e=>e.id!=='text:signature')};assert.deepEqual(composePage({...INITIAL.pages[0],composition:changed},'dossier',{kicker:'Other',signature:'Other',folio:'2'},{}),changed);
});
test('snaps to margins, center, object edges and equal spacing within threshold',()=>{
 assert.equal(snapBox({x:80,y:250,width:50,height:20},[],78).x,78);
 assert.equal(snapBox({x:257,y:250,width:50,height:20},[],78).x,255);
 assert.equal(snapBox({x:154,y:250,width:40,height:20},[{x:100,y:0,width:50,height:40}],78).x,150);
 assert.equal(snapBox({x:244,y:300,width:40,height:20},[{x:100,y:0,width:40,height:40},{x:380,y:0,width:40,height:40}],78).x,240);
 const far=snapBox({x:120,y:210,width:40,height:20},[],78);assert.deepEqual([far.x,far.y,far.guides.length],[120,210,0]);
});
test('range formatting preserves unselected text and permits mixed fonts',()=>{
 const e=blankComposition('Hello world','Body').elements[1];const mixed=formatRange(e,6,11,{font:'hand',bold:true});assert.equal(mixed.runs.map(r=>r.text).join(''),'Hello world');assert.equal(mixed.runs[0].font,'serif');assert.equal(mixed.runs[1].font,'hand');assert.equal(mixed.runs[1].bold,true);
});
test('layer locks and visibility apply to their objects',()=>{const c=blankComposition('Title','Body');const e=c.elements[1];assert.equal(canEdit(c,e),true);c.layers.find(l=>l.id===e.layerId).locked=true;assert.equal(canEdit(c,e),false);c.layers.find(l=>l.id===e.layerId).hidden=true;assert.equal(visible(c,e),false);});
test('every bundled asset ID has a real project file',()=>{for(const id of assetIds.filter(id=>id!=='uploaded'))accessSync(new URL(`../public/art/${id}.png`,import.meta.url));});
