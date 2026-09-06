import { z } from 'zod';

export const assetIds = ['royal-clean','royal-worn','arcane-clean','arcane-worn','datapad-clean','datapad-worn','dossier-clean','dossier-worn','scroll-object','tablet-object','notebook-object','wax-seal','royal-floral','arcane-sigil','blood-stain','glass-crack','evidence-tape','royal-fold','arcane-scorch','datapad-damage','dossier-coffee','royal-divider','arcane-divider','datapad-divider','dossier-divider','ribbon-tail','paperclip','binder-clip','pressed-flower','polaroid-frame','brass-key','circuit-module','postage-stamp','torn-note','uploaded'] as const;
export const fontIds = ['serif','sans','mono','book','hand','calligraphy','blackletter','typewriter','technical'] as const;
export const fonts: Record<typeof fontIds[number],string> = {serif:'Georgia, serif',sans:'var(--font-geist-sans), sans-serif',mono:'var(--font-geist-mono), monospace',book:'var(--font-book), serif',hand:'var(--font-hand), cursive',calligraphy:'var(--font-calligraphy), cursive',blackletter:'var(--font-blackletter), serif',typewriter:'var(--font-typewriter), monospace',technical:'var(--font-technical), sans-serif'};
const id = z.string().min(1).max(100);
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const runSchema = z.object({text:z.string().max(12000),font:z.enum(fontIds),bold:z.boolean(),italic:z.boolean()});
export const elementSchema = z.object({id,name:z.string().max(100),kind:z.enum(['text','image']),layerId:id,group:z.string().max(100).optional(),groupName:z.string().max(60).optional(),x:z.number().min(-560).max(1120),y:z.number().min(-792).max(1584),width:z.number().min(12).max(1120),height:z.number().min(12).max(1584),rotation:z.number().min(-180).max(180),opacity:z.number().min(0).max(1),locked:z.boolean(),hidden:z.boolean(),clip:z.boolean(),flow:z.boolean(),asset:z.enum(assetIds).optional(),image:z.string().max(1_000_000).regex(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/).optional(),text:z.string().max(12000).optional(),font:z.enum(fontIds),fontSize:z.number().min(8).max(96),color,align:z.enum(['left','center','right']),runs:z.array(runSchema).max(200).optional()}).superRefine((e,c)=>{if(e.kind==='image'&&(!e.asset||(e.asset==='uploaded'&&!e.image)))c.addIssue({code:'custom',message:'Image assets require an allowed source.'}); if(e.runs && e.runs.map(r=>r.text).join('')!==e.text)c.addIssue({code:'custom',message:'Text runs must match text.'});});
export const compositionSchema = z.object({version:z.literal(1),margin:z.number().min(0).max(180),background:z.union([color,z.literal('transparent')]),exportArea:z.enum(['document','composition']),surfaceId:id.optional(),layers:z.array(z.object({id,name:z.string().min(1).max(60),hidden:z.boolean(),locked:z.boolean()})).min(1).max(24),elements:z.array(elementSchema).max(100)}).superRefine((v,c)=>{const ids=new Set(v.layers.map(l=>l.id));if(ids.size!==v.layers.length||new Set(v.elements.map(e=>e.id)).size!==v.elements.length||v.elements.some(e=>!ids.has(e.layerId))||(v.surfaceId&&!v.elements.some(e=>e.id===v.surfaceId)))c.addIssue({code:'custom',message:'Invalid layer or surface references.'});});
export type Composition = z.infer<typeof compositionSchema>;
export type Element = z.infer<typeof elementSchema>;
export type Layer = Composition['layers'][number];
export const baseElement: Omit<Element,'id'|'name'|'kind'> = {layerId:'content',x:78,y:264,width:404,height:80,rotation:0,opacity:1,locked:false,hidden:false,clip:false,flow:false,font:'serif',fontSize:15,color:'#352719',align:'left'};
export const defaultLayers = ['background','behind','page','surface','content','above','foreground'];
export function canEdit(c:Composition,e:Element){return !e.locked&&!c.layers.find(l=>l.id===e.layerId)?.locked;}
export function visible(c:Composition,e:Element){return !e.hidden&&!c.layers.find(l=>l.id===e.layerId)?.hidden;}
export type Box={x:number;y:number;width:number;height:number};
export function bounds(items:Box[]):Box { const x=Math.min(...items.map(e=>e.x)),y=Math.min(...items.map(e=>e.y));return {x,y,width:Math.max(...items.map(e=>e.x+e.width))-x,height:Math.max(...items.map(e=>e.y+e.height))-y}; }
export function snapBox(box:Box, others:Box[],margin:number,threshold=6){
 const guides:{axis:'x'|'y';position:number}[]=[];const result={x:box.x,y:box.y};
 for(const axis of ['x','y'] as const){const dim=axis==='x'?'width':'height',max=axis==='x'?560:792;
  const targets=[0,margin,max/2,max-margin,max,...others.flatMap(o=>[o[axis],o[axis]+o[dim]/2,o[axis]+o[dim]])];
  // Equal spacing between surrounding objects is another valid snap target.
  for(const a of others)for(const b of others)if(b[axis]>=a[axis]+a[dim]+box[dim])targets.push((a[axis]+a[dim]+b[axis]-box[dim])/2+box[dim]/2);
  let best=threshold+1,delta=0,guide=0;
  for(const offset of [0,box[dim]/2,box[dim]])for(const target of targets){const d=target-box[axis]-offset;if(Math.abs(d)<best){best=Math.abs(d);delta=d;guide=target;}}
  if(best<=threshold){result[axis]+=delta;guides.push({axis,position:guide});}
 }return {...result,guides};
}
export function formatRange(e:Element,start:number,end:number,patch:Partial<NonNullable<Element['runs']>[number]>):Element {
 const runs=e.runs??[{text:e.text??'',font:e.font,bold:false,italic:false}];let at=0;const next:NonNullable<Element['runs']>=[];
 for(const run of runs){const a=Math.max(0,start-at),b=Math.min(run.text.length,end-at);if(a<b){if(a)next.push({...run,text:run.text.slice(0,a)});next.push({...run,...patch,text:run.text.slice(a,b)});if(b<run.text.length)next.push({...run,text:run.text.slice(b)});}else next.push(run);at+=run.text.length;}
 return next.length<=200?{...e,runs:next}:e;
}
export function blankComposition(title:string,body:string,names:Record<string,string>={}):Composition {
 return {version:1,margin:78,background:'transparent',exportArea:'document',surfaceId:'document-surface',layers:defaultLayers.map(id=>({id,name:names[id]??id,hidden:false,locked:false})),elements:[{...baseElement,id:'document-surface',name:names.page??'Document',kind:'image',layerId:'page',asset:'dossier-clean',x:0,y:0,width:560,height:792},{...baseElement,id:'text:title',name:names.title??title,kind:'text',text:title,x:78,y:100,fontSize:30,height:90},{...baseElement,id:'text:body',name:names.body??'Text',kind:'text',text:body,x:78,y:220,height:300}]};
}
// Ratios describe the writing area within each physical substrate, independent of its position and size.
export function writingBounds(c:Composition):Box {
 const e=c.elements.find(e=>e.id===c.surfaceId);if(!e)return {x:0,y:0,width:560,height:792};
 const inset=e.asset==='tablet-object'?[.13,.12,.74,.75]:e.asset==='scroll-object'?[.12,.14,.76,.73]:e.asset==='notebook-object'?[.15,.09,.77,.83]:[0,0,1,1];
 return {x:e.x+e.width*inset[0],y:e.y+e.height*inset[1],width:e.width*inset[2],height:e.height*inset[3]};
}
