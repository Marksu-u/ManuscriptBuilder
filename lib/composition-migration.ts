import {baseElement,defaultLayers,type Composition,type Element} from './composition.ts';
import {getPageDecorations,getTextLayout,textSlots,type Page,type ThemeId} from './manuscript-data.ts';
export function composePage(page:Page,theme:ThemeId,defaults:{kicker:string;signature:string;folio:string},names:Record<string,string>):Composition {
 if(page.composition)return page.composition;
 const surface:Element={...baseElement,id:'document-surface',name:names.page,kind:'image',layerId:'page',asset:`${theme}-${page.paperVariant??'clean'}`,x:0,y:0,width:560,height:792};
 const elements:Element[]=[surface,...getPageDecorations(page,theme).map(e=>({...baseElement,id:e.id,name:names[e.asset]??e.asset,kind:'image' as const,asset:e.asset,image:e.image,layerId:e.layer==='behind'?'surface':'above',x:e.x-e.size/2,y:e.y-(e.height??e.size)/2,width:e.size,height:e.height??e.size,rotation:e.rotation,opacity:e.opacity,locked:e.locked})),...textSlots.map(slot=>{const l=getTextLayout(page,slot,theme);return {...baseElement,...l,id:`text:${slot}`,name:names[slot]??slot,kind:'text' as const,text:page[slot]??defaults[slot as keyof typeof defaults]??'',height:slot==='body'?300:slot==='title'?90:30,font:l.font==='theme'?(theme==='dossier'||theme==='datapad'?'mono':'serif'):l.font};})];
 return {version:1,margin:78,background:'transparent',exportArea:'document',surfaceId:surface.id,layers:defaultLayers.map(id=>({id,name:names[id]??id,hidden:false,locked:false})),elements};
}
