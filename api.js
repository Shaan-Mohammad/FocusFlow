/* FocusFlow cloud sync bridge. The UI continues to work offline; sign in to save it in the API database. */
(() => {
  const $ = (selector, parent=document) => parent.querySelector(selector);
  const base = localStorage.getItem('focusflow_api') || 'http://localhost:8080/api';
  const tokenKey = 'focusflow_token', cloudKey = 'focusflow_cloud_loaded';
  const statusToApi = {Todo:'TODO','In Progress':'IN_PROGRESS',Completed:'COMPLETED'};
  const statusFromApi = {TODO:'Todo',IN_PROGRESS:'In Progress',COMPLETED:'Completed'};
  const priority = p => (p || 'Medium').toUpperCase();
  const request = async (path, options={}) => {
    const token=localStorage.getItem(tokenKey);
    const response=await fetch(base+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...(options.headers||{})}});
    if(!response.ok) throw new Error((await response.json().catch(()=>({}))).message || 'Could not reach FocusFlow API');
    return response.status===204?null:response.json();
  };
  const serialize = () => ({
    tasks: JSON.parse(localStorage.getItem('focusflow_tasks')||'[]').map(t=>({title:t.title,description:t.description||'',status:statusToApi[t.status]||'TODO',priority:priority(t.priority),category:t.category||'',dueDate:t.date||null,dueTime:t.time||null,reminder:null})),
    categories: JSON.parse(localStorage.getItem('focusflow_cats')||'[]').map(c=>({name:c[0],color:c[1]}))
  });
  const apply = data => {
    localStorage.setItem('focusflow_tasks',JSON.stringify(data.tasks.map(t=>({id:t.id,title:t.title,description:t.description||'',priority:t.priority[0]+t.priority.slice(1).toLowerCase(),category:t.category||'Personal',date:t.dueDate||new Date().toISOString().slice(0,10),time:t.dueTime||'',status:statusFromApi[t.status]||'Todo',createdAt:Date.parse(t.createdAt)||Date.now(),completedAt:t.completedAt?Date.parse(t.completedAt):null}))));
    localStorage.setItem('focusflow_cats',JSON.stringify(data.categories.map(c=>[c.name,c.color||'#6058e9','◌'])));
  };
  let pending;
  const sync = () => { if(!localStorage.getItem(tokenKey)) return; clearTimeout(pending); pending=setTimeout(async()=>{try{await request('/sync',{method:'POST',body:JSON.stringify(serialize())});localStorage.setItem(cloudKey,'yes');}catch(e){console.warn(e.message)}},350); };
  const login = async form => { const body={email:form.email.value,password:form.password.value}; const data=await request('/auth/'+(form.mode.value==='register'?'register':'login'),{method:'POST',body:JSON.stringify(form.mode.value==='register'?{...body,name:form.name.value}:body)});localStorage.setItem(tokenKey,data.token);localStorage.setItem('focusflow_user',JSON.stringify({name:data.name,email:data.email})); await request('/sync',{method:'POST',body:JSON.stringify(serialize())});localStorage.setItem(cloudKey,'yes');location.reload(); };
  const dialog = () => { const el=document.createElement('div');el.className='modal-backdrop';el.id='cloud-auth';el.innerHTML=`<div class="modal"><div class="modal-head"><h2>Sync FocusFlow</h2><button class="close">×</button></div><form class="form"><input type="hidden" name="mode" value="login"><p style="color:var(--muted);margin-top:0">Sign in to keep your tasks safely in your database.</p><div class="field name-field" style="display:none"><label>Name</label><input name="name" placeholder="Your name"></div><div class="field"><label>Email</label><input required type="email" name="email" placeholder="you@example.com"></div><div class="field"><label>Password</label><input required minlength="8" type="password" name="password" placeholder="At least 8 characters"></div><p class="auth-error" style="color:var(--danger);font-size:12px"></p><div class="modal-actions"><button type="button" class="secondary toggle-auth">Create an account</button><button class="primary">Sign in</button></div></form></div>`;document.body.append(el);$('.close',el).onclick=()=>el.remove();$('.toggle-auth',el).onclick=()=>{let f=$('form',el),register=f.mode.value==='login';f.mode.value=register?'register':'login';$('.name-field',el).style.display=register?'grid':'none';$('.toggle-auth',el).textContent=register?'I already have an account':'Create an account';$('.primary',el).textContent=register?'Create account':'Sign in'};$('form',el).onsubmit=async e=>{e.preventDefault();try{await login(e.target)}catch(err){$('.auth-error',el).textContent=err.message}}; };
  const addButton = () => { if($('#cloud-sync')) return; const b=document.createElement('button');b.id='cloud-sync';b.className='secondary';b.style.cssText='position:fixed;right:18px;bottom:78px;z-index:8;font-size:12px';b.textContent=localStorage.getItem(tokenKey)?'☁ Synced':'☁ Sign in to sync';b.onclick=dialog;document.body.append(b); };
  const boot = async () => { addButton(); if(!localStorage.getItem(tokenKey)||localStorage.getItem(cloudKey)) return; try{const data=await request('/sync');if(data.tasks.length||data.categories.length)apply(data);localStorage.setItem(cloudKey,'yes');location.reload();}catch(e){console.warn('Cloud sync unavailable',e.message)} };
  new MutationObserver(()=>{addButton();sync()}).observe(document.getElementById('app'),{childList:true,subtree:true});
  window.addEventListener('load',boot);
})();
