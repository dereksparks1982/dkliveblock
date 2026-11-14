"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const A=require("../scripts/scriptlet-compatibility-audit.js");
const S=require("../src/safe-scriptlet-rules.js");
const ROOT=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const files=()=>({manifest:require("../src/manifest.json"),pkg:require("../package.json"),
 cosmeticSource:read("src/ghostery-cosmetics.js"),
 runtimeSource:read("src/safe-scriptlet-runtime.js"),
 parserSource:read("src/safe-scriptlet-rules.js"),
 attributions:read("docs/ATTRIBUTIONS.md"),
 manual:A.manualAudit(),
 ghostery:{apiReachable:true,scriptletItems:1,returnedScriptsDiscarded:true,executed:false}
});
function fakeVendor(out={active:true,styles:"",scripts:["execute-never()"],extended:[]}){
 const calls=[];
 const vendor={FiltersEngine:{parse(rules){
  calls.push({kind:"parse",rules});
  return {getCosmeticsFilters(opts){calls.push({kind:"cosmetics",opts});return out;}};
 }}};
 return {vendor,calls};
}
function runtime(){
 const source=read("src/safe-scriptlet-runtime.js"),hooks={};
 const window={app:{ready:true,settings:{enabled:true}},adblockDetected:true};
 const document={addEventListener:(event,fn)=>hooks[event]=fn};
 vm.runInNewContext(source,{window,document},{filename:"safe-scriptlet-runtime.js"});
 return {window,send:commands=>hooks["dk-live-block:safe-scriptlets"]({detail:JSON.stringify(commands)})};
}
test("411: all scoped and collision compatibility fixtures pass",()=>{
 const r=A.manualAudit();assert.equal(r.checked,16);
 assert.equal(r.failed,0);
 assert.ok(r.results.every(x=>x.passed));
});
test("411: all fixture labels are bounded and synthetic",()=>{
 assert.ok(A.SCENARIOS.every(x=>x[0].length<=48&&x[1].length<2000));
 assert.ok(A.FIXTURE_LIST.every(x=>x.startsWith("audit.example##")));
});
test("411: an ancestor conflicts with a descendant but not a sibling",()=>{
 assert.equal(S.pathConflict("app",new Set(["app.one"])),true);
 assert.equal(S.pathConflict("app.one.two",new Set(["app.one"])),true);
 assert.equal(S.pathConflict("app.one",new Set(["app.one"])),true);
 assert.equal(S.pathConflict("apple",new Set(["app.one"])),false);
 assert.equal(S.pathConflict("app.two",new Set(["app.one"])),false);
});
test("411: parent-first rule takes precedence over later child",()=>{
 const selected=S.select(
  "news.example##+js(set-constant, app, false)\nnews.example##+js(set-constant, app.flag, true)",
  "news.example");
 assert.deepEqual(selected,[{name:"set-constant",path:"app",value:"false"}]);
});
test("411: child-first rule takes precedence over later parent",()=>{
 const selected=S.select(
  "news.example##+js(set-constant, app.flag, true)\nnews.example##+js(set-constant, app, false)",
  "news.example");
 assert.deepEqual(selected,[{name:"set-constant",path:"app.flag",value:"true"}]);
});
test("411: overlapping path exceptions free the path for an eligible rule",()=>{
 const lines=[
  "news.example##+js(set-constant, app, false)",
  "news.example##+js(set-constant, app.flag, true)",
  "news.example#@#+js(set-constant, app, false)"
 ].join("\n");
 assert.deepEqual(S.select(lines,"news.example"),[
  {name:"set-constant",path:"app.flag",value:"true"}]);
});
test("411: 24 overlapping leaves must not hide later non-conflicting rules",()=>{
 const head=Array.from({length:24},(_,i)=>
  "news.example##+js(set-constant, tree.branch"+i+", false)").join("\n");
 const tail="news.example##+js(set-constant, tree, false)\n"+
  "news.example##+js(set-constant, freeFlag, true)";
 const selected=S.select(head+"\n"+tail,"news.example");
 assert.equal(selected.length,24);
 assert.ok(!selected.some(x=>x.path==="tree"));
 assert.ok(!selected.some(x=>x.path==="freeFlag"),"capacity is still bounded");
 const exceptions=Array.from({length:24},(_,i)=>
  "news.example#@#+js(set-constant, tree.branch"+i+", false)").join("\n");
 const freed=S.select(head+"\n"+tail+"\n"+exceptions,"news.example");
 assert.deepEqual(freed.map(x=>x.path),["tree","freeFlag"]);
});
test("411: inherited and prototype magic methods blocked on parser paths",()=>{
 for(const name of ["toString","valueOf","__defineGetter__","__lookupGetter__",
  "__defineSetter__","hasOwnProperty","propertyIsEnumerable"]){
  assert.equal(S.validPath("app."+name),false,name);
  assert.equal(S.select("news.example##+js(set-constant, app."+name+", false)",
   "news.example").length,0,name);
 }
});
test("411: direct forged MAIN event also refuses protected methods",()=>{
 const env=runtime();env.send([{name:"set-constant",path:"app.toString",value:"false"}]);
 assert.equal(typeof env.window.app.toString,"function");
 env.send([{name:"set-constant",path:"app.settings.hasOwnProperty",value:"false"}]);
 assert.equal(typeof env.window.app.settings.hasOwnProperty,"function");
});
test("411: sibling operations still install and fully restore real values",()=>{
 const env=runtime();
 env.send([{name:"set-constant",path:"app.ready",value:"false"},
  {name:"set-constant",path:"app.settings.enabled",value:"false"}]);
 assert.equal(env.window.app.ready,false);
 assert.equal(env.window.app.settings.enabled,false);
 env.send([]);
 assert.equal(env.window.app.ready,true);
 assert.equal(env.window.app.settings.enabled,true);
});
test("411: forbidden arbitrary scriptlets are never parsed",()=>{
 for(const kind of ["prevent-fetch","noeval-if","eval","json-prune","set-cookie",
  "remove-node-text","abort-current-script"]){
  assert.equal(S.select("news.example##+js("+kind+", app.ready, false)",
   "news.example").length,0);
 }
});
test("411: ghostery probe uses its own parser, only in offline audit",()=>{
 const mock=fakeVendor(),report=A.probe(mock.vendor);
 assert.equal(mock.calls.length,2);
 assert.equal(mock.calls[1].opts.getInjectionRules,true);
 assert.equal(mock.calls[1].opts.getExtendedRules,false);
 assert.equal(report.apiReachable,true);
 assert.equal(report.executed,false);
 assert.equal(report.returnedScriptsDiscarded,true);
 assert.equal(report.scriptletItems,1);
 assert.ok(!JSON.stringify(report).includes("execute-never"));
});
test("411: Ghostery raw script strings never appear in audit output",()=>{
 const marker="MY_PRIVATE_EXECUTABLE_DATA";
 const mock=fakeVendor({active:true,styles:"",scripts:[marker],extended:[]});
 assert.equal(JSON.stringify(A.probe(mock.vendor)).includes(marker),false);
 assert.equal(JSON.stringify(A.inspect(files())).includes(marker),false);
});
test("411: malformed Ghostery upstream shapes fail closed",()=>{
 for(const bad of [
  {styles:"",scripts:"bad",extended:[]},
  {styles:"",scripts:[],extended:"bad"},
  {styles:null,scripts:[],extended:[]},
  {styles:"",scripts:Array(51).fill("x"),extended:[]}
 ]){
  assert.throws(()=>A.probe(fakeVendor(bad).vendor));
 }
 assert.throws(()=>A.probe({FiltersEngine:{parse:()=>({})}}));
});
test("411: actual production adapters still request NO third-party scriptlets",()=>{
 const c=read("src/ghostery-cosmetics.js");
 assert.match(c,/getInjectionRules:false/);
 assert.doesNotMatch(c,/getInjectionRules:true/);
 assert.match(c,/getExtendedRules:false/);
 const pkg=require("../package.json");
 assert.equal(pkg.dependencies["@ghostery/adblocker"],"2.20.3");
});
test("411: passing audit captures only fixed output summary",()=>{
 const result=A.inspect(files());
 assert.equal(result.ok,true,result.problems.join("\n"));
 assert.equal(result.manualCases,16);
 assert.equal(result.automaticSubscriptionScriptlets,false);
 assert.equal(result.upstreamGPLCodeImported,false);
 assert.equal(result.newBrowserPermissions,false);
 assert.equal(result.verifiedInFirefox,false);
 assert.equal(result.releaseGate,"not-approved");
 assert.equal("scripts" in result,false);
});
test("411: production scriptlet injection opt-in breaks release gate",()=>{
 const opts=files();opts.cosmeticSource+="\n// getInjectionRules:true";
 assert.equal(A.inspect(opts).ok,false);
 assert.match(A.inspect(opts).problems.join(" "),/executable injection/);
});
test("411: missing overlap or prototype defenses breaks gate",()=>{
 const opts=files();opts.parserSource=opts.parserSource.replace(
  "pathConflict(rule.path,paths)","paths.has(rule.path)");
 assert.equal(A.inspect(opts).ok,false);
 const t=files();t.parserSource=t.parserSource.replace('"__defineGetter__"','"allowedGetter"');
 assert.equal(A.inspect(t).ok,false);
});
test("411: runtime restoration or arbitrary code execution breaks gate",()=>{
 const opts=files();opts.runtimeSource=opts.runtimeSource.replace("function restore(","function noRestore(");
 assert.equal(A.inspect(opts).ok,false);
 const t=files();t.runtimeSource+="\neval('dangerous code')";
 assert.equal(A.inspect(t).ok,false);
});
test("411: upstream script retention or executable result breaks gate",()=>{
 const opts=files();opts.ghostery.returnedScriptsDiscarded=false;
 assert.equal(A.inspect(opts).ok,false);
 const t=files();t.ghostery.executed=true;
 assert.equal(A.inspect(t).ok,false);
});
test("411: missing MAIN-world user scriptlet runtime breaks gate",()=>{
 const opts=files();
 opts.manifest={...opts.manifest,content_scripts:opts.manifest.content_scripts.filter(
  x=>!x.js?.includes("safe-scriptlet-runtime.js"))};
 assert.equal(A.inspect(opts).ok,false);
});
test("411: Ghostery version pin and runtime startup order are verified",()=>{
 const opts=files();opts.pkg={...opts.pkg,dependencies:{"@ghostery/adblocker":"2.20.4"}};
 assert.equal(A.inspect(opts).ok,false);
 const t=files();t.manifest={...t.manifest,background:{scripts:["hybrid-engine.js","ghostery-vendor.js","safe-scriptlet-rules.js"]}};
 assert.equal(A.inspect(t).ok,false);
});
test("411: malformed/manual scenarios fail closed rather than silently passing",()=>{
 assert.throws(()=>A.manualAudit(Array(40).fill(A.SCENARIOS[0])));
 assert.throws(()=>A.manualAudit([["bad","https://private.example","audit.example",[]]]));
 const x=A.manualAudit([["misconfigured",A.SCENARIOS[0][1],"audit.example",[]]]);
 assert.equal(x.failed,1);
});
test("411: audit takes no URL, user file, or network argument",()=>{
 assert.throws(()=>A.main(["--rules","/private/browser.txt"]));
 assert.throws(()=>A.main(["--fetch","https://example.com"]));
 const source=read("scripts/scriptlet-compatibility-audit.js");
 assert.doesNotMatch(source,/\bfetch\s*\(|\bXMLHttpRequest\s*\(|\bsendBeacon\s*\(/);
});
test("411: no new runtime scripts, privileged permissions, or GPL dependency",()=>{
 const m=require("../src/manifest.json"),p=require("../package.json");
 assert.equal(m.version,p.version);
 assert.equal(p.dependencies.adguard,undefined);
 assert.equal(p.dependencies.ublock,undefined);
 assert.ok(!m.background.scripts.includes("scriptlet-compatibility-audit.js"));
 assert.ok(!m.content_scripts.some(x=>x.js.includes("scriptlet-compatibility-audit.js")));
 assert.ok(!m.permissions.includes("scripting"));
});
