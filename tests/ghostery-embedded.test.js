"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),crypto=require("node:crypto");
const root=path.join(__dirname,"../src");
function loadVendor(){
 const code=fs.readFileSync(path.join(root,"ghostery-vendor.js"),"utf8");
 assert.ok(Buffer.byteLength(code)>100000,"Expected real bundled engine");
 const ctx={URL,TextEncoder,TextDecoder,Uint8Array,Uint32Array,ArrayBuffer,setTimeout,clearTimeout,console};
 ctx.globalThis=ctx;
 for(const name of ["public-suffix.js","rules.js","engine.js","ghostery-vendor.js","hybrid-engine.js"])
  vm.runInNewContext(name==="ghostery-vendor.js"?code:fs.readFileSync(path.join(root,name),"utf8"),ctx,{filename:name,timeout:12000});
 return ctx;
}
test("compiled Ghostery engine is embedded and unchanged",()=>{
 const bytes=fs.readFileSync(path.join(root,"ghostery-vendor.js"));
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),
 "ad116ca8d04d716bda3d02e19a35137428b71ae13c6c1f390600830cd8d7e0f9");
 const env=loadVendor();
 assert.equal(typeof env.DKGhosteryVendor.FiltersEngine.parse,"function");
});
test("real bundled engine handles network blocks and DK scoped exceptions",()=>{
 const env=loadVendor();
 const e=env.DKHybridEngine.create("||ads.example^$script\n@@||ads.example^$domain=trusted.example");
 assert.equal(e.backend,"hybrid");
 assert.equal(e.checkRequest("https://ads.example/a.js","script","news.example").block,true);
 assert.equal(e.checkRequest("https://ads.example/a.js","script","trusted.example").block,false);
 assert.equal(e.checkRequest("https://ads.example/a.js","popup","news.example").block,false);
 assert.equal(e.checkRequest("https://ads.example/a.js","script","news.example",{document:true}).block,false);
});
