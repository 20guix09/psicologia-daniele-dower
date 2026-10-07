const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#navigation');
function setMenu(open) {
 toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
 nav.classList.toggle('open',open);
 document.querySelector('.header').classList.toggle('menu-is-open',open);
}
toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('pointerdown',event=>{if(!document.querySelector('.header').contains(event.target))setMenu(false);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus();}});
window.matchMedia('(min-width: 901px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});
// Abas de exploração: informação de serviços, sem triagem clínica.
const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab, focus = false) {
 tabs.forEach(item => {
  const active = item === tab;
  item.setAttribute('aria-selected', String(active));
  item.tabIndex = active ? 0 : -1;
  document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
 });
 if (focus) tab.focus();
}
tabs.forEach((tab,index) => {
 tab.addEventListener('click',()=>activateTab(tab));
 tab.addEventListener('keydown',event=>{
  let next;
  if(event.key==='ArrowRight'||event.key==='ArrowDown') next=(index+1)%tabs.length;
  if(event.key==='ArrowLeft'||event.key==='ArrowUp') next=(index-1+tabs.length)%tabs.length;
  if(event.key==='Home') next=0;
  if(event.key==='End') next=tabs.length-1;
  if(next!==undefined){event.preventDefault();activateTab(tabs[next],true);}
 });
});
// Seletores personalizados com navegação por teclado.
const dropdowns=[...document.querySelectorAll('.custom-select')];
function closeDropdown(field, focus=false){
 field.querySelector('.select-trigger').setAttribute('aria-expanded','false');
 field.querySelector('.select-options').hidden=true;
 if(focus)field.querySelector('.select-trigger').focus();
}
function setChoice(field,value){
 const option=[...field.querySelectorAll('[role="option"]')].find(item=>item.dataset.value===value);
 if(!option)return;
 field.querySelector('input').value=value;
 clearError(field.querySelector('.select-trigger'));
 field.querySelector('.select-trigger > span').textContent=value;
 field.querySelectorAll('[role="option"]').forEach(item=>item.setAttribute('aria-selected',String(item===option)));
 closeDropdown(field);
}
function openDropdown(field,last=false){
 dropdowns.forEach(item=>{if(item!==field)closeDropdown(item);});
 field.querySelector('.select-options').hidden=false;
 field.querySelector('.select-trigger').setAttribute('aria-expanded','true');
 const options=[...field.querySelectorAll('[role="option"]')];
 (options.find(item=>item.getAttribute('aria-selected')==='true')||options[last?options.length-1:0]).focus();
}
dropdowns.forEach(field=>{
 const trigger=field.querySelector('.select-trigger');
 const options=[...field.querySelectorAll('[role="option"]')];
 trigger.addEventListener('click',()=>trigger.getAttribute('aria-expanded')==='true'?closeDropdown(field):openDropdown(field));
 trigger.addEventListener('keydown',event=>{if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();openDropdown(field,event.key==='ArrowUp');}});
 options.forEach((option,index)=>{
  option.addEventListener('click',()=>{setChoice(field,option.dataset.value);trigger.focus();});
  option.addEventListener('keydown',event=>{
   if(event.key==='ArrowDown'){event.preventDefault();options[(index+1)%options.length].focus();}
   if(event.key==='ArrowUp'){event.preventDefault();options[(index-1+options.length)%options.length].focus();}
   if(event.key==='Home'){event.preventDefault();options[0].focus();}
   if(event.key==='End'){event.preventDefault();options[options.length-1].focus();}
   if(['Enter',' '].includes(event.key)){event.preventDefault();setChoice(field,option.dataset.value);trigger.focus();}
   if(event.key==='Escape'){event.preventDefault();closeDropdown(field,true);}
   if(event.key==='Tab')closeDropdown(field,true);
  });
 });
 field.addEventListener('focusout',event=>{if(event.relatedTarget && !field.contains(event.relatedTarget))closeDropdown(field);});
});
document.addEventListener('click',event=>dropdowns.forEach(field=>{if(!field.contains(event.target))closeDropdown(field);}));
document.querySelectorAll('[data-interest]').forEach(link=>link.addEventListener('click',()=>{
 setChoice(document.querySelector('[data-field="Interesse"]'),link.dataset.interest);
 document.getElementById('contato').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}));
