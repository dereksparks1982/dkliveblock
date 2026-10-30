/* Run locally after npm install; never uploads or releases anything. */
import {build} from "esbuild";
import {writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {createHash} from "node:crypto";
const root=resolve(import.meta.dirname,"..");
const {outputFiles}=await build({entryPoints:[resolve(root,"scripts/ghostery-vendor-entry.mjs")],
 write:false,bundle:true,format:"iife",platform:"browser",target:["firefox115"],
 legalComments:"eof",logLevel:"warning",define:{"process.env.NODE_ENV":'"production"'}});
if(outputFiles.length!==1)throw Error("Expected exactly one bundled file");
const bytes=outputFiles[0].contents;
if(bytes.byteLength<10000||bytes.byteLength>8000000)throw Error("Unexpected dependency bundle size");
await writeFile(resolve(root,"src/ghostery-vendor.js"),bytes);
console.log("PHASE PASS: Local Ghostery engine bundle",bytes.byteLength,
 "bytes; SHA-256",createHash("sha256").update(bytes).digest("hex"));
console.log("MPL-2.0 upstream: github.com/ghostery/adblocker. NOT RELEASED.");
