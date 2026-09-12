import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp,readFile,readdir,rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { handleProducts,validateListing,compactEvidence,validateMediaBytes } from './productHandler.js';
const listing={title:'Clay pot',description:'A clay pot',category:'Pottery',materials:['Clay'],price:450,stock:0,region:'',dimensions:'',craft_technique:'',giTag:''};
const evidence={score:35,level:'low_evidence',categories:Object.fromEntries(Object.entries({product_photo_evidence:35,product_video_evidence:15,craft_process_evidence:20,artisan_visibility:15,product_process_match:10,listing_completeness:5}).map(([key,max])=>[key,{score:key==='product_photo_evidence'?35:0,max_score:max}]))};
test('required fields, score bounds and upload signatures validated',()=>{
  assert.equal(validateListing(listing).stock,0);
  assert.throws(()=>validateListing({...listing,price:-1}));assert.throws(()=>validateListing({...listing,stock:1.5}));
  assert.equal(compactEvidence(evidence).score,35);assert.throws(()=>compactEvidence({...evidence,score:90}));
  assert.throws(()=>validateMediaBytes(Buffer.from('<script>'),'image/png','photo'));
});
test('authenticated publishing persists files and SQLite rows; retries do not duplicate; listings are scoped',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'karigar-product-test-')),mediaDir=path.join(root,'media');
  const prisma=new PrismaClient({datasources:{db:{url:`file:${path.join(root,'test.db').replaceAll('\\','/')}`}}});
  let server,allowMedia=true;
  try{
    await prisma.$executeRawUnsafe('CREATE TABLE User (id TEXT PRIMARY KEY)');
    await prisma.$executeRawUnsafe("INSERT INTO User (id) VALUES ('artisan-test')");
    const sql=await readFile(new URL('../prisma/migrations/20260911130000_add_products/migration.sql',import.meta.url),'utf8');
    for(const statement of sql.split(';').filter(x=>x.trim()))await prisma.$executeRawUnsafe(statement);
    server=http.createServer((req,res)=>handleProducts(req,res,{prisma,mediaDir,verifyMedia:async()=>allowMedia,user:{id:req.headers['x-test-user']||'artisan-test',role:'ARTISAN',isActive:true}}));
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}`;
    function body(){const form=new FormData();form.append('listing',JSON.stringify(listing));form.append('evidence',JSON.stringify(evidence));form.append('primary_index','0');form.append('images',new Blob([Buffer.from('89504e470d0a1a0a0000000d49484452','hex')],{type:'image/png'}),'image.png');return form;}
    const headers={'Idempotency-Key':'publish-unit-test-1234'};
    const first=await fetch(url,{method:'POST',headers,body:body()});assert.equal(first.status,201);const created=(await first.json()).product;
    assert.match(created.media.images[0],/^\/uploads\/products\/[a-f0-9-]+\.png$/);
    assert.equal((await readdir(mediaDir)).length,1);assert.equal(await prisma.product.count(),1);
    const retry=await fetch(url,{method:'POST',headers,body:body()});assert.equal((await retry.json()).product.id,created.id);assert.equal(await prisma.product.count(),1);
    assert.equal((await (await fetch(url)).json()).products.length,1);
    assert.equal((await (await fetch(url,{headers:{'x-test-user':'someone-else'}})).json()).products.length,0);
    const invalid=body();invalid.set('listing',JSON.stringify({...listing,price:0}));
    assert.equal((await fetch(url,{method:'POST',headers:{'Idempotency-Key':'invalid-unit-test-1234'},body:invalid})).status,422);
    assert.equal((await readdir(mediaDir)).length,1);
    allowMedia=false;
    const forged=body();forged.append('authenticity',JSON.stringify({label:'Likely camera-captured',eligible:true}));
    assert.equal((await fetch(url,{method:'POST',headers:{'Idempotency-Key':'forged-media-test-1234'},body:forged})).status,422);
    assert.equal((await readdir(mediaDir)).length,1);assert.equal(await prisma.product.count(),1);
    allowMedia=true;
    // Foreign-key failure after file writing must remove that new file.
    assert.equal((await fetch(url,{method:'POST',headers:{...headers,'Idempotency-Key':'foreign-user-test-1234','x-test-user':'missing-user'},body:body()})).status,500);
    assert.equal((await readdir(mediaDir)).length,1);
  }finally{
    if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
    await prisma.$disconnect();await rm(root,{recursive:true,force:true});
  }
});
