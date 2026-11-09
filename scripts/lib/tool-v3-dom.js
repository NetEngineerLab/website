"use strict";
// Small lossless HTML tree: untouched tags, scripts, text and attributes retain
// their original bytes. This avoids reserializing calculator templates/JSON-LD.
const VOID=new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
function parse(html){
 const root={tag:'',children:[]};const stack=[root];let pos=0;
 const tokens=/<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>/g;let m;
 while((m=tokens.exec(html))){
  if(m.index>pos)stack.at(-1).children.push(html.slice(pos,m.index));
  const raw=m[0];pos=tokens.lastIndex;
  if(/^<\//.test(raw)){const tag=raw.match(/^<\/([^\s>]+)/)[1].toLowerCase();let i=stack.length-1;while(i>0&&stack[i].tag!==tag)i--;if(i){stack[i].end=raw;stack.length=i;}else stack.at(-1).children.push(raw);continue;}
  if(/^<!/.test(raw)){stack.at(-1).children.push(raw);continue;}
  const tag=raw.match(/^<([^\s/>]+)/)[1].toLowerCase();const node={tag,start:raw,end:'',children:[]};stack.at(-1).children.push(node);
  if(VOID.has(tag)||/\/>$/.test(raw))continue;
  if(tag==='script'||tag==='style'||tag==='textarea'){const close=new RegExp('</'+tag+'\\s*>','ig');close.lastIndex=pos;const c=close.exec(html);if(c){node.children=[html.slice(pos,c.index)];node.end=c[0];pos=close.lastIndex;tokens.lastIndex=pos;continue;}}
  stack.push(node);
 }
 if(pos<html.length)root.children.push(html.slice(pos));return root;
}
function attr(node,name){if(!node?.start)return '';const m=node.start.match(new RegExp('\\s'+name+'(?:\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+)))?(?=\\s|/?>)','i'));return m?(m[1]??m[2]??m[3]??''):'';}
function set(node,name,value){const re=new RegExp('\\s'+name+'(?:\\s*=\\s*(?:"[^"]*"|\'[^\']*\'|[^\\s>]+))?(?=\\s|/?>)','i');if(re.test(node.start)){node.start=node.start.replace(re,value===null?'':' '+name+'="'+value+'"');}else if(value!==null)node.start=node.start.replace(/\s*\/?>(?=$)/,' '+name+'="'+value+'">');}
function has(node,c){return attr(node,'class').split(/\s+/).includes(c);}
function add(node,...classes){set(node,'class',[...new Set([...attr(node,'class').split(/\s+/).filter(Boolean),...classes])].join(' '));}
function all(node,predicate){const out=[];for(const ch of node.children||[])if(typeof ch!=='string'){if(predicate(ch))out.push(ch);out.push(...all(ch,predicate));}return out;}
function remove(root,node){for(const p of [root,...all(root,()=>true)]){const i=p.children.indexOf(node);if(i>=0){p.children.splice(i,1);return;}}}
function render(n){return typeof n==='string'?n:(n.start||'')+(n.children||[]).map(render).join('')+(n.end||'');}
function el(tag,attrs={},children=[]){return {tag,start:'<'+tag+Object.entries(attrs).map(([k,v])=>' '+k+'="'+v+'"').join('')+'>',end:VOID.has(tag)?'':'</'+tag+'>',children};}
function text(n){return render(n).replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();}
module.exports={parse,attr,set,has,add,all,remove,render,el,text};
