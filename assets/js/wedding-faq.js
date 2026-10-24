/* Wedding chat FAQ — inspired by the supplied reference, independently integrated. */
(()=>{'use strict';
const root=document.querySelector('#faq.kc-chat-faq');if(!root)return;
const thread=root.querySelector('.kc-chat-thread'),questions=[...root.querySelectorAll('.kc-qa')],reset=root.querySelector('.kc-chat-reset');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let busy=false,timers=[],generation=0;
function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);}
function scrollThread(){thread.scrollTo({top:thread.scrollHeight,behavior:reduce?'instant':'smooth'});}
function addBubble(text,who){const li=document.createElement('li');li.className='kc-bubble kc-bubble-'+who+(reduce?'':' kc-bubble-enter');li.textContent=text;thread.appendChild(li);scrollThread();return li;}
function ask(item){if(busy)return;busy=true;const token=generation;item.classList.add('is-asked');addBubble(item.querySelector('summary').textContent.trim(),'me');
const answer=()=>{if(token!==generation)return;const typing=document.createElement('li');typing.className='kc-bubble kc-bubble-them kc-bubble-typing';typing.setAttribute('aria-label','Typing');typing.innerHTML='<i></i><i></i><i></i>';thread.appendChild(typing);scrollThread();
later(()=>{if(token!==generation)return;typing.remove();addBubble(item.querySelector('.kc-qa-answer').textContent.trim(),'them');busy=false;},reduce?0:850);};
if(reduce)answer();else later(answer,280);}
questions.forEach(item=>item.querySelector('summary').addEventListener('click',e=>{e.preventDefault();ask(item);}));
if(reset)reset.addEventListener('click',()=>{generation++;timers.forEach(clearTimeout);timers=[];busy=false;thread.replaceChildren();addBubble('Hi! Ask us anything.','them');questions.forEach(item=>{item.classList.remove('is-asked');item.open=false;});});
})();
