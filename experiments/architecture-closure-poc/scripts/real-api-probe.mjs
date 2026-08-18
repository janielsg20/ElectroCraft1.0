import assert from 'node:assert/strict';

const results = [];
function pass(engine, detail) { results.push({engine, detail}); console.log(`PASS_REAL_${engine.toUpperCase().replace(/[^A-Z0-9]+/g,'_')} ${detail}`); }

// i18next: real instance + Spanish fallback.
{
  const i18next = (await import('i18next')).default;
  const instance = i18next.createInstance();
  await instance.init({ lng:'fr', fallbackLng:'es', resources:{ es:{ translation:{ status:'Listo' } } } });
  assert.equal(instance.t('status'), 'Listo');
  pass('i18next', 'createInstance/init/t fallback=es');
}

// Zustand: real vanilla store API.
{
  const { createStore } = await import('zustand/vanilla');
  const store = createStore((set) => ({ count:0, inc:() => set((state) => ({count:state.count + 1})) }));
  store.getState().inc();
  assert.equal(store.getState().count, 1);
  pass('zustand', 'createStore state transition');
}

// Tiptap: real server-side JSON -> HTML rendering.
{
  const { generateHTML } = await import('@tiptap/html/server');
  const StarterKit = (await import('@tiptap/starter-kit')).default;
  const html = generateHTML({ type:'doc', content:[{type:'paragraph',content:[{type:'text',text:'ElectroCraft'}]}] }, [StarterKit]);
  assert.match(html, /ElectroCraft/);
  pass('tiptap', 'StarterKit + generateHTML');
}

// TanStack Query: the single async cache owner.
{
  const { QueryClient } = await import('@tanstack/query-core');
  const client = new QueryClient();
  client.setQueryData(['m0011'], {ok:true});
  await client.invalidateQueries({queryKey:['m0011'], refetchType:'none'});
  assert.equal(client.getQueryState(['m0011'])?.isInvalidated, true);
  pass('tanstack-query', 'QueryClient set/invalidate');
}

// TanStack Table: headless row model only.
{
  const { createTable, getCoreRowModel } = await import('@tanstack/table-core');
  const table = createTable({ data:[{id:'a'}], columns:[{accessorKey:'id'}], getCoreRowModel:getCoreRowModel(), state:{}, onStateChange(){}, renderFallbackValue:null });
  assert.equal(table.getRowModel().rows.length, 1);
  pass('tanstack-table', 'headless core row model');
}

// Refine: verify real Core package export; it remains Administration-only by architecture policy.
{
  const refine = await import('@refinedev/core');
  assert.ok(refine.Refine, 'Refine export missing');
  pass('refine', 'Refine Core export');
}

// Puck: real published package API smoke without mounting product UI.
{
  const puck = await import('@puckeditor/core');
  assert.ok(puck.Puck);
  assert.ok(puck.Slot || puck.Puck);
  pass('puck', 'published package import');
}

// PGlite + Drizzle: actual SQL engine and ORM adapter.
{
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle } = await import('drizzle-orm/pglite');
  const { sql } = await import('drizzle-orm');
  const pg = new PGlite();
  await pg.exec('create table m0011_probe(id integer primary key, value text not null);');
  await pg.query('insert into m0011_probe(id,value) values ($1,$2)', [1, 'ok']);
  const orm = drizzle(pg);
  const rows = await orm.execute(sql`select value from m0011_probe where id = 1`);
  assert.equal(rows.rows?.[0]?.value ?? rows[0]?.value, 'ok');
  await pg.close();
  pass('pglite-drizzle', 'real SQL + drizzle/pglite');
}

// Rete: real editor + processing plugin attachment.
{
  const { NodeEditor } = await import('rete');
  const { DataflowEngine } = await import('rete-engine');
  const editor = new NodeEditor();
  editor.use(new DataflowEngine());
  assert.ok(editor);
  pass('rete', 'NodeEditor + DataflowEngine');
}

// AI SDK + Google provider: construct provider/model without network or credentials leaving the process.
{
  const ai = await import('ai');
  const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
  assert.equal(typeof ai.generateText, 'function');
  const google = createGoogleGenerativeAI({ apiKey:'m00-11-nonsecret-probe' });
  const model = google('gemini-2.5-flash');
  assert.ok(model);
  pass('ai-sdk-google', 'generateText API + Google model construction');
}

// Scalar: real OpenAPI validate + dereference API selected by M00.9.
{
  const { validate, dereference } = await import('@scalar/openapi-parser');
  const source = JSON.stringify({openapi:'3.1.0',info:{title:'M00.11',version:'1.0.0'},paths:{'/health':{get:{responses:{'200':{description:'OK'}}}}}});
  const validation = await validate(source);
  assert.equal(validation.valid, true);
  const resolved = await dereference(source);
  assert.equal(resolved.errors?.length ?? 0, 0);
  assert.ok(resolved.schema.paths['/health'].get);
  pass('scalar-openapi', 'validate + dereference');
}

console.log(`PASS_REAL_ENGINE_MATRIX ${results.length}`);
