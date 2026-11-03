"use strict";
/* Build 295: offline, synthetic-only label benchmark. Never a browser content script. */
const fs=require("node:fs"),path=require("node:path");
const Audit=require("./engine-verdict-audit.js");
const FILE=path.resolve(__dirname,"../tests/fixtures/nesty-evidence-v1.json");
const PROFILES=new Set(["facebook","youtube","streaming","pornhub","general","popup"]);
const SURFACES=new Set(["feed","rail","marketplace","auth","graphql","player","listing","navigation","article","site-exception","checkout","popup"]);
const TYPES=new Set(["script","image","xmlhttprequest","media","popup","main_frame","stylesheet","other"]);
const KEYS=new Set(["id","profile","surface","expectedBlock","protectedCase","evidenceSource","rules","url","type","origin","method","policy"]);
const HOST=/^(?:[a-z0-9-]+\.)+example$/;
function validateCorpus(data){
 if(!data||data.schemaVersion!==1||data.fixtureId!=="dk-evidence-lab-synthetic-v1"||
 data.datasetClass!=="self-authored-synthetic"||!Array.isArray(data.cases)||
 data.cases.length<20||data.cases.length>96)throw Error("Bounded synthetic-only corpus required");
 const seen=new Set(),out=[];
 for(const r of data.cases){
  if(!r||typeof r!=="object"||Array.isArray(r)||
   Object.keys(r).some(k=>!KEYS.has(k))||
   typeof r.id!=="string"||r.id.length>60||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.id)||
   seen.has(r.id)||!PROFILES.has(r.profile)||!SURFACES.has(r.surface)||!TYPES.has(r.type)||
   typeof r.expectedBlock!=="boolean"||typeof r.protectedCase!=="boolean"||
   (r.expectedBlock&&r.protectedCase)||r.evidenceSource!=="self-authored-synthetic"||
   typeof r.origin!=="string"||!HOST.test(r.origin)||
   typeof r.rules!=="string"||!r.rules.trim()||r.rules.length>2048||
   r.rules.split("\n").length>12||/[^\x0a\x0d\x20-\x7e]/.test(r.rules)||
   /https?:\/\//i.test(r.rules)||
   typeof r.url!=="string"||r.url.length>250||
   !["GET","POST"].includes(r.method))
   throw Error("Invalid synthetic evidence row");
  let u;
  try{u=new URL(r.url);}catch(_){throw Error("Invalid synthetic URL");}
  if(u.protocol!=="https:"||!HOST.test(u.hostname)||u.username||u.password||
   u.port||u.search||u.hash||!/^\/[a-zA-Z0-9._/-]{0,100}$/.test(u.pathname))
   throw Error("Refusing real, private, or query-bearing URL");
  if(r.policy!==undefined&&(!r.policy||typeof r.policy!=="object"||
   Array.isArray(r.policy)||
   Object.keys(r.policy).some(k=>!["document","genericblock"].includes(k))||
   Object.values(r.policy).some(v=>typeof v!=="boolean")))
   throw Error("Invalid policy fixture");
  seen.add(r.id);
  out.push(Object.freeze({...r,policy:r.policy?Object.freeze({...r.policy}):undefined}));
 }
 return Object.freeze(out);
}
function ratio(n,d){return d?Math.round(n/d*10000)/10000:null;}
function score(rows,verdicts,key){
 if(rows.length!==verdicts.length)throw Error("Mismatched verdict count");
 let tp=0,tn=0,fp=0,fn=0,protectedFalsePositives=0;
 for(let i=0;i<rows.length;i++){
  const actual=verdicts[i][key],expected=rows[i].expectedBlock;
  if(typeof actual!=="boolean")throw Error("Invalid engine Boolean verdict");
  if(expected&&actual)tp++;
  else if(expected&&!actual)fn++;
  else if(!expected&&actual){fp++;if(rows[i].protectedCase)protectedFalsePositives++;}
  else tn++;
 }
 return Object.freeze({truePositives:tp,trueNegatives:tn,falsePositives:fp,
 falseNegatives:fn,protectedFalsePositives,precision:ratio(tp,tp+fp),
 recall:ratio(tp,tp+fn),falsePositiveRate:ratio(fp,fp+tn)});
}
function analyze(data,env=null,auditor=Audit.audit){
 const rows=validateCorpus(data),verdicts=auditor(env||Audit.loadEnvironment(),rows);
 if(!Array.isArray(verdicts)||verdicts.length!==rows.length)
  throw Error("Incomplete engine audit");
 for(let i=0;i<rows.length;i++){
  const v=verdicts[i];
  if(v?.id!==rows[i].id||typeof v.nativeBlock!=="boolean"||
   typeof v.productionBlock!=="boolean"||typeof v.vendorMatch!=="boolean"||
   typeof v.category!=="string"||!/^[a-z_]{3,64}$/.test(v.category))
   throw Error("Untrusted engine audit result");
 }
 const byProfile={};
 for(const profile of [...PROFILES].sort()){
  const ids=rows.map((r,i)=>r.profile===profile?i:-1).filter(i=>i>=0);
  if(!ids.length)continue;
  const samples=ids.map(i=>rows[i]),outputs=ids.map(i=>verdicts[i]);
  byProfile[profile]=Object.freeze({cases:ids.length,
   native:score(samples,outputs,"nativeBlock"),
   hybrid:score(samples,outputs,"productionBlock")});
 }
 const cases=rows.map((r,i)=>Object.freeze({
  id:r.id,profile:r.profile,surface:r.surface,expectedBlock:r.expectedBlock,
  protectedCase:r.protectedCase,nativeBlock:verdicts[i].nativeBlock,
  hybridBlock:verdicts[i].productionBlock,vendorRawMatch:verdicts[i].vendorMatch,
  category:verdicts[i].category
 }));
 return Object.freeze({reportType:"offline-engine-label-check",
 evidenceClass:"self-authored-synthetic-only",corpusId:data.fixtureId,
 sampleCount:rows.length,positiveCases:rows.filter(x=>x.expectedBlock).length,
 negativeCases:rows.filter(x=>!x.expectedBlock).length,
 protectedNegativeCases:rows.filter(x=>x.protectedCase).length,
 native:score(rows,verdicts,"nativeBlock"),
 hybrid:score(rows,verdicts,"productionBlock"),byProfile:Object.freeze(byProfile),
 rawGhosteryMatchCount:verdicts.filter(x=>x.vendorMatch).length,
 vendorRawMatchIsNotProductionVerdict:true,trainedModel:false,
 realBrowserVerified:false,automaticBlocking:false,releaseGate:"not-verified",
 cases:Object.freeze(cases)});
}
function loadFixture(){return JSON.parse(fs.readFileSync(FILE,"utf8"));}
if(require.main===module){
 try{
  const result=analyze(loadFixture());
  const {cases,...summary}=result;
  console.log(JSON.stringify(process.argv.includes("--cases")?result:summary,null,2));
 }catch(e){
  console.error("Evidence Lab failed: "+String(e.message||e));
  process.exitCode=1;
 }
}
module.exports={validateCorpus,ratio,score,analyze,loadFixture};
