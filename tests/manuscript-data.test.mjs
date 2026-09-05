import test from 'node:test';
import assert from 'node:assert/strict';
import {INITIAL,manuscriptSchema,blankManuscript,exportManuscript,parseManuscriptExport} from '../lib/manuscript-data.ts';

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
 assert.equal(exported.version,1);
 assert.deepEqual(parseManuscriptExport(exported),INITIAL);
 assert.deepEqual(parseManuscriptExport(INITIAL),INITIAL);
 assert.equal(parseManuscriptExport({version:2,manuscript:INITIAL}),null);
});
