import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isAdminUser } from '../lib/adminAuth.js';

const names = ['NEXT_PUBLIC_ADMIN_EMAILS','NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY'];
const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
let currentUser;
let authError;
let clients;
try {
  process.env.NEXT_PUBLIC_ADMIN_EMAILS = 'admin@example.invalid';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.example.invalid';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-public-key';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-server-key';
  globalThis.__securityIsAdminUser = isAdminUser;
  globalThis.__securityCreateClient = () => {
    clients++;
    return { auth: { getUser: async () => ({data: {user: currentUser}, error: authError}) } };
  };
  const source = (await readFile(new URL('../app/api/admin/_adminSupabase.js', import.meta.url),'utf8'))
    .replace(/^import .*createClient.*;$/m, 'const createClient = globalThis.__securityCreateClient;')
    .replace(/^import .*isAdminUser.*;$/m, 'const isAdminUser = globalThis.__securityIsAdminUser;');
  const { requireAdmin } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const request = () => new Request('http://localhost/api/admin/products', {headers: {authorization: 'Bearer test-token'}});
  clients = 0;
  assert.equal((await requireAdmin(new Request('http://localhost/test'))).errorResponse.status, 401);
  assert.equal(clients, 0);
  for (const user of [
    {email:'customer@example.invalid',app_metadata:{}},
    {email:'admin@example.invalid',app_metadata:{}},
    {email:'admin@example.invalid',app_metadata:{},user_metadata:{role:'admin'}},
    {email:'other@example.invalid',app_metadata:{role:'admin'}},
  ]) {
    currentUser=user; authError=null; clients=0;
    assert.equal((await requireAdmin(request())).errorResponse.status,403);
    assert.equal(clients,1,'Denied users must not instantiate the privileged client');
  }
  currentUser={email:'admin@example.invalid',app_metadata:{role:'admin'}};
  authError=new Error('Invalid token'); clients=0;
  assert.equal((await requireAdmin(request())).errorResponse.status,401);
  assert.equal(clients,1);
  authError=null; clients=0;
  assert.ok((await requireAdmin(request())).adminSupabase);
  assert.equal(clients,2);
  delete process.env.SUPABASE_SERVICE_ROLE_KEY; clients=0;
  assert.equal((await requireAdmin(request())).errorResponse.status,500);
  assert.equal(clients,1);
  console.log('PASS: server-validated user needs trusted admin role AND email allowlist before privileged client access.');
} finally {
  for(const name of names) {
    if(saved[name]===undefined) delete process.env[name];
    else process.env[name]=saved[name];
  }
  delete globalThis.__securityIsAdminUser;
  delete globalThis.__securityCreateClient;
}
