/* Shared V3 document navigation. Calculator inputs and engines own their UI. */
(()=>{'use strict';const root=document.querySelector('body.nel-tool-v3[data-nel-v3-migrated]');if(!root)return;
 const toc=root.querySelector('.below > .toc');if(!toc)return;
 const links=[...toc.querySelectorAll('a[href^="#"]')];
 const activate=id=>links.forEach(a=>{const on=a.hash==='#'+id;a.classList.toggle('on',on);if(on)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 function reveal(id){const target=document.getElementById(id);if(!target)return;let node=target;while(node&&node!==root){if(node instanceof HTMLDetailsElement){node.open=true;node.dataset.userToggled='1';}node=node.parentElement;}activate(id);}
 // Match the production OPB runtime: desktop explanations start expanded,
 // while mobile starts collapsed and keeps explicit user changes on resize.
 function syncFolds(){const desktop=matchMedia('(min-width:769px)').matches;root.querySelectorAll('details.fb-fold').forEach(el=>{el.classList.toggle('fb-desktop-open',desktop);if(desktop)el.open=true;else if(el.dataset.userToggled!=='1')el.open=false;if(el.dataset.foldBound)return;el.dataset.foldBound='1';el.addEventListener('toggle',()=>{if(!matchMedia('(min-width:769px)').matches)el.dataset.userToggled='1';});});}
 syncFolds();matchMedia('(min-width:769px)').addEventListener('change',syncFolds);
 root.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;reveal(decodeURIComponent(a.hash.slice(1)));});
 window.addEventListener('hashchange',()=>reveal(decodeURIComponent(location.hash.slice(1))));
 if(location.hash)reveal(decodeURIComponent(location.hash.slice(1)));
 if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{const first=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(first)activate(first.target.id);},{rootMargin:'-90px 0px -60% 0px'});links.forEach(a=>{const target=document.getElementById(a.hash.slice(1));if(target)observer.observe(target);});}
})();
