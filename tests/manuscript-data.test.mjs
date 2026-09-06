import test from 'node:test';
import assert from 'node:assert/strict';
import {INITIAL,manuscriptSchema,blankManuscript,exportManuscript,parseManuscriptExport,getPageDecorations,getTextLayout} from '../lib/manuscript-data.ts';

test('example and blank manuscript fit the saved format',()=>{
 assert.equal(manuscriptSchema.safeParse(INITIAL).success,true);
 assert.equal(manuscriptSchema.safeParse(blankManuscript('A letter','royal')).success,true);
});
test('rejects duplicate pages and missing active pages',()=>{
 assert.equal(manuscriptSchema.safeParse({...INITIAL,pages:[INITIAL.pages[0],INITIAL.pages[0]]}).success,false);
 assert.equal(manuscriptSchema.safeParse({...INITIAL,activeId:'missing'}).success,false);
});
test('rejects remote images and oversized content before persistence',()=>{
 for(const image of ['https://example.com/tracker.png','data:image/svg+xml;base64,PHN2Zz4=']) {
  assert.equal(manuscriptSchema.safeParse({...INITIAL,pages:[{...INITIAL.pages[0],image}]}).success,false);
 }
 assert.equal(manuscriptSchema.safeParse({...INITIAL,pages:[{...INITIAL.pages[0],body:'x'.repeat(12001)}]}).success,false);
});
test('exports a versioned envelope and still reads legacy documents',()=>{
 const exported=exportManuscript(INITIAL);
 assert.equal(exported.version,4);
 assert.deepEqual(parseManuscriptExport(exported),INITIAL);
 assert.deepEqual(parseManuscriptExport(INITIAL),INITIAL);
 assert.equal(parseManuscriptExport({version:5,manuscript:INITIAL}),null);
});

test('artwork round-trips through current and legacy envelopes', () => {
 const decoration = {id:'seal',asset:'wax-seal',x:430,y:650,size:120,rotation:-8,opacity:.8,locked:true,layer:'behind'};
 const manuscript = {...INITIAL,pages:[{...INITIAL.pages[0],decorations:[decoration],textureOpacity:.7,wear:.2,ornamentation:false}]};
 assert.deepEqual(parseManuscriptExport(exportManuscript(manuscript)),manuscript);
 assert.deepEqual(parseManuscriptExport({...exportManuscript(INITIAL),version:1}),INITIAL);
});

test('rejects unsafe art references, invalid geometry and excessive layers', () => {
 const item = {id:'seal',asset:'wax-seal',x:430,y:650,size:120,rotation:0,opacity:1,locked:false,layer:'front'};
 const validate = decorations => manuscriptSchema.safeParse({...INITIAL,pages:[{...INITIAL.pages[0],decorations}]}).success;
 for (const patch of [{asset:'https://example.com/track.png'},{x:561},{y:-1},{size:0},{rotation:181},{opacity:2},{x:NaN},{layer:'arbitrary'}]) assert.equal(validate([{...item,...patch}]),false);
 assert.equal(validate([item,item]),false);
 assert.equal(validate(Array.from({length:41},(_,i)=>({...item,id:String(i)}))),false);
 assert.equal(validate(Array.from({length:40},(_,i)=>({...item,id:String(i)}))),true);
});


test('material, editable text and custom art round-trip in v3', () => {
 const page={...INITIAL.pages[0],paperVariant:'worn',artworkVersion:3,kicker:'Private',signature:'The keeper',folio:'VII',textLayout:{title:{...getTextLayout(INITIAL.pages[0],'title','royal'),x:35,font:'mono',color:'#125678',hidden:true}},decorations:[{id:'upload',asset:'uploaded',image:'data:image/png;base64,aGVsbG8=',x:200,y:300,size:180,height:100,rotation:0,opacity:1,locked:false,layer:'front'}]};
 const doc={...INITIAL,pages:[page]};
 assert.deepEqual(parseManuscriptExport(exportManuscript(doc)),doc);
 for(const patch of [{paperVariant:'filter'},{textLayout:{title:{...page.textLayout.title,color:'url(https://example.com)'}}},{textLayout:{title:{...page.textLayout.title,fontSize:999}}},{decorations:[{...page.decorations[0],image:'https://example.com/image.png'}]}]) assert.equal(manuscriptSchema.safeParse({...doc,pages:[{...page,...patch}]}).success,false);
});
test('legacy ornaments become removable layers without returning after save', () => {
 const page={...INITIAL.pages[0],decorations:[]};
 const items=getPageDecorations(page,'royal');
 assert.equal(items.length,3);
 assert.equal(items.every(item=>item.asset==='royal-divider'),true);
 assert.deepEqual(getPageDecorations({...page,artworkVersion:3,decorations:[]},'royal'),[]);
 assert.deepEqual(getPageDecorations({...page,ornamentation:false},'royal'),[]);
 assert.equal(getPageDecorations({...page,image:'data:image/png;base64,aGVsbG8='},'royal').some(item=>item.asset==='uploaded'),true);
 assert.deepEqual(parseManuscriptExport({...exportManuscript(INITIAL),version:2}),INITIAL);
});
