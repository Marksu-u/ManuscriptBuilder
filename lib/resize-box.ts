/** Resize in the object's rotated coordinate system while holding the opposite edge fixed. */
export function resizeBox(box:{x:number;y:number;width:number;height:number},rotation:number,handle:string,dx:number,dy:number,proportional=false){
 const angle=rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);const localX=dx*c+dy*s,localY=-dx*s+dy*c;
 let width=Math.max(12,Math.min(1120,box.width+(handle.includes('e')?localX:handle.includes('w')?-localX:0)));
 let height=Math.max(12,Math.min(1584,box.height+(handle.includes('s')?localY:handle.includes('n')?-localY:0)));
 if(proportional&&handle.length===2){const ratio=box.width/box.height;const scale=Math.max(12/box.width,12/box.height,Math.min(width/box.width,height/box.height,1120/box.width,1584/box.height));width=box.width*scale;height=width/ratio;}
 const cx=(width-box.width)*(handle.includes('w')?-.5:handle.includes('e')?.5:0),cy=(height-box.height)*(handle.includes('n')?-.5:handle.includes('s')?.5:0);
 return {x:Math.max(-560,Math.min(1120,box.x+(box.width-width)/2+cx*c-cy*s)),y:Math.max(-792,Math.min(1584,box.y+(box.height-height)/2+cx*s+cy*c)),width,height};
}
