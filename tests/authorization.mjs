import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL, anon=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, service=process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(url&&anon&&service,'Missing Supabase test environment');
const admin=createClient(url,service,{auth:{persistSession:false}}), stamp=Date.now(), password=`Battle-${stamp}-Aa!`, ids=[];
async function make(label){const email=`loudpage-${label}-${stamp}@example.invalid`;const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:`Battle ${label}`}});assert.ifError(error);ids.push(data.user.id);const client=createClient(url,anon,{auth:{persistSession:false}});const login=await client.auth.signInWithPassword({email,password});assert.ifError(login.error);return{id:data.user.id,client}}
try{
  const [a,b,c]=await Promise.all([make('a'),make('b'),make('c')]);
  for(const [member,name] of [[a,'battle_a'],[b,'battle_b'],[c,'battle_c']]){const x=await member.client.from('profiles').update({username:`${name}_${stamp}`.slice(0,24),visibility:'public'}).eq('id',member.id);assert.ifError(x.error)}
  let x=await a.client.from('friendships').insert({requester_id:a.id,addressee_id:b.id});assert.ifError(x.error);
  x=await a.client.from('friendships').update({status:'accepted'}).eq('requester_id',a.id).eq('addressee_id',b.id).select('status');assert.ifError(x.error);assert.equal(x.data.length,0,'requester accepted own request');
  x=await b.client.from('friendships').update({status:'accepted'}).eq('requester_id',a.id).eq('addressee_id',b.id);assert.ifError(x.error);
  x=await a.client.from('top_friends').insert({owner_id:a.id,friend_id:b.id,position:1});assert.ifError(x.error);
  x=await a.client.from('top_friends').insert({owner_id:a.id,friend_id:c.id,position:2});assert(x.error,'non-friend entered Top Eight');
  x=await a.client.from('bulletins').insert({author_id:a.id,body:'authorization test'});assert.ifError(x.error);
  let read=await b.client.from('bulletins').select('id').eq('author_id',a.id);assert.ifError(read.error);assert.equal(read.data.length,1);
  read=await c.client.from('bulletins').select('id').eq('author_id',a.id);assert.ifError(read.error);assert.equal(read.data.length,0);
  x=await c.client.from('profile_comments').insert({profile_id:a.id,author_id:c.id,body:'test'});assert.ifError(x.error);
  x=await a.client.from('profiles').update({visibility:'private'}).eq('id',a.id);assert.ifError(x.error);
  for(const table of ['profiles','profile_comments','top_friends']){const column=table==='profiles'?'id':table==='profile_comments'?'profile_id':'owner_id';read=await c.client.from(table).select(column).eq(column,a.id);assert.ifError(read.error);assert.equal(read.data.length,0,`private ${table} leaked`)}
  x=await a.client.from('media').insert({owner_id:a.id,storage_path:`test/${stamp}`,mime_type:'image/png',moderation_state:'approved'}).select('moderation_state').single();assert.ifError(x.error);assert.equal(x.data.moderation_state,'pending');
  x=await a.client.from('media').update({moderation_state:'approved'}).eq('owner_id',a.id).select('moderation_state');assert(x.error||x.data.length===0,'owner approved media');
  const conversation=await a.client.rpc('start_conversation',{other_user:b.id});assert.ifError(conversation.error);
  x=await a.client.from('messages').insert({conversation_id:conversation.data,sender_id:a.id,body:'hello'});assert.ifError(x.error);
  read=await b.client.from('messages').select('body').eq('conversation_id',conversation.data);assert.ifError(read.error);assert.equal(read.data[0]?.body,'hello');
  read=await c.client.from('messages').select('body').eq('conversation_id',conversation.data);assert.ifError(read.error);assert.equal(read.data.length,0);
  x=await c.client.from('reports').insert({reporter_id:c.id,target_type:'profile',target_id:a.id,reason:'test'});assert.ifError(x.error);
  x=await admin.from('admins').insert({user_id:b.id,role:'moderator'});assert.ifError(x.error);
  const reports=await b.client.from('reports').select('id').eq('reporter_id',c.id);assert.ifError(reports.error);assert.equal(reports.data.length,1);
  x=await b.client.from('reports').update({status:'reviewing',reviewed_by:b.id,reviewed_at:new Date().toISOString()}).eq('id',reports.data[0].id);assert.ifError(x.error);
  console.log('PASS: profiles, privacy, friends, Top Eight, bulletins, comments, media, messaging, reports');
} finally {await Promise.all(ids.map(id=>admin.auth.admin.deleteUser(id)))}