// Máscara brasileira: celular e telefone fixo, inclusive ao colar.
const phoneInput=document.getElementById('contact-phone');
function formatPhone(digits){
 if(!digits)return '';
 if(digits.length<=2)return '('+digits;
 const local=digits.slice(2);
 const split=local.length>8?5:4;
 return '('+digits.slice(0,2)+') '+local.slice(0,split)+(local.length>split?'-'+local.slice(split):'');
}
function maskPhone(){
 const raw=phoneInput.value;
 const caret=phoneInput.selectionStart??raw.length;
 let before=raw.slice(0,caret).replace(/\D/g,'').length;
 let digits=raw.replace(/\D/g,'');
 if((digits.length===12||digits.length===13)&&digits.startsWith('55')){
  digits=digits.slice(2);before=Math.max(0,before-2);
 }
 digits=digits.slice(0,11);
 phoneInput.value=formatPhone(digits);
 let position=0,seen=0;
 while(position<phoneInput.value.length&&seen<before){
  if(/\d/.test(phoneInput.value[position]))seen++;
  position++;
 }
 if(caret===raw.length)position=phoneInput.value.length;
 phoneInput.setSelectionRange(position,position);
}
phoneInput.addEventListener('input',maskPhone);
// Ao apagar um separador, apaga também o algarismo adjacente.
phoneInput.addEventListener('beforeinput',event=>{
 const start=phoneInput.selectionStart,end=phoneInput.selectionEnd;
 if(start!==end||!['deleteContentBackward','deleteContentForward'].includes(event.inputType))return;
 const backwards=event.inputType==='deleteContentBackward';
 let index=backwards?start-1:start;
 if(index<0||index>=phoneInput.value.length||/\d/.test(phoneInput.value[index]))return;
 while(index>=0&&index<phoneInput.value.length&&!/\d/.test(phoneInput.value[index]))index+=backwards?-1:1;
 if(index<0||index>=phoneInput.value.length)return;
 event.preventDefault();
 phoneInput.value=phoneInput.value.slice(0,index)+phoneInput.value.slice(index+1);
 phoneInput.setSelectionRange(index,index);
 phoneInput.dispatchEvent(new Event('input',{bubbles:true}));
});
phoneInput.addEventListener('change',maskPhone);
if(phoneInput.value)maskPhone();
// Validação explícita, com retorno visível em cada campo.
const form=document.getElementById('contact-form');
const recipient=(window.CONTACT_CONFIG?.formSubmitRecipient||'').trim();
const status=form.querySelector('.form-status');
const availability=form.querySelector('.form-availability');
if(recipient){
 form.action='https://formsubmit.co/'+encodeURIComponent(recipient);
}else{
 availability.hidden=false;
 availability.textContent='O envio por formulário está temporariamente indisponível. Você pode conversar com Daniele pelo WhatsApp.';
}
document.getElementById('form-next').value=new URL('obrigado.html',location.href).href;
function clearError(control){
 control.removeAttribute('aria-invalid');
 const errorId=control.dataset.errorId;
 if(errorId){
  document.getElementById(errorId)?.remove();
  control.removeAttribute('aria-describedby');
  delete control.dataset.errorId;
 }
}
function fieldError(control,message){
 clearError(control);
 control.setAttribute('aria-invalid','true');
 const error=document.createElement('span');
 error.className='field-error';
 error.id='error-'+(control.id||control.getAttribute('aria-controls'));
 error.textContent=message;
 control.insertAdjacentElement('afterend',error);
 control.dataset.errorId=error.id;
 control.setAttribute('aria-describedby',error.id);
 return control;
}
form.querySelectorAll('input:not([type="hidden"]),textarea').forEach(control=>{
 control.addEventListener('input',()=>clearError(control));
 control.addEventListener('change',()=>clearError(control));
});
form.addEventListener('submit',event=>{
 event.preventDefault();
 const issues=[];
 form.querySelectorAll('[aria-invalid="true"]').forEach(clearError);
 const name=form.querySelector('[name="name"]');
 const email=form.querySelector('[name="email"]');
 const consent=form.querySelector('[name="Autorização de contato"]');
 name.value=name.value.trim();email.value=email.value.trim();
 if(!name.value)issues.push(fieldError(name,'Informe seu nome.'));
 if(!email.value)issues.push(fieldError(email,'Informe seu e-mail.'));
 else if(!email.validity.valid)issues.push(fieldError(email,'Confira o endereço de e-mail.'));
 dropdowns.forEach(field=>{
  if(!field.querySelector('input').value){
   const message=field.dataset.field==='Interesse'?'Escolha um atendimento ou a opção de dúvidas.':'Escolha um período ou “Sem preferência”.';
   issues.push(fieldError(field.querySelector('.select-trigger'),message));
  }
 });
 if(!consent.checked)issues.push(fieldError(consent,'Marque a autorização para receber um retorno.'));
 if(issues.length){
  status.textContent='Confira os campos destacados para continuar.';
  issues[0].focus();
  return;
 }
 if(!recipient){
  status.textContent='Os campos estão preenchidos corretamente. O envio por e-mail ainda não está ativo; use o botão do WhatsApp para entrar em contato.';
  status.focus({preventScroll:true});
  return;
 }
 status.textContent='Encaminhando sua solicitação…';
 const submit=form.querySelector('[type="submit"]');
 submit.disabled=true;submit.setAttribute('aria-busy','true');
 HTMLFormElement.prototype.submit.call(form);
});
// Libera uma nova tentativa ao voltar da página externa.
addEventListener('pageshow',()=>{
 const submit=form.querySelector('[type="submit"]');
 submit.disabled=false;submit.removeAttribute('aria-busy');
});
// Parallax apenas nas esferas; o conteúdo permanece estável.
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const contactWindow=document.querySelector('.contact-window');
const sphereOne=document.querySelector('.sphere-one');
const sphereTwo=document.querySelector('.sphere-two');
const progress=document.querySelector('.scroll-progress');
let frameRequested=false;
function updateScroll(){
 frameRequested=false;
 const max=document.documentElement.scrollHeight-innerHeight;
 progress.style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,scrollY/max)):0)+')';
 if(reducedMotion.matches){sphereOne.style.transform='none';sphereTwo.style.transform='none';return;}
 const rect=contactWindow.getBoundingClientRect();
 if(rect.bottom>0&&rect.top<innerHeight){
  const shift=Math.max(-160,Math.min(160,(innerHeight*.5-rect.top)*.15));
  sphereOne.style.transform='translate3d(0,'+shift+'px,0)';
  sphereTwo.style.transform='translate3d(0,'+(-shift*.6)+'px,0)';
 }
}
function requestScroll(){if(!frameRequested){frameRequested=true;requestAnimationFrame(updateScroll);}}
addEventListener('scroll',requestScroll,{passive:true});addEventListener('resize',requestScroll);reducedMotion.addEventListener('change',requestScroll);updateScroll();
// Réactions visuelles discrètes au survol; aucun déplacement des textes.
const pointerSurfaces=[...document.querySelectorAll('.service,.reflection-content,.explore-panel')];
pointerSurfaces.forEach(surface=>surface.addEventListener('pointermove',event=>{
 if(reducedMotion.matches||event.pointerType==='touch')return;
 const rect=surface.getBoundingClientRect();
 surface.style.setProperty('--pointer-x',(event.clientX-rect.left)+'px');
 surface.style.setProperty('--pointer-y',(event.clientY-rect.top)+'px');
},{passive:true}));
// Sur mobile: photo qui retrouve ses couleurs, cadres et lignes qui s'illuminent.
const sceneElements=[...document.querySelectorAll('.about-photo,.reflection-card,.journey-grid article,.section-heading')];
if('IntersectionObserver' in window){
 const sceneObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>entry.target.classList.toggle('in-view',entry.isIntersecting));
 },{threshold:.25,rootMargin:'0px 0px -8% 0px'});
 sceneElements.forEach(element=>sceneObserver.observe(element));
}else{sceneElements.forEach(element=>element.classList.add('in-view'));}
// Textos entram uma única vez na leitura, com movimentos curtos e naturais.
if('IntersectionObserver' in window && !reducedMotion.matches){
 const revealTargets=[...document.querySelectorAll('.introduction h2,.intro-right>p,.section-heading h2,.section-heading>p,.about-copy h2,.about-copy>p,.statement p,.faq-grid h2,.contact-copy h2,.contact-copy>p,.journey-grid article h3,.journey-grid article p,.service h3,.service>p,.reflection-content h3,.reflection-content>p')];
 const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target);}
  });
 },{threshold:.08,rootMargin:'0px 0px -25px 0px'});
 revealTargets.forEach((element,index)=>{
  element.setAttribute('data-reveal','');
  if(element.matches('h2'))element.classList.add('reveal-heading');
  element.style.setProperty('--reveal-delay',(index%2)*65+'ms');
  const rect=element.getBoundingClientRect();
  if(rect.top<innerHeight&&rect.bottom>0)element.classList.add('is-visible');
  else revealObserver.observe(element);
 });
 document.documentElement.classList.add('motion-ready');
 reducedMotion.addEventListener('change',event=>{if(event.matches){document.documentElement.classList.remove('motion-ready');revealObserver.disconnect();}});
}
