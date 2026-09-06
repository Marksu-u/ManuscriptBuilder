'use client';
import Image from 'next/image';
import {InkColor,type Ink} from './ink-color';
import {CompositionLayers} from './composition-layers';
import dimensions from '@/lib/asset-dimensions.json';
import {useEffect,useRef,useState} from 'react';
import {useTranslations} from 'next-intl';
import {assetIds,baseElement,bounds,canEdit,fonts,fontIds,formatRange,type Composition,type Element} from '@/lib/composition';
export type PanelMode='inspect'|'insert'|'layers';
type Props={documentColors?:Ink[];value:Composition;selected:string[];onSelect:(ids:string[])=>void;onChange:(c:Composition)=>void;mode:PanelMode;onMode:(mode:PanelMode)=>void;onUpload:(id?:string)=>void};
const surfaceAssets=assetIds.filter(id=>id.endsWith('-clean')||id.endsWith('-worn')||id.endsWith('-object'));
function category(id:string){return surfaceAssets.includes(id as typeof assetIds[number])?'surfaces':id.includes('divider')||id.includes('floral')?'ornaments':/fold|scorch|damage|coffee|blood|crack/.test(id)?'wear':'objects';}
export function CompositionPanel({value,selected,onSelect,onChange,mode,onMode,onUpload,documentColors}:Props){
 const t=useTranslations('workspace.composer');const [query,setQuery]=useState('');const [filter,setFilter]=useState('all');const [pinned,setPinned]=useState(false);const [favorites,setFavorites]=useState<string[]>([]);const [fontQuery,setFontQuery]=useState('');const textInput=useRef<HTMLTextAreaElement>(null);const textRange=useRef<[number,number]>([0,0]);
 useEffect(()=>{const frame=requestAnimationFrame(()=>{try{const saved=JSON.parse(localStorage.getItem('boh-manuscript-favorites')??'[]');if(Array.isArray(saved)&&saved.every(id=>typeof id==='string'))setFavorites(saved);}catch{}});return()=>cancelAnimationFrame(frame);},[]);
 const selectionKey=selected.join(',');
 const panel=useRef<HTMLDivElement>(null);
 useEffect(()=>{panel.current?.closest('.inspector-content')?.scrollTo({top:0});textRange.current=[0,0];},[selectionKey]);
 const items=value.elements.filter(e=>selected.includes(e.id));const e=items.length===1?items[0]:undefined;const locked=e?!canEdit(value,e):false;
 const library=assetIds.filter(id=>id!=='uploaded'&&(filter==='all'||(filter==='favorites'?favorites.includes(id):category(id)===filter))&&`${t(`assets.${id}`)} ${t(category(id))} ${id}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
 const update=(patch:Partial<Element>)=>{if(e)onChange({...value,elements:value.elements.map(o=>o.id===e.id?{...o,...patch}:o)});};
 const modify=(ids:string[],fn:(e:Element)=>Element)=>onChange({...value,elements:value.elements.map(o=>ids.includes(o.id)&&canEdit(value,o)?fn(o):o)});
 const select=(ids:string[])=>{onSelect(ids);if(!pinned)onMode('inspect');};
 const add=(asset?:typeof assetIds[number])=>{if(value.elements.length>=100)return;const isSurface=asset&&surfaceAssets.includes(asset);const id=crypto.randomUUID();const layerId=isSurface?(value.layers.find(l=>l.id==='page')?.id??value.layers[0].id):(value.layers.find(l=>l.id==='content'&&!l.locked)?.id??value.layers.find(l=>!l.locked)?.id);if(!layerId)return;
 const ratio=asset&&asset!=='uploaded'?dimensions[asset][1]/dimensions[asset][0]:1;
 const element:Element={...baseElement,id,name:asset?t(`assets.${asset}`):t('text'),kind:asset?'image':'text',asset,layerId,text:asset?undefined:t('newText'),x:isSurface?0:78,y:isSurface?0:264,width:isSurface?560:asset?180:404,height:isSurface?792:asset?Math.min(500,180*ratio):80};
 // A surface choice replaces only the selected document substrate, preserving every other object.
 const old=isSurface?value.elements.find(o=>o.id===value.surfaceId):undefined;
 if(old&&!canEdit(value,old))return;
 const elements=old?value.elements.map(o=>o.id===old.id?{...element,id:old.id,layerId:old.layerId}:o):[...value.elements,element];
 onChange({...value,elements,...(isSurface?{surfaceId:old?.id??id}:{})});select([old?.id??id]);};
 const num=(key:string,val:number,min:number,max:number,change:(v:number)=>void,disabled=false)=><label className="composer-number"><span>{t(key)}</span><input aria-label={t(key)} type="number" min={min} max={max} value={Math.round(val*100)/100} disabled={disabled} onChange={ev=>{if(ev.target.value!==''){const n=Number(ev.target.value);if(Number.isFinite(n))change(Math.max(min,Math.min(max,n)));}}}/></label>;
 const check=(key:string,val:boolean,change:(v:boolean)=>void,disabled=false)=><label className="art-check"><input type="checkbox" checked={val} disabled={disabled} onChange={ev=>change(ev.target.checked)}/>{t(key)}</label>;
 function duplicate(){if(value.elements.length+items.length>100)return;const groups=new Map<string,string>();const copies=items.map(o=>{if(o.group&&!groups.has(o.group))groups.set(o.group,crypto.randomUUID());return {...o,id:crypto.randomUUID(),group:o.group?groups.get(o.group):undefined,name:o.name,x:Math.min(1120,o.x+16),y:Math.min(1584,o.y+16),locked:false};});onChange({...value,elements:[...value.elements,...copies]});onSelect(copies.map(o=>o.id));}
 function align(axis:'x'|'y',center=false){const eligible=items.filter(o=>canEdit(value,o)&&!o.flow);if(!eligible.length)return;const b=bounds(eligible);modify(eligible.map(o=>o.id),o=>({...o,[axis]:center?b[axis]+(axis==='x'?b.width-o.width:b.height-o.height)/2:b[axis]}));}
 function distribute(axis:'x'|'y'){const list=items.filter(o=>canEdit(value,o)&&!o.flow).sort((a,b)=>a[axis]-b[axis]);if(list.length<3)return;const size=axis==='x'?'width':'height';const first=list[0],last=list.at(-1)!;const gap=(last[axis]+last[size]-first[axis]-list.reduce((sum,o)=>sum+o[size],0))/(list.length-1);let at=first[axis];const positions=new Map(list.map(o=>{const pos=at;at+=o[size]+gap;return [o.id,pos];}));modify(list.map(o=>o.id),o=>({...o,[axis]:positions.get(o.id)!}));}
 function reorder(id:string,direction:number){const list=[...value.elements];const index=list.findIndex(o=>o.id===id),next=index+direction;if(next<0||next>=list.length)return;[list[index],list[next]]=[list[next],list[index]];onChange({...value,elements:list});}
 function applyText(patch:Partial<NonNullable<Element['runs']>[number]>){if(!e||locked)return;const [start,end]=textRange.current;if(end>start){const result=formatRange(e,start,end,patch);update({runs:result.runs});}else if(patch.font)update({font:patch.font,runs:undefined});else update({runs:[{text:e.text??'',font:e.font,bold:false,italic:false,...patch}]});}
 return <div ref={panel} className="composer-panel">
 {mode==='insert'?<>
  <div className="composer-row"><h3>{t('insert')}</h3>{check('pin',pinned,setPinned)}</div>
  <input aria-label={t('search')} placeholder={t('search')} value={query} onChange={ev=>setQuery(ev.target.value)}/>
  <select aria-label={t('category')} value={filter} onChange={ev=>setFilter(ev.target.value)}>{['all','surfaces','ornaments','wear','objects','favorites'].map(id=><option key={id} value={id}>{t(id)}</option>)}</select>
  <div className="art-actions"><button type="button" disabled={value.elements.length>=100} onClick={()=>add()}>{t('addText')}</button><button type="button" disabled={value.elements.length>=100} onClick={()=>onUpload()}>{t('upload')}</button></div>
  <p className="art-help">{t('surfaceHelp')}</p>
  <p role="status" className="art-help">{library.length?t('libraryCount',{count:library.length}):t('noResults')}</p><div className="composer-library">{library.map(id=><div key={id} className="composer-card"><button type="button" disabled={value.elements.length>=100} aria-label={t('add',{name:t(`assets.${id}`)})} onClick={()=>add(id)}><Image unoptimized width={110} height={100} src={`/art/${id}.png`} alt=""/><span>{t(`assets.${id}`)}</span></button><button type="button" className="favorite" aria-label={t('favorite',{name:t(`assets.${id}`)})} aria-pressed={favorites.includes(id)} onClick={()=>{const next=favorites.includes(id)?favorites.filter(f=>f!==id):[...favorites,id];setFavorites(next);try{localStorage.setItem('boh-manuscript-favorites',JSON.stringify(next));}catch{}}}>{favorites.includes(id)?'★':'☆'}</button></div>)}</div>
  {value.elements.length>=100&&<p role="status">{t('limit')}</p>}
 </>:mode==='layers'?<>
  <CompositionLayers value={value} selected={selected} onSelect={onSelect} onChange={onChange} onInspect={()=>onMode('inspect')}/>
 </>:!items.length?<>
  <h3>{t('document')}</h3><p className="art-help">{t('selectHelp')}</p>
  {num('margin',value.margin,0,180,margin=>onChange({...value,margin}))}
  <label>{t('background')}<input type="color" aria-label={t('background')} value={value.background==='transparent'?'#ffffff':value.background} onChange={ev=>onChange({...value,background:ev.target.value})}/></label>
  {check('transparent',value.background==='transparent',checked=>onChange({...value,background:checked?'transparent':'#ffffff'}))}
  <label>{t('exportArea')}<select aria-label={t('exportArea')} value={value.exportArea} onChange={ev=>onChange({...value,exportArea:ev.target.value as Composition['exportArea']})}><option value="document">{t('document')}</option><option value="composition">{t('composition')}</option></select></label>
  <p className="art-help">{t('exportHelp')}</p><button type="button" onClick={()=>onMode('insert')}>{t('insert')}</button>
 </>:<>
  <div className="composer-row"><h3>{e?e.name:t('selection',{count:items.length})}</h3><button type="button" onClick={()=>onSelect([])}>{t('deselect')}</button></div>
  {e?<>
   <label>{t('name')}<input aria-label={t('name')} maxLength={100} value={e.name} disabled={locked} onChange={ev=>update({name:ev.target.value})}/></label>
   {e.kind==='text'?<>
    <textarea ref={textInput} aria-label={t('textContent')} rows={4} value={e.text??''} maxLength={12000} disabled={locked} onSelect={ev=>{textRange.current=[ev.currentTarget.selectionStart,ev.currentTarget.selectionEnd];}} onChange={ev=>update({text:ev.target.value,runs:undefined})}/>
    <p className="art-help">{t('rangeHelp')}</p>
    <div className="art-actions"><button type="button" disabled={locked} onClick={()=>applyText({bold:true})}>{t('bold')}</button><button type="button" disabled={locked} onClick={()=>applyText({italic:true})}>{t('italic')}</button><button type="button" disabled={locked} onClick={()=>applyText({bold:false,italic:false})}>{t('regular')}</button></div>
    <input aria-label={t('fontSearch')} placeholder={t('fontSearch')} value={fontQuery} onChange={ev=>setFontQuery(ev.target.value)}/>
    <div className="composer-fonts">{fontIds.filter(id=>t(`fonts.${id}`).toLocaleLowerCase().includes(fontQuery.toLocaleLowerCase())).map(id=><button type="button" key={id} disabled={locked} aria-pressed={e.font===id} style={{fontFamily:fonts[id]}} onClick={()=>applyText({font:id})}><small>{t(`fonts.${id}`).split(' · ')[0]}</small><span>{t(`fonts.${id}`).split(' · ').slice(1).join(' · ')||t(`fonts.${id}`)}</span></button>)}</div>
    {num('fontSize',e.fontSize,8,96,fontSize=>update({fontSize}),locked)}<InkColor key={selectionKey+mode} color={e.color} opacity={e.opacity} disabled={locked} onChange={update} colors={documentColors??value.elements.filter(o=>o.kind==='text').map(o=>({color:o.color,opacity:o.opacity}))}/>
    <label>{t('alignment')}<select aria-label={t('alignment')} value={e.align} disabled={locked} onChange={ev=>update({align:ev.target.value as Element['align']})}>{['left','center','right'].map(id=><option key={id} value={id}>{t(id)}</option>)}</select></label>
   </>:<><label>{t('replace')}<select aria-label={t('replace')} value={e.asset} disabled={locked} onChange={ev=>{const asset=ev.target.value as Element['asset'];if(asset==='uploaded')onUpload(e.id);else update({asset,image:undefined});}}>{assetIds.map(id=><option key={id} value={id}>{t(`assets.${id}`)}</option>)}</select></label><button type="button" disabled={locked} onClick={()=>onUpload(e.id)}>{t('upload')}</button></>}
   <label>{t('placement')}<select aria-label={t('placement')} value={e.flow?'flow':'free'} disabled={locked||e.id===value.surfaceId} onChange={ev=>update({flow:ev.target.value==='flow',rotation:0})}><option value="free">{t('free')}</option><option value="flow">{t('flow')}</option></select></label>
   {e.flow&&<p className="art-help">{t('flowHelp')}</p>}
   <div className="composer-grid">{num('width',e.width,12,1120,width=>update({width}),locked||e.flow)}{e.kind==='image'&&num('height',e.height,12,1584,height=>update({height}),locked)}</div>
   <details><summary>{t('advanced')}</summary>
    <div className="composer-grid">{num('x',e.x,-560,1120,x=>update({x}),locked||e.flow)}{num('y',e.y,-792,1584,y=>update({y}),locked||e.flow)}{num('rotation',e.rotation,-180,180,rotation=>update({rotation}),locked||e.flow)}{e.kind==='image'&&num('opacity',e.opacity*100,0,100,opacity=>update({opacity:opacity/100}),locked)}</div>
    {check('clip',e.clip,clip=>update({clip}),locked)}
    <label>{t('layer')}<select aria-label={t('layer')} value={e.layerId} disabled={locked} onChange={ev=>update({layerId:ev.target.value})}>{value.layers.map(l=><option key={l.id} value={l.id} disabled={l.locked}>{l.name}</option>)}</select></label>
    <div className="art-actions"><button type="button" disabled={locked||value.elements.indexOf(e)===0} onClick={()=>reorder(e.id,-1)}>{t('lower')}</button><button type="button" disabled={locked||value.elements.indexOf(e)===value.elements.length-1} onClick={()=>reorder(e.id,1)}>{t('raise')}</button></div>
   </details>
   <div className="composer-row">{check('hidden',e.hidden,hidden=>update({hidden}),locked)}{check('locked',e.locked,locked=>update({locked}),Boolean(value.layers.find(l=>l.id===e.layerId)?.locked))}</div>
  </>:<>
   <p className="art-help">{t('multiHelp')}</p>
   {items[0].group&&items.every(o=>o.group===items[0].group)&&<label>{t('groupName')}<input aria-label={t('groupName')} maxLength={60} value={items[0].groupName??''} onChange={ev=>modify(selected,o=>({...o,groupName:ev.target.value}))}/></label>}
   <label>{t('layer')}<select aria-label={t('layer')} value={items.every(o=>o.layerId===items[0].layerId)?items[0].layerId:''} onChange={ev=>modify(selected,o=>({...o,layerId:ev.target.value}))}><option value="" disabled>{t('mixed')}</option>{value.layers.map(l=><option key={l.id} value={l.id} disabled={l.locked}>{l.name}</option>)}</select></label>
   <div className="composer-row">{check('hidden',items.every(o=>o.hidden),hidden=>modify(selected,o=>({...o,hidden})))}{check('locked',items.every(o=>o.locked),locked=>onChange({...value,elements:value.elements.map(o=>selected.includes(o.id)&&!value.layers.find(l=>l.id===o.layerId)?.locked?{...o,locked}:o)}))}</div>
   {items.some(o=>o.kind==='text')&&<InkColor key={selectionKey+mode} color={items.find(o=>o.kind==='text')!.color} opacity={items.find(o=>o.kind==='text')!.opacity} onChange={ink=>modify(selected,o=>o.kind==='text'?{...o,...ink}:o)} colors={documentColors??value.elements.filter(o=>o.kind==='text').map(o=>({color:o.color,opacity:o.opacity}))}/>}
   <div className="composer-grid"><button type="button" onClick={()=>align('x')}>{t('alignLeft')}</button><button type="button" onClick={()=>align('y')}>{t('alignTop')}</button><button type="button" onClick={()=>align('x',true)}>{t('centerX')}</button><button type="button" onClick={()=>align('y',true)}>{t('centerY')}</button><button type="button" disabled={items.length<3} onClick={()=>distribute('x')}>{t('distributeX')}</button><button type="button" disabled={items.length<3} onClick={()=>distribute('y')}>{t('distributeY')}</button><button type="button" onClick={()=>{const group=crypto.randomUUID();modify(selected,o=>({...o,group,groupName:t('group')}));}}>{t('group')}</button><button type="button" onClick={()=>modify(selected,o=>({...o,group:undefined,groupName:undefined}))}>{t('ungroup')}</button></div>
  </>}
  {e?.group&&<button type="button" disabled={locked} onClick={()=>modify(value.elements.filter(o=>o.group===e.group).map(o=>o.id),o=>({...o,group:undefined,groupName:undefined}))}>{t('ungroup')}</button>}
  <div className="art-actions"><button type="button" disabled={value.elements.length+items.length>100} onClick={duplicate}>{t('duplicate')}</button><button type="button" disabled={items.every(o=>!canEdit(value,o))} onClick={()=>{const elements=value.elements.filter(o=>!selected.includes(o.id)||!canEdit(value,o));onChange({...value,elements,surfaceId:elements.some(o=>o.id===value.surfaceId)?value.surfaceId:undefined});onSelect([]);}}>{t('remove')}</button></div>
 </>}
 </div>;
}
