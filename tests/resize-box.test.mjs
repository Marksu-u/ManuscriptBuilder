import test from 'node:test';
import assert from 'node:assert/strict';
import {resizeBox} from '../lib/resize-box.ts';
const box={x:50,y:70,width:100,height:200};
test('resize holds the opposite corner fixed',()=>{assert.deepEqual(resizeBox(box,0,'nw',20,30),{x:70,y:100,width:80,height:170});});
test('rotated resize follows local axes and fixes opposite edge',()=>{const result=resizeBox(box,90,'e',0,20);assert.equal(result.width,120);assert.equal(result.x,40);assert.equal(result.y,80);});
test('resize clamps dimensions and supports proportional corners',()=>{assert.equal(resizeBox(box,0,'w',300,0).width,12);const result=resizeBox(box,0,'se',50,100,true);assert.equal(result.width/result.height,.5);assert.equal(result.x,50);assert.equal(result.y,70);});
