/* DK Live Block local-only Ghostery engine compilation and smoke checks. */
import {build} from "esbuild";
import {writeFile,readFile,rename,unlink} from "node:fs/promises";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash,randomUUID} from "node:crypto";
import {runInNewContext} from "node:vm";
const root=resolve(dirname(fileURLToPath(import.meta.url)),".."),file=resolve(root,"src/ghostery-vendor.js");
const temporary=file+".tmp-"+randomUUID();
const args=process.argv.slice(2);
const verifyOnly=args.length===1&&args[0]==="--verify";
try {
 if(args.length&&!verifyOnly)throw Error("Supported arguments: --verify (read-only source comparison)");
 const esbuildPackage=JSON.parse(await readFile(resolve(root,"node_modules/esbuild/package.json"),"utf8"));
 if(esbuildPackage.version!=="0.25.12")throw Error("Unexpected esbuild version "+esbuildPackage.version);
 const pkg=JSON.parse(await readFile(resolve(root,"node_modules/@ghostery/adblocker/package.json"),"utf8"));
 if(pkg.version!=="2.20.3")throw Error("Unexpected Ghostery version "+pkg.version);
 console.log("PHASE START: Build pinned Ghostery engine v"+pkg.version);
 const {outputFiles}=await build({
  entryPoints:[resolve(root,"scripts/ghostery-vendor-entry.mjs")],write:false,
  bundle:true,format:"iife",platform:"browser",target:["firefox115"],
  legalComments:"eof",logLevel:"warning",
  define:{"process.env.NODE_ENV":'"production"'}
 });
 if(outputFiles.length!==1)throw Error("Expected one self-contained bundle");
 const bytes=outputFiles[0].contents;
 if(bytes.byteLength<10000||bytes.byteLength>8000000)
  throw Error("Unexpected Ghostery bundle size "+bytes.byteLength);
 // Validate generated code before touching the working source bundle.
 const vm={URL,TextEncoder,TextDecoder,Uint8Array,Uint32Array,ArrayBuffer,
  setTimeout,clearTimeout,console};vm.globalThis=vm;
 runInNewContext(Buffer.from(bytes).toString("utf8"),vm,{filename:"ghostery-vendor.js",timeout:15000});
 const v=vm.DKGhosteryVendor;
 if(typeof v?.FiltersEngine?.parse!=="function"||typeof v?.Request?.fromRawDetails!=="function")
  throw Error("Compiled Ghostery API missing");
 const rules="||ads.dk-live-block.invalid^$script\n@@||ads.dk-live-block.invalid^$domain=trusted.example";
 const engine=v.FiltersEngine.parse(rules);
 const req=host=>v.Request.fromRawDetails({
  url:"https://ads.dk-live-block.invalid/test.js",sourceUrl:"https://"+host+"/",type:"script"});
 if(!engine.match(req("other.example"))?.match)throw Error("Ghostery blocking smoke check failed");
 const allowed=engine.match(req("trusted.example"));
 if(allowed?.match===true&&!allowed?.exception)
  throw Error("Ghostery site-scoped exception smoke check failed");
 console.log("PHASE PASS: Ghostery block/exception smoke checks");
 if(verifyOnly){
  const existing=await readFile(file);
  const generated=Buffer.from(bytes);
  if(!existing.equals(generated)){
   const expected=createHash("sha256").update(existing).digest("hex");
   const actual=createHash("sha256").update(generated).digest("hex");
   throw Error("Bundled Ghostery reproducibility mismatch: checked-in SHA256 "+expected+", rebuilt SHA256 "+actual);
  }
  console.log("PHASE PASS: Rebuilt Ghostery matches checked-in bundle byte-for-byte ("+bytes.byteLength+" bytes). NO files changed.");
 }else{
  await writeFile(temporary,bytes);
  await rename(temporary,file);
  console.log("PHASE PASS: Bundled source updated ("+bytes.byteLength+" bytes)");
 }
 console.log("SHA256",createHash("sha256").update(bytes).digest("hex"));
 console.log("Not released. Source license: MPL-2.0.");
}catch(e){
 try{await unlink(temporary);}catch(_){}
 console.error("PHASE FAIL:",e.message||String(e));
 process.exitCode=1;
}
