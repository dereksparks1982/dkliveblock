"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../src/facebook-ads.js"),"utf8");
test("Build 252: exact header Ad evidence, including link-only author",()=>{
 const sandbox={globalThis:{}};vm.runInNewContext(source,sandbox);
 const fn=vm.runInNewContext(source.replace('root.DKFacebookAds=api;','api.explicitHeaderAd=explicitHeaderAd;root.DKFacebookAds=api;')+';globalThis.DKFacebookAds.explicitHeaderAd',sandbox);
 const author={contains:n=>n===label?false:false};
 const bounds={top:100,height:550};
 const header={textContent:"Wildlife Association Ad",getBoundingClientRect:()=>({height:72}),querySelector:()=>author};
 const card={getBoundingClientRect:()=>bounds,contains:n=>n===header};
 const label={textContent:"Ad",children:[],childNodes:[{nodeType:3,textContent:"Ad"}],
  getBoundingClientRect:()=>({top:133}),closest:()=>null,parentElement:header};
 assert.equal(fn(label,card,{}),true);
 label.textContent="normal";label.childNodes=[{nodeType:3,textContent:"normal"}];
 assert.equal(fn(label,card,{}),false);
});
test("Build 252 maintains single Facebook scanner and does not activate standalone upstream extension",()=>{
 const manifest=require("../src/manifest.json");
 assert.ok(manifest.content_scripts[0].js.includes("facebook-ads.js"));
 assert.ok(!manifest.content_scripts[0].js.includes("vendor/facebook-sponsored-upstream.js"));
 assert.match(source,/explicitHeaderAd\(el,card,win\)/);
});
