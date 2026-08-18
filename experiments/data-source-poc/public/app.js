// @ts-check
/** @typedef {'rest'|'graphql'|'gateway'} TabId */
const tabs = /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('[role=tab]'));
const operation = /** @type {HTMLSelectElement} */ (document.querySelector('#operation'));
const params = /** @type {HTMLTextAreaElement} */ (document.querySelector('#params'));
const form = /** @type {HTMLFormElement} */ (document.querySelector('#probe-form'));
const result = /** @type {HTMLElement} */ (document.querySelector('#result'));
const statusEl = /** @type {HTMLElement} */ (document.querySelector('#status'));
const credential = /** @type {HTMLElement} */ (document.querySelector('#credential'));
/** @type {TabId} */ let active = 'rest';
/** @type {Record<TabId, Array<[string,string]>>} */
const presets = {
  rest:[['rest-read','GET /products'],['rest-write','POST /products'],['openapi','OpenAPI discovery']],
  graphql:[['graphql-query','Query products'],['graphql-mutation','Mutation createProduct'],['graphql-unsupported','Mutation no soportada']],
  gateway:[['gateway','Gateway con SecretRef'],['cors','CORS policy']]
};
function renderOptions(){ operation.innerHTML=presets[active].map(([value,label])=>`<option value="${value}">${label}</option>`).join(''); params.value=active==='graphql'?'{"name":"Keyboard"}':'{}'; credential.hidden=active!=='gateway'; }
for(const tab of tabs){tab.addEventListener('click',()=>{const candidate=tab.dataset.tab;if(candidate==='rest'||candidate==='graphql'||candidate==='gateway')active=candidate;for(const t of tabs)t.setAttribute('aria-selected',String(t===tab));renderOptions();statusEl.textContent='POC inicial.';result.textContent='—';});}
form.addEventListener('submit',async(event)=>{event.preventDefault();statusEl.textContent=operation.value==='gateway'?'Gateway requerido.':'Ejecutando.';result.textContent='…';try{let parsed={};try{parsed=JSON.parse(params.value||'{}')}catch{throw new Error('Parámetros JSON inválidos.')}const response=await fetch(`/probe/${operation.value}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(parsed)});const body=await response.json();if(!response.ok)throw new Error(body?.message??'Error');result.textContent=JSON.stringify(body,null,2);statusEl.textContent=body.errors?.length?'Error.':'Resultado.';}catch(error){statusEl.textContent='Error.';result.textContent=String(error instanceof Error?error.message:error);}});
renderOptions();
