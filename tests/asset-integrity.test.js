"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const Assets=require("../scripts/asset-integrity.js");
function fixture(change){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"dk-assets-")),src=path.join(root,"src");
 fs.mkdirSync(src);
 const manifest={manifest_version:2,background:{scripts:["background.js"]},
  content_scripts:[{js:["content.js"]}],browser_action:{default_popup:"popup.html"},
  options_ui:{page:"options.html"},icons:{"48":"icons/icon.png"},
  web_accessible_resources:["redirect/noop.js"]};
 fs.writeFileSync(path.join(src,"manifest.json"),JSON.stringify(manifest));
 for(const f of ["background.js","content.js","popup.html","options.html",
  "icons/icon.png","redirect/noop.js","style.css"]){
  fs.mkdirSync(path.dirname(path.join(src,f)),{recursive:true});
  fs.writeFileSync(path.join(src,f),"content");
 }
 fs.writeFileSync(path.join(src,"popup.html"),
  '<link rel="stylesheet" href="style.css"><script src="content.js"></script>');
 fs.writeFileSync(path.join(src,"options.html"),'<script src="background.js"></script>');
 try{return change(src,manifest);}
 finally{fs.rmSync(root,{recursive:true,force:true});}
}
test("Build 171 checks manifest references and every current HTML page",()=>{
 const result=Assets.audit(path.join(__dirname,"../src"));
 assert.deepEqual(result.issues,[],result.issues.join("\n"));
 assert.equal(result.ok,true);
 assert.ok(result.pages>=8);
 assert.ok(result.files>=35);
});
test("Build 171 catches missing local scripts, styles and redirect files",()=>{
 fixture((src,manifest)=>{
  assert.equal(Assets.audit(src).ok,true);
  fs.rmSync(path.join(src,"style.css"));
  assert.match(Assets.audit(src).issues.join(" "),/Missing local asset: style.css/);
  fs.rmSync(path.join(src,"redirect/noop.js"));
  assert.match(Assets.audit(src).issues.join(" "),/Missing local asset: redirect\/noop.js/);
  manifest.content_scripts[0].js.push("missing.js");
  fs.writeFileSync(path.join(src,"manifest.json"),JSON.stringify(manifest));
  assert.match(Assets.audit(src).issues.join(" "),/Missing local asset: missing.js/);
 });
});
test("Build 171 rejects remote executable assets and traversals",()=>{
 fixture((src,manifest)=>{
  manifest.background.scripts.push("https://evil.example/ad.js");
  manifest.web_accessible_resources.push("../secret.js");
  fs.writeFileSync(path.join(src,"manifest.json"),JSON.stringify(manifest));
  const errors=Assets.audit(src).issues.join(" ");
  assert.match(errors,/Unsafe or external asset/);
  assert.equal(Assets.validRelative("../secret.js"),false);
  assert.equal(Assets.validRelative("//evil.example/ad.js"),false);
  assert.equal(Assets.validRelative("redirect/noop.js"),true);
 });
});
test("Build 171 inspects local scripts and styles, not ordinary hyperlinks",()=>{
 const refs=Assets.htmlAssets('<script defer src="a.js"></script>'+
  '<link rel="stylesheet" href="a.css"><a href="https://help.example/">Help</a>');
 assert.deepEqual(refs,["a.js","a.css"]);
});
