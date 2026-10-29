"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const N=require("../src/network-recovery.js");
function c(change={}){return N.validate({...N.DEFAULT,enabled:true,domains:["blocked.example"],...change}).value;}
test("off by default and no built-in proxy",()=>{
 assert.equal(N.DEFAULT.enabled,false);
 assert.equal(N.route({url:"https://blocked.example",type:"main_frame"},N.DEFAULT),null);
});
test("route configured site and subdomains only, with fail-closed SOCKS routing",()=>{
 assert.deepEqual(N.route({url:"https://blocked.example/p",type:"main_frame"},c()),[{type:"socks",host:"127.0.0.1",port:9050,proxyDNS:true},null]);
 assert.ok(N.route({url:"https://cdn.blocked.example/p.png",type:"image"},c()));
 assert.equal(N.route({url:"https://blocked.example.attacker.org/",type:"main_frame"},c()),null);
 assert.equal(N.route({url:"https://unrelated.org/",type:"main_frame"},c()),null);
});
test("images-only is scoped to explicitly chosen website and type",()=>{
 const img=c({mode:"images"});
 assert.ok(N.route({url:"https://cdn.example/image.png",type:"image",documentUrl:"https://blocked.example/story"},img));
 assert.equal(N.route({url:"https://cdn.example/app.js",type:"script",documentUrl:"https://blocked.example/story"},img),null);
 assert.equal(N.route({url:"https://cdn.example/image.png",type:"image",documentUrl:"https://elsewhere.example/story"},img),null);
});
test("never route local endpoints, proxy itself, or non-web protocols",()=>{
 const img=c({mode:"images"});
 for(const url of ["http://127.0.0.1/a","http://10.0.0.1/a","https://192.168.1.1/a","https://router.local/a","https://dev.internal/a","file:///tmp/file"])
  assert.equal(N.route({url,type:"image",documentUrl:"https://blocked.example/"},img),null,url);
 assert.equal(N.route({url:"https://blocked.example",type:"speculative"},c()),null);
});
test("invalid proxy settings are rejected",()=>{
 for(const changes of [{host:"https://proxy.org"},{port:70000},{type:"ftp"},{mode:"everything"},{domains:["*.example"]},{domains:["http://blocked.example"]},{domains:["router.local"]},{domains:[]}])
  assert.ok(N.validate({...N.DEFAULT,enabled:true,domains:["blocked.example"],...changes}).error,JSON.stringify(changes));
});
test("Tor onion sites require SOCKS5 remote DNS",()=>{
 assert.ok(N.route({url:"http://hiddenservice.onion/",type:"main_frame"},c({domains:["hiddenservice.onion"]})));
 assert.ok(N.validate({...N.DEFAULT,enabled:true,domains:["hiddenservice.onion"],proxyDNS:false}).error);
 assert.ok(N.validate({...N.DEFAULT,type:"https",domains:["hiddenservice.onion"]}).error);
});
test("errors are diagnostic categories, never claims of censorship",()=>{
 assert.equal(N.classifyFailure("NS_ERROR_UNKNOWN_HOST"),"dns");
 assert.equal(N.classifyFailure("NS_ERROR_PROXY_CONNECTION_REFUSED"),"proxy");
 assert.equal(N.classifyFailure("SEC_ERROR_UNKNOWN_ISSUER"),"tls");
 assert.equal(N.classifyFailure("NS_ERROR_NET_TIMEOUT"),"connection");
 assert.equal(N.classifyFailure("NS_BINDING_ABORTED"),"other");
});

test("single-label intranet names are never routed through an image proxy",()=>{
 const img=c({mode:"images"});
 for(const url of ["http://printer/photo","http://nas/file","http://router/config","http://localhost/a"])
  assert.equal(N.route({url,type:"image",documentUrl:"https://blocked.example/story"},img),null,url);
});
