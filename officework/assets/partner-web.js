(() => {
  'use strict';
  const root = document.getElementById('partner-web-app');
  if (!root) return;
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = v => Number(v || 0).toLocaleString('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:2});
  const empty = message => `<div class="web-empty">${esc(message)}</div>`;
  const tokenKey = 'aimedix_provider_token';
  let token = localStorage.getItem(tokenKey) || '';
  let model = {provider:null,data:[],analytics:{},patients:[],products:[],orders:[],lab_tests:[],messages:[]};
  const friendly = e => !navigator.onLine ? 'You appear to be offline. Check your connection and try again.' : (e?.message || 'We could not complete this request. Please try again.');
  const status = (message, error=false) => { $('#partner-global-status').innerHTML = message ? `<div class="web-status${error?' error':''}">${esc(message)}</div>` : ''; };

  async function api(path, options={}) {
    const headers = {'Accept':'application/json', ...(options.body?{'Content-Type':'application/json'}:{}), ...(options.headers||{})};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(path, {...options, headers});
    const payload = await response.json().catch(()=>({}));
    if (!response.ok) {
      if (response.status === 401 && path !== '/api/v1/providers/login') logout(false);
      throw new Error(payload.message || `Request failed (${response.status})`);
    }
    return payload;
  }
  $$('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $$('.web-tab[data-tab]',root).forEach(button=>button.addEventListener('click',()=>showTab(button.dataset.tab)));
  function showTab(name){
    $$('.web-tab[data-tab]',root).forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    $$('.web-panel[data-panel]',root).forEach(p=>p.classList.toggle('active',p.dataset.panel===name));
    if(name==='messages') loadMessages();
  }
  function logout(notify=true){
    token=''; localStorage.removeItem(tokenKey); model.provider=null;
    $('#partner-login-panel').hidden=false; $('#partner-dashboard').hidden=true; $('#partner-logout').hidden=true;
    if(notify) status('Signed out.');
  }
  $('#partner-logout').addEventListener('click',()=>logout());
  $('#partner-login-form').addEventListener('submit',async event=>{
    event.preventDefault(); const button=$('button[type=submit]',event.currentTarget); button.disabled=true;
    try {
      const body=Object.fromEntries(new FormData(event.currentTarget));
      const payload=await api('/api/v1/providers/login',{method:'POST',body:JSON.stringify(body)});
      token=payload.token; localStorage.setItem(tokenKey,token); model.provider=payload.data;
      await loadDashboard(); status('Signed in successfully.');
    } catch(e) { status(friendly(e),true); } finally { button.disabled=false; }
  });
  async function loadDashboard(){
    try {
      const payload=await api('/api/v1/providers/tasks'); model={...model,...payload}; render();
      $('#partner-login-panel').hidden=true; $('#partner-dashboard').hidden=false; $('#partner-logout').hidden=false;
    } catch(e) { status(friendly(e),true); }
  }
  function render(){
    const p=model.provider||{}, role=p.provider_type||'', a=model.analytics||{};
    $('#partner-welcome').textContent=`Welcome, ${p.business_name||p.name||'Partner'}`;
    $('#partner-stats').innerHTML=[['Total work',a.total_tasks],['Needs attention',a.pending_tasks],['Completed',a.completed_tasks],['Revenue',money(a.revenue)]].map(([k,v])=>`<div class="web-stat"><span>${esc(k)}</span><strong>${esc(v||0)}</strong></div>`).join('');
    $('#partner-summary').innerHTML=`<div class="web-row"><div><strong>${esc(roleLabel(role))}</strong><p>${esc(p.city||'')} · ${esc(p.status||'approved')}</p></div><span class="pill">${Number(a.pending_tasks||0)} pending</span></div>`;
    $('#partner-task-title').textContent=role==='pharmacy'?'Prescription requests':role==='lab'?'Lab appointments':'Consultation appointments';
    renderTasks(role); renderCatalog(role); renderPatients(); fillProfile(role);
    $('#partner-order-title').hidden=role!=='pharmacy';
    $('#partner-orders').innerHTML=role==='pharmacy'?renderOrderList(model.orders||[]):'';
  }
  const roleLabel=role=>role==='pharmacy'?'Pharmacy workspace':role==='lab'?'Diagnostic laboratory':'Doctor / clinic';
  const transitions={
    lab:{requested:['accepted','cancelled'],accepted:['sample_collected','cancelled'],sample_collected:['processing','cancelled'],processing:['completed','cancelled']},
    doctor:{requested:['confirmed','cancelled'],confirmed:['in_progress','cancelled'],in_progress:['completed','cancelled']}
  };
  function renderTasks(role){
    const items=model.data||[];
    $('#partner-tasks').innerHTML=items.length?items.map(item=>{
      const current=String(item.status||''), next=role==='pharmacy'?[]:(transitions[role]?.[current]||[]);
      return `<article class="web-card web-row"><div><strong>${esc(item.customer_name||'Patient')} · #${Number(item.id)}</strong><p>${esc(item.customer_phone||'')} · ${esc(current.replaceAll('_',' '))}</p><p>${esc(item.test_name||item.reason||item.note||'')}</p></div><div class="web-actions">${role==='pharmacy'?`<button class="btn btn-outline" data-view-rx="${Number(item.id)}">View prescription</button><button class="btn btn-dark" data-create-quote="${Number(item.id)}">Create quote</button>`:''}${role==='lab'&&current==='processing'?`<button class="btn btn-orange" data-upload-report="${Number(item.id)}">Upload report</button>`:''}${role==='doctor'?`<button class="btn btn-outline" data-connect="${Number(item.id)}">Consultation details</button>`:''}${next.map(value=>`<button class="btn btn-outline" data-task-status="${Number(item.id)}" data-next="${esc(value)}" data-kind="${role==='lab'?'lab':'consultation'}">${esc(value.replaceAll('_',' '))}</button>`).join('')}</div></article>`;
    }).join(''):empty('No tasks are assigned right now.');
    $$('[data-view-rx]').forEach(b=>b.addEventListener('click',()=>openPrivateDocument(`/api/v1/medical/documents/prescription-request/${b.dataset.viewRx}`)));
    $$('[data-create-quote]').forEach(b=>b.addEventListener('click',()=>createQuote(Number(b.dataset.createQuote))));
    $$('[data-task-status]').forEach(b=>b.addEventListener('click',()=>updateTask(b.dataset.kind,Number(b.dataset.taskStatus),b.dataset.next)));
    $$('[data-upload-report]').forEach(b=>b.addEventListener('click',()=>uploadReport(Number(b.dataset.uploadReport))));
    $$('[data-connect]').forEach(b=>b.addEventListener('click',()=>consultationDetails(Number(b.dataset.connect))));
  }
  async function openPrivateDocument(path){
    const preview=window.open('about:blank','_blank');
    try { const response=await fetch(path,{headers:{Authorization:`Bearer ${token}`,Accept:'application/octet-stream'}}); if(!response.ok){const p=await response.json().catch(()=>({}));throw new Error(p.message||'Document could not be opened.');} const url=URL.createObjectURL(await response.blob());if(preview)preview.location.href=url;else window.location.href=url;setTimeout(()=>URL.revokeObjectURL(url),60000); } catch(e){if(preview)preview.close();status(friendly(e),true);}
  }
  async function updateTask(kind,id,next){try{const p=await api(`/api/v1/providers/${kind}/${id}/status`,{method:'POST',body:JSON.stringify({status:next})});status(p.message||'Status updated.');await loadDashboard();}catch(e){status(friendly(e),true);}}
  async function createQuote(id){
    const medicine=prompt('Medicine name'); if(!medicine)return; const pack=prompt('Pack / strength (optional)')||''; const quantity=Number(prompt('Quantity','1')||1); const price=Number(prompt('Unit price','0')||0); const tax=Number(prompt('Tax amount','0')||0); const delivery=Number(prompt('Delivery fee','0')||0);
    try{const p=await api(`/api/v1/providers/prescription-requests/${id}/quote`,{method:'POST',body:JSON.stringify({items:[{medicine_name:medicine,pack,quantity,unit_price:price,tax_amount:tax}],delivery_fee:delivery})});status(`${p.message||'Quote sent'} Total ${money(p.total)}.`);await loadDashboard();}catch(e){status(friendly(e),true);}
  }
  async function uploadReport(id){
    const input=document.createElement('input');input.type='file';input.accept='image/jpeg,image/png,image/webp,application/pdf';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{const data=await fileBase64(file);const note=prompt('Report note (optional)')||'';const p=await api(`/api/v1/providers/lab-bookings/${id}/report`,{method:'POST',body:JSON.stringify({report_base64:data,file_name:file.name,provider_note:note})});status(p.message||'Report uploaded.');await loadDashboard();}catch(e){status(friendly(e),true);}};input.click();
  }
  async function consultationDetails(id){
    const meeting=prompt('Online meeting or call URL (leave blank for offline appointment)','')??''; const note=prompt('Clinical note (optional)','')??'';
    try{const p=await api(`/api/v1/providers/consultations/${id}/connect`,{method:'POST',body:JSON.stringify({meeting_url:meeting,clinical_note:note})});status(p.message||'Consultation updated.');}catch(e){status(friendly(e),true);}
  }
  function renderOrderList(items){
    return items.length?items.map(order=>`<article class="web-card web-row"><div><strong>${esc(order.order_number||`Order #${order.id}`)}</strong><p>${esc(order.customer_name||'')} · ${esc(String(order.order_status||'').replaceAll('_',' '))}</p><p>${money(order.order_amount)}</p></div><div class="web-actions">${orderNext(order.order_status).map(next=>`<button class="btn btn-outline" data-order-status="${Number(order.id)}" data-next="${esc(next)}">${esc(next.replaceAll('_',' '))}</button>`).join('')}</div></article>`).join(''):empty('No medicine orders yet.');
  }
  function orderNext(current){return ({pending:['confirmed','cancelled'],confirmed:['processing','cancelled'],processing:['ready_for_pickup','cancelled'],ready_for_pickup:['out_for_delivery','cancelled'],out_for_delivery:['delivered']}[current]||[]);}
  document.addEventListener('click',async e=>{const b=e.target.closest('[data-order-status]');if(!b)return;try{const p=await api(`/api/v1/providers/orders/${b.dataset.orderStatus}/status`,{method:'POST',body:JSON.stringify({status:b.dataset.next})});status(p.message||'Order updated.');await loadDashboard();}catch(err){status(friendly(err),true);}});
  function renderCatalog(role){
    const supported=role==='pharmacy'||role==='lab';$('#partner-add-catalog').hidden=!supported;$('#partner-catalog-title').textContent=role==='pharmacy'?'Medicine inventory':role==='lab'?'Lab test catalog':'Consultation services';$('#partner-catalog-copy').textContent=role==='pharmacy'?'New medicines require administrator approval before customers can see them.':role==='lab'?'Manage test pricing, preparation and home collection availability.':'Your consultation offering is managed from Account settings.';
    const items=role==='pharmacy'?(model.products||[]):role==='lab'?(model.lab_tests||[]):[];
    $('#partner-catalog').innerHTML=supported?(items.length?items.map(item=>`<article class="web-card web-row"><div><strong>${esc(item.name)}</strong><p>${money(item.price)} ${role==='pharmacy'?`· Stock ${Number(item.stock||0)}`:`· ${Number(item.report_hours||0)} hours`}</p><p>${esc(item.status==1?'active':item.status||'pending approval')}</p></div><button class="btn btn-outline" data-edit-catalog="${Number(item.id)}">Edit</button></article>`).join(''):empty('No catalog items yet. Add your first item.')):empty('Use Account settings to manage fees, modes and availability.');
    $$('[data-edit-catalog]').forEach(b=>b.addEventListener('click',()=>openCatalog(Number(b.dataset.editCatalog))));
  }
  function openCatalog(id=0){
    const role=model.provider?.provider_type||'';
    const list=role==='pharmacy'?(model.products||[]):(model.lab_tests||[]);
    const item=list.find(x=>Number(x.id)===id)||{};
    const form=$('#partner-catalog-form'); form.reset(); form.elements.id.value=id||'';
    ['name','sku','unit','medicine_type','code','price','stock','report_hours','description'].forEach(name=>{if(form.elements[name]&&item[name]!==undefined&&item[name]!==null)form.elements[name].value=item[name];});
    if(form.elements.home_collection)form.elements.home_collection.checked=Boolean(Number(item.home_collection||0));
    $$('[data-kind]',form).forEach(el=>el.hidden=el.dataset.kind!==role);
    $('#partner-catalog-dialog-title').textContent=`${id?'Edit':'Add'} ${role==='pharmacy'?'medicine':'lab test'}`;
    $('#partner-catalog-dialog').showModal();
  }
  $('#partner-add-catalog').addEventListener('click',()=>openCatalog());
  $('#partner-generate-sku').addEventListener('click',()=>{$('#partner-catalog-form').elements.sku.value=`MED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;});
  $('#partner-catalog-form').addEventListener('submit',async event=>{
    event.preventDefault(); const role=model.provider?.provider_type||''; const values=Object.fromEntries(new FormData(event.currentTarget)); const id=Number(values.id||0); delete values.id;
    values.price=Number(values.price||0);
    if(role==='pharmacy'){values.stock=Number(values.stock||0);values.visible=true;}
    else{values.report_hours=Number(values.report_hours||24);values.home_collection=event.currentTarget.elements.home_collection.checked;}
    const base=role==='pharmacy'?'/api/v1/providers/products':'/api/v1/providers/lab-tests';
    try{const p=await api(id?`${base}/${id}`:base,{method:'POST',body:JSON.stringify(values)});$('#partner-catalog-dialog').close();status(p.message||'Catalog saved.');await loadDashboard();}catch(e){status(friendly(e),true);}
  });
  function renderPatients(){
    const items=model.patients||[];
    $('#partner-patients').innerHTML=items.length?items.map(x=>`<article class="web-card web-row"><div><strong>${esc(x.customer_name||'Patient')}</strong><p>${esc(x.customer_phone||'')}</p></div><div><strong>${Number(x.visits||0)} visits</strong><p>Last: ${esc(x.last_visit||'')}</p></div></article>`).join(''):empty('No patient history yet.');
  }
  function fillProfile(role){
    const form=$('#partner-profile-form'),p=model.provider||{};
    ['name','business_name','email','city','address','description','opening_hours','speciality','qualification','consultation_fee'].forEach(name=>{if(form.elements[name])form.elements[name].value=p[name]??'';});
    $$('[data-role]',form).forEach(el=>el.hidden=el.dataset.role!==role);
  }
  $('#partner-profile-form').addEventListener('submit',async event=>{
    event.preventDefault(); const values=Object.fromEntries(new FormData(event.currentTarget)); if(!values.password)delete values.password;
    try{const p=await api('/api/v1/providers/profile',{method:'POST',body:JSON.stringify(values)});model.provider=p.data||model.provider;status(p.message||'Account updated.');render();}catch(e){status(friendly(e),true);}
  });
  async function loadMessages(){
    try{const p=await api('/api/v1/providers/medical-chat');model.messages=p.data||[];$('#partner-messages').innerHTML=model.messages.length?model.messages.map(x=>`<article class="web-card web-row"><div><strong>${esc(x.customer_name||'Patient')}</strong><p>${esc(x.last_message||'No messages yet')}</p><small>${esc(x.last_message_at||'')}</small></div><button class="btn btn-dark" data-open-chat="${Number(x.id)}">Open ${Number(x.unread_count||0)>0?`(${Number(x.unread_count)} new)`:''}</button></article>`).join(''):empty('No patient conversations yet.');$$('[data-open-chat]').forEach(b=>b.addEventListener('click',()=>openChat(Number(b.dataset.openChat))));}catch(e){$('#partner-messages').innerHTML=empty(friendly(e));}
  }
  $('#partner-refresh-messages').addEventListener('click',loadMessages);
  async function openChat(id){
    try{const p=await api(`/api/v1/providers/medical-chat/${id}/show`);renderChatMessages(p.messages||[]);$('#partner-chat-form').elements.conversation_id.value=id;$('#partner-chat-dialog').showModal();await api(`/api/v1/providers/medical-chat/${id}/read`,{method:'POST',body:'{}'});}catch(e){status(friendly(e),true);}
  }
  function renderChatMessages(items){$('#partner-chat-messages').innerHTML=items.length?items.map(m=>`<div class="web-status" style="margin-left:${m.sender_type==='provider'?'15%':'0'};margin-right:${m.sender_type==='provider'?'0':'15%'}"><strong>${m.sender_type==='provider'?'You':'Patient'}</strong><br>${esc(m.body)}<br><small>${esc(m.created_at||'')}</small></div>`).join(''):empty('No messages yet.');}
  $('#partner-chat-form').addEventListener('submit',async event=>{
    event.preventDefault();const id=Number(event.currentTarget.elements.conversation_id.value),text=event.currentTarget.elements.text.value.trim();if(!text)return;
    try{const p=await api(`/api/v1/providers/medical-chat/${id}/send`,{method:'POST',body:JSON.stringify({text})});event.currentTarget.elements.text.value='';renderChatMessages(p.messages||[]);await loadMessages();}catch(e){status(friendly(e),true);}
  });
  async function fileBase64(file){return await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=reject;reader.readAsDataURL(file);});}
  if(token)loadDashboard();
})();
