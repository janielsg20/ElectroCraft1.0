import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GraphqlDataSourceAdapter, RestDataSourceAdapter, chooseRoute, discoverOpenApiOperations, executeGateway, parseOpenApiWithScalar, secretRef } from '../src/index.js';
const root=fileURLToPath(new URL('..',import.meta.url));
const products=[{id:1,name:'Keyboard'}];
const apiFetch=async(url,init={})=>{
  const u=String(url);
  if(u.endsWith('/products')){
    if((init.method??'GET')==='POST'){const body=JSON.parse(String(init.body??'{}'));const row={id:products.length+1,name:String(body.name??'Untitled')};products.push(row);return Response.json(row,{status:201});}
    return Response.json(products);
  }
  if(u.endsWith('/graphql')){
    const body=JSON.parse(String(init.body??'{}'));const q=String(body.query??'');
    if(q.includes('createProduct')){const row={id:String(products.length+1),name:String(body.variables?.name??'Untitled')};products.push({id:Number(row.id),name:row.name});return Response.json({data:{createProduct:row}});}
    return Response.json({data:{products:products.map(p=>({...p,id:String(p.id)}))}});
  }
  return Response.json({message:'Not found'},{status:404});
};
const resolver={resolve:(id)=>id==='demo.api'?'server-only-demo-token':''};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url??'/',`http://${req.headers.host??'localhost'}`);
    if(req.method==='POST'&&url.pathname.startsWith('/probe/')){const input=await jsonBody(req);let out;
      switch(url.pathname.slice('/probe/'.length)){
        case 'rest-read': out=await new RestDataSourceAdapter({id:'rest-demo',baseUrl:'http://fixture.local',fetchImpl:apiFetch,cors:'direct-safe'}).execute({id:'listProducts',kind:'read',resourceId:'products'});break;
        case 'rest-write': out=await new RestDataSourceAdapter({id:'rest-demo',baseUrl:'http://fixture.local',fetchImpl:apiFetch,cors:'direct-safe'}).execute({id:'createProduct',kind:'write',resourceId:'products',input});break;
        case 'openapi': {const raw=await readFile(join(root,'fixtures/openapi.json'),'utf8');const spec=await parseOpenApiWithScalar(raw);out={data:discoverOpenApiOperations(spec),errors:[],pageInfo:null,meta:{sourceId:'openapi-fixture',operationId:'discover',transport:'direct'}};break;}
        case 'graphql-query': out=await new GraphqlDataSourceAdapter({id:'graphql-demo',endpoint:'http://fixture.local/graphql',fetchImpl:apiFetch}).execute({id:'products',kind:'read',resourceId:'graphql',input:{query:'query Products { products { id name } }',variables:{}}});break;
        case 'graphql-mutation': out=await new GraphqlDataSourceAdapter({id:'graphql-demo',endpoint:'http://fixture.local/graphql',fetchImpl:apiFetch}).execute({id:'createProduct',kind:'write',resourceId:'graphql',input:{query:'mutation Create($name:String!){ createProduct(name:$name){ id name } }',variables:{name:String(input.name??'Keyboard')}}});break;
        case 'graphql-unsupported': out=await new GraphqlDataSourceAdapter({id:'graphql-readonly',endpoint:'http://fixture.local/graphql',fetchImpl:apiFetch,supportsMutation:false}).execute({id:'createProduct',kind:'write',resourceId:'graphql',input:{query:'mutation X { x }'}});break;
        case 'cors': out={data:[chooseRoute({cors:'direct-safe'}),chooseRoute({cors:'restricted'}),chooseRoute({authRef:secretRef('demo.api')})],errors:[],pageInfo:null,meta:{sourceId:'policy',operationId:'route',transport:'direct'}};break;
        case 'gateway': {const envelope={sourceId:'secure-rest',targetUrl:'http://fixture.local/products',authRef:secretRef('demo.api'),request:{method:'GET',headers:{accept:'application/json'}}};const response=await executeGateway(envelope,{secretResolver:resolver,fetchImpl:apiFetch});out={data:{payload:await response.json(),clientEnvelope:envelope,secretValueVisible:false},errors:[],pageInfo:null,meta:{sourceId:'secure-rest',operationId:'gateway',transport:'gateway'}};break;}
        default:return json(res,404,{message:'Operación desconocida'});
      } return json(res,200,out);
    }
    const path=url.pathname==='/'?'index.html':url.pathname.replace(/^\//,''); const full=join(root,'public',path); const body=await readFile(full); res.writeHead(200,{'content-type':mime(extname(full))});res.end(body);
  }catch(error){json(res,500,{message:error instanceof Error?error.message:String(error)});}
});
const port=Number(process.env.PORT??4179);server.listen(port,()=>console.log(`M00.9 harness: http://127.0.0.1:${port}`));
function json(res,status,body){res.writeHead(status,{'content-type':'application/json'});res.end(JSON.stringify(body));}
async function jsonBody(req){const chunks=[];for await(const chunk of req)chunks.push(chunk);const raw=Buffer.concat(chunks).toString('utf8');return raw?JSON.parse(raw):{};}
function mime(ext){return ext==='.css'?'text/css':ext==='.js'?'text/javascript':'text/html; charset=utf-8';}
