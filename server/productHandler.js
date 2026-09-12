import { normalizeCraftCategory,isCraftCategory } from '../src/constants/craftCategories.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { verifyMediaEligibility } from './mediaEligibility.js';

const MEDIA_DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public/uploads/products');
const MAX_BODY=252*1024*1024;
const CATEGORY_MAXIMA={product_photo_evidence:35,product_video_evidence:15,craft_process_evidence:20,artisan_visibility:15,product_process_match:10,listing_completeness:5};
class ProductError extends Error { constructor(message,status=422){super(message);this.status=status;} }
export function validateListing(input) {
  if(!input||typeof input!=='object')throw new ProductError('Product details are required.');
  const details={};
  for(const key of ['title','description','category','region','dimensions','craft_technique','giTag']){
    if(typeof input[key]!=='string'||input[key].length>5000)throw new ProductError('Check your product details.');
    details[key]=input[key].trim();
  }
  details.category=normalizeCraftCategory(details.category);
  if(!isCraftCategory(details.category))throw new ProductError('Choose one of the supported craft categories.');
  if(!details.title||!details.category)throw new ProductError('Add a title and category.');
  if(typeof input.price!=='number'||!Number.isFinite(input.price)||input.price<=0)throw new ProductError('Enter a valid positive price.');
  if(!Number.isSafeInteger(input.stock)||input.stock<0||input.stock>2147483647)throw new ProductError('Enter a valid whole-number stock quantity.');
  if(!Array.isArray(input.materials)||input.materials.length>50||input.materials.some(v=>typeof v!=='string'||v.length>300))throw new ProductError('Check the materials field.');
  return {...details,materials:input.materials.map(v=>v.trim()).filter(Boolean),price:input.price,stock:input.stock};
}
export function compactEvidence(value) {
  if(!value||!Number.isFinite(value.score)||value.score<0||value.score>100||!['low_evidence','basic_evidence','good_evidence','high_evidence','very_high_evidence'].includes(value.level))throw new ProductError('Run evidence analysis before publishing.');
  const categories={};
  for(const [key,max] of Object.entries(CATEGORY_MAXIMA)){
    const c=value.categories?.[key];
    if(!c||!Number.isFinite(c.score)||c.score<0||c.score>max||c.max_score!==max)throw new ProductError('Evidence summary is incomplete. Run analysis again.');
    categories[key]={score:c.score,max_score:c.max_score};
  }
  if(Math.abs(Object.values(categories).reduce((sum,c)=>sum+c.score,0)-value.score)>.001)throw new ProductError('Evidence summary is inconsistent.');
  return {score:value.score,level:value.level,categories,live_capture:value.live_capture===true,
    analyzed_at:typeof value.analyzed_at==='string'&&!Number.isNaN(Date.parse(value.analyzed_at))?value.analyzed_at:null,
    version:'craft-evidence-v2',source:'client_analysis_snapshot'};
}
export function validateMediaBytes(buffer,mime,kind) {
  mime=mime.split(';')[0].toLowerCase();
  const signatures={
    'image/jpeg':['jpg',buffer[0]===255&&buffer[1]===216&&buffer[2]===255],
    'image/png':['png',buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))],
    'image/webp':['webp',buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP'],
    'video/webm':['webm',buffer.subarray(0,4).equals(Buffer.from([26,69,223,163]))],
    'video/mp4':['mp4',buffer.toString('ascii',4,8)==='ftyp'],
    'video/quicktime':['mov',buffer.toString('ascii',4,8)==='ftyp'],
    'video/x-msvideo':['avi',buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='AVI '],
  };
  const value=signatures[mime];
  if(!buffer.length||buffer.length>(kind==='photo'?10:100)*1024*1024||!mime.startsWith(kind==='photo'?'image/':'video/')||!value?.[1])throw new ProductError('Unsupported or oversized product media.');
  return value[0];
}
export function publicProduct(row) {
  return {id:row.id,...JSON.parse(row.detailsJson),media:JSON.parse(row.mediaJson),evidence:JSON.parse(row.evidenceJson),createdAt:row.createdAt};
}
async function multipart(req) {
  if(!req.headers['content-type']?.startsWith('multipart/form-data'))throw new ProductError('Use a media upload request.');
  if(Number(req.headers['content-length'])>MAX_BODY)throw new ProductError('Product upload is too large.',413);
  let size=0;const chunks=[];
  for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY)throw new ProductError('Product upload is too large.',413);chunks.push(chunk);}
  return new Request('http://localhost/products',{method:'POST',headers:{'Content-Type':req.headers['content-type']},body:Buffer.concat(chunks)}).formData();
}
export async function handleProducts(req,res,{prisma,user,mediaDir=MEDIA_DIR,verifyMedia=verifyMediaEligibility}) {
  const send=(status,data)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');res.end(JSON.stringify(data));};
  if(user.role!=='ARTISAN'||!user.isActive)return send(403,{error:'An active artisan account is required.'});
  const written=[];
  try {
    if(req.method==='GET')return send(200,{products:(await prisma.product.findMany({where:{artisanId:user.id},orderBy:{createdAt:'desc'}})).map(publicProduct)});
    if(req.method!=='POST')return send(405,{error:'Method not allowed.'});
    const key=req.headers['idempotency-key'];
    if(typeof key!=='string'||! /^[a-zA-Z0-9-]{16,80}$/.test(key))throw new ProductError('A publish request identifier is required.');
    const unique={artisanId_publishKey:{artisanId:user.id,publishKey:key}};
    const existing=await prisma.product.findUnique({where:unique});
    if(existing){req.resume();return send(200,{product:publicProduct(existing)});}
    const form=await multipart(req);
    const raw=form.get('listing'),rawEvidence=form.get('evidence');
    if(typeof raw!=='string'||raw.length>64000||typeof rawEvidence!=='string'||rawEvidence.length>16000)throw new ProductError('Invalid listing payload.');
    const details=validateListing(JSON.parse(raw)),evidence=compactEvidence(JSON.parse(rawEvidence));
    const images=form.getAll('images'),primary=Number(form.get('primary_index'));
    if(!images.length||images.length>5||!Number.isInteger(primary)||primary<0||primary>=images.length)throw new ProductError('Select a primary product photo.');
    const pending=[];
    async function prepare(file,kind){
      if(!file||typeof file.arrayBuffer!=='function')throw new ProductError('Invalid media file.');
      if(file.size>(kind==='photo'?10:100)*1024*1024)throw new ProductError('Product media is too large.',413);
      const aliases={'video/avi':'video/x-msvideo','video/msvideo':'video/x-msvideo'};
      const inferred={mp4:'video/mp4',webm:'video/webm',mov:'video/quicktime',avi:'video/x-msvideo'};
      const mime=aliases[file.type]||(!file.type||file.type==='application/octet-stream'?inferred[file.name.split('.').pop().toLowerCase()]:file.type);
      const buffer=Buffer.from(await file.arrayBuffer()),ext=validateMediaBytes(buffer,mime||'',kind),name=`${randomUUID()}.${ext}`;
      pending.push({name,buffer,kind});return `/uploads/products/${name}`;
    }
    const imageUrls=[];for(const image of images)imageUrls.push(await prepare(image,'photo'));
    const showcase=form.get('product_video'),process=form.get('process_video');
    const source=form.get('process_source');
    if(process&&!['upload','live_capture'].includes(source))throw new ProductError('Invalid process source.');
    const media={images:imageUrls,primaryImageIndex:primary,productVideo:showcase?await prepare(showcase,'video'):null,
      processVideo:process?await prepare(process,'video'):null,processSource:process?source:null};
    evidence.live_capture=!!process&&source==='live_capture'&&evidence.live_capture;
    let eligible;
    try {eligible=await verifyMedia(pending);} catch {throw new ProductError('Media eligibility could not be checked. Please retry later.',503);}
    if(!eligible)throw new ProductError('Every uploaded file needs a current likely camera-captured result. Return to Media Authenticity Check.');
    await mkdir(mediaDir,{recursive:true});
    for(const item of pending){const target=path.join(mediaDir,item.name);await writeFile(target,item.buffer,{flag:'wx'});written.push(target);}
    const row=await prisma.product.create({data:{artisanId:user.id,publishKey:key,title:details.title,category:details.category,
      price:details.price,stock:details.stock,detailsJson:JSON.stringify(details),mediaJson:JSON.stringify(media),evidenceJson:JSON.stringify(evidence)}});
    return send(201,{product:publicProduct(row)});
  }catch(error){
    await Promise.all(written.map(file=>unlink(file).catch(()=>{})));
    if(error.code==='P2002'){
      const existing=await prisma.product.findUnique({where:{artisanId_publishKey:{artisanId:user.id,publishKey:req.headers['idempotency-key']}}});
      if(existing)return send(200,{product:publicProduct(existing)});
    }
    console.error('[KARIGAR product publishing]',error.name,error.code||'request_failed');
    return send(error.status|| (error instanceof SyntaxError?422:500),{error:error instanceof ProductError?error.message:"We couldn't publish your product. Your draft is still here. Please try again."});
  }
}
