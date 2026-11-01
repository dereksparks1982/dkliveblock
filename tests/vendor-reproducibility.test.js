"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {spawnSync} = require("node:child_process");
const SOURCE = path.resolve(__dirname, "../scripts/build-ghostery.mjs");
const SAMPLE = "globalThis.DKGhosteryVendor = {FiltersEngine:{parse:()=>({match:(req)=>req.sourceUrl.includes('trusted.example')?{match:false,exception:true}:{match:true}})},Request:{fromRawDetails:(req)=>req}};\n" +
  "// offline-only test fixture\n".repeat(800);

function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "dk-ghostery-repro-"));
  const scripts = path.join(root, "scripts");
  const vendor = path.join(root, "src");
  const npm = path.join(root, "node_modules");
  fs.mkdirSync(scripts, {recursive:true});
  fs.mkdirSync(vendor, {recursive:true});
  fs.mkdirSync(path.join(npm,"esbuild"), {recursive:true});
  fs.mkdirSync(path.join(npm,"@ghostery","adblocker"), {recursive:true});
  fs.copyFileSync(SOURCE, path.join(scripts,"build-ghostery.mjs"));
  fs.writeFileSync(path.join(npm,"esbuild","package.json"),
    JSON.stringify({name:"esbuild",type:"module",version:"0.25.12",exports:"./index.mjs"}));
  fs.writeFileSync(path.join(npm,"esbuild","index.mjs"),
    "export async function build() { return {outputFiles:[{contents:Buffer.from(" +
    JSON.stringify(SAMPLE) + ", 'utf8')}]}; }\n");
  fs.writeFileSync(path.join(npm,"@ghostery","adblocker","package.json"),
    JSON.stringify({name:"@ghostery/adblocker",version:"2.20.3"}));
  fs.writeFileSync(path.join(vendor,"ghostery-vendor.js"),SAMPLE);
  return {root, bundle:path.join(vendor,"ghostery-vendor.js")};
}
function invoke(fixture, ...args) {
  return spawnSync(process.execPath, [path.join(fixture.root,"scripts","build-ghostery.mjs"),...args],
    {cwd:fixture.root,encoding:"utf8",timeout:15000});
}
test("Build 221 Ghostery verification checks equal bytes without touching the bundle", () => {
  const fixture=sandbox();
  try {
    const before=fs.statSync(fixture.bundle).mtimeMs;
    const result=invoke(fixture,"--verify");
    assert.equal(result.status,0, result.stderr);
    assert.match(result.stdout,/matches checked-in bundle byte-for-byte/);
    assert.match(result.stdout,/NO files changed/);
    assert.equal(fs.readFileSync(fixture.bundle,"utf8"),SAMPLE);
    assert.equal(fs.statSync(fixture.bundle).mtimeMs,before);
  } finally {fs.rmSync(fixture.root,{recursive:true,force:true});}
});
test("Build 221 mismatched vendor bytes fail closed without replacing accepted source", () => {
  const fixture=sandbox();
  try {
    fs.writeFileSync(fixture.bundle,SAMPLE+"// source drift\n");
    const original=fs.readFileSync(fixture.bundle);
    const result=invoke(fixture,"--verify");
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/reproducibility mismatch/);
    assert.deepEqual(fs.readFileSync(fixture.bundle),original);
    const invalid=invoke(fixture,"--unrecognized");
    assert.notEqual(invalid.status,0);
    assert.match(invalid.stderr,/Supported arguments/);
    assert.deepEqual(fs.readFileSync(fixture.bundle),original);
  } finally {fs.rmSync(fixture.root,{recursive:true,force:true});}
});
test("Build 221 verifier rejects unexpected compiler version", () => {
  const fixture=sandbox();
  try {
    fs.writeFileSync(path.join(fixture.root,"node_modules","esbuild","package.json"),
      JSON.stringify({name:"esbuild",type:"module",version:"0.25.13",exports:"./index.mjs"}));
    const result=invoke(fixture,"--verify");
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/Unexpected esbuild version/);
    assert.equal(fs.readFileSync(fixture.bundle,"utf8"),SAMPLE);
  } finally {fs.rmSync(fixture.root,{recursive:true,force:true});}
});
test("Build 221 explicit developer build remains supported with stubbed offline source", () => {
  const fixture=sandbox();
  try {
    fs.writeFileSync(fixture.bundle,"old build");
    const result=invoke(fixture);
    assert.equal(result.status,0,result.stderr);
    assert.match(result.stdout,/Bundled source updated/);
    assert.equal(fs.readFileSync(fixture.bundle,"utf8"),SAMPLE);
  } finally {fs.rmSync(fixture.root,{recursive:true,force:true});}
});
