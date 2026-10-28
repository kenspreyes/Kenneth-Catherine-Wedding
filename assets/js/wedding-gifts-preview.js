/* Original-reference gift payment tabs, always visible without the gift-box animation. */
(()=>{'use strict';const root=document.querySelector('#gifts .gift-card');if(!root)return;
const tabs=Array.from(root.querySelectorAll('[role="tab"]'));
function select(tab){const track=root.querySelector('.tabs--small');if(track)track.dataset.selected=tab.id==='tab-bank'?'bank':'gcash';for(const t of tabs){const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));if(panel)panel.hidden=!active;}}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;e.preventDefault();const next=tabs[(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];select(next);next.focus();});});
select(tabs[0]);
root.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const value=button.dataset.copy;try{await navigator.clipboard.writeText(value);const label=button.querySelector('span');if(label){label.textContent='Copied';setTimeout(()=>label.textContent='Copy',1600)}}catch(e){const input=document.createElement('textarea');input.value=value;document.body.append(input);input.select();document.execCommand('copy');input.remove();}}));
})();