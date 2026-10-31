"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const R=require("../src/youtube-response.js");
const req=(url="https://www.youtube.com/youtubei/v1/player")=>({
 url,type:"xmlhttprequest",method:"POST",tabId:7,statusCode:200,
 documentUrl:"https://www.youtube.com/watch?v=private",
 requestId:"r1",responseHeaders:[{name:"Content-Type",value:"application/json; charset=utf-8"}]
});
function player(){return {playabilityStatus:{status:"OK"},streamingData:{formats:[{url:"signed-media"}]},
 videoDetails:{title:"private title"},adPlacements:[{advertisement:"ad"}],adSlots:[{}],playerAds:[{}]};}
test("Build 73 selects only direct first-party YouTube player JSON",()=>{
 assert.equal(R.eligible(req(),"www.youtube.com"),true);
 assert.equal(R.requestEligible(req(),"www.youtube.com"),true);
 assert.equal(R.requestEligible({...req(),documentUrl:"",originUrl:""},"www.youtube.com"),false);
 assert.equal(R.requestEligible({...req(),documentUrl:"",originUrl:"https://www.youtube.com/watch"},"www.youtube.com"),true);
 assert.equal(R.requestEligible({...req(),documentUrl:"https://unrelated.test/watch"},"www.youtube.com"),false);
 assert.equal(R.requestEligible({...req(),documentUrl:"http://www.youtube.com/watch"},"www.youtube.com"),false);
 assert.equal(R.requestEligible({...req(),documentUrl:"https://m.youtube.com/watch"},"www.youtube.com"),true);
 assert.equal(R.requestEligible({...req(),documentUrl:"https://music.youtube.com/watch"},"www.youtube.com"),true);
 assert.equal(R.requestEligible({...req(),documentUrl:"https://www.youtube.com.evil.example/watch"},"www.youtube.com"),false);
 assert.equal(R.requestEligible({...req(),documentUrl:"https://www.youtube.com/watch"},"youtube-nocookie.com"),false);
 assert.equal(R.safeHeaders({...req(),responseHeaders:[
  {name:"Content-Type",value:"application/json; charset=windows-1252"}]}),false);
 assert.equal(R.safeHeaders({...req(),responseHeaders:[
  {name:"Content-Type",value:"application/json; charset=UTF-8"}]}),true);
 assert.equal(R.eligible(req("https://www.youtube.com/youtubei/v1/get_watch"),"www.youtube.com"),true);
 assert.equal(R.eligible(req("https://youtube.com.evil.test/youtubei/v1/player"),"www.youtube.com"),false);
 assert.equal(R.eligible(req("https://www.youtube.com/youtubei/v1/browse"),"www.youtube.com"),true);
 assert.equal(R.eligible({...req(),method:"GET"},"www.youtube.com"),false);
 assert.equal(R.eligible({...req(),type:"media"},"www.youtube.com"),false);
 assert.equal(R.eligible({...req(),statusCode:403},"www.youtube.com"),false);
 assert.equal(R.eligible({...req(),documentUrl:"https://attacker.test/"},"www.youtube.com"),false);
 assert.equal(R.eligible(req(),"youtube.com.attacker.test"),false);
 assert.equal(R.eligible(req(),"github.com"),false);
 assert.equal(R.safeHeaders({...req(),responseHeaders:[{name:"Content-Type",value:"text/html"}]}),false);
 assert.equal(R.safeHeaders({...req(),responseHeaders:[{name:"Content-Type",value:"application/json"},{name:"content-length",value:"1500001"}]}),false);
});
test("Build 73 removes only whitelisted ad metadata; keeps media, login and DRM structures",()=>{
 const data=player();data.drmFamilies={license:"do-not-touch"};
 const result=R.rewrite(JSON.stringify(data));
 assert.equal(result.changed,true);assert.equal(result.fields,3);
 const next=JSON.parse(result.text);
 for(const name of R.AD_FIELDS)assert.equal(Object.hasOwn(next,name),false);
 assert.deepEqual(next.streamingData,data.streamingData);
 assert.deepEqual(next.videoDetails,data.videoDetails);
 assert.deepEqual(next.drmFamilies,data.drmFamilies);
 assert.equal(next.playabilityStatus.status,"OK");
});
test("Build 73 does not conceal enforcement, alter unknown schemas or edit other endpoints",()=>{
 const refused={...player(),playabilityStatus:{status:"LOGIN_REQUIRED",reason:"Ad blockers are not allowed"}};
 assert.equal(R.rewrite(JSON.stringify(refused)).changed,false);
 for(const value of ['{"unrelated":1,"adSlots":[]}',"not-json","[]",
  JSON.stringify({streamingData:{formats:[]},adSlots:"not-an-array"})])
  assert.equal(R.rewrite(value).changed,false);
 const xssi=")]}'\n"+JSON.stringify(player());
 assert.equal(R.rewrite(xssi).text.startsWith(")]}'\n"),true);
});
test("Build 78 nested string player JSON removes ad fields but preserves video",()=>{
 const original={playerResponse:JSON.stringify(player()),visitorData:"sensitive"};
 const result=R.rewrite(JSON.stringify(original));
 assert.equal(result.changed,true);assert.equal(result.fields,3);
 const value=JSON.parse(result.text);
 assert.equal(value.visitorData,"sensitive");
 const parsed=JSON.parse(value.playerResponse);
 assert.equal(parsed.adSlots,undefined);
 assert.deepEqual(parsed.streamingData,player().streamingData);
 const refused={playerResponse:JSON.stringify({...player(),playabilityStatus:{status:"LOGIN_REQUIRED"}})};
 assert.equal(R.rewrite(JSON.stringify(refused)).changed,false);
});
test("Build 84 preserves denied outer response even when nested player metadata is playable",()=>{
 for(const status of ["LOGIN_REQUIRED","UNPLAYABLE","ERROR"]){
  const original=JSON.stringify({playabilityStatus:{status,reason:"restricted"},
   playerResponse:JSON.stringify(player()),visitorData:"opaque"});
  const result=R.rewrite(original);
  assert.equal(result.changed,false);
  assert.equal(result.text,original);
 }
});
test("Build 73 stream filter handles split chunks, oversize, invalid JSON and closes without a black player",()=>{
 const enc=new TextEncoder(),dec=new TextDecoder();
 function simulate(body,chop=20){
  const output=[],filter={closed:0,disconnected:0,
   write(b){output.push(Buffer.from(b));},
   close(){this.closed++;},disconnect(){this.disconnected++;}};
  const api={filterResponseData(){return filter;}},d=req();
  assert.equal(R.attach(d,api),true);
  const bytes=enc.encode(body);
  for(let i=0;i<bytes.length;i+=chop){
   const chunk=bytes.slice(i,i+chop);
   // Firefox forwards remaining bytes after the extension disconnects.
   if(filter.disconnected)output.push(Buffer.from(chunk));
   else filter.ondata({data:chunk});
  }
  filter.onstop();
  assert.equal(filter.closed+filter.disconnected,1);
  assert.equal(filter.disconnected,bytes.length>R.MAX_BYTES?1:0);
  return dec.decode(Buffer.concat(output));
 }
 const valid=JSON.stringify(player());
 const changed=JSON.parse(simulate(valid,7));
 assert.equal(Object.hasOwn(changed,"adSlots"),false);
 assert.deepEqual(changed.streamingData,player().streamingData);
 assert.equal(simulate("invalid response",4),"invalid response");
 const huge="x".repeat(R.MAX_BYTES+10);
 assert.equal(simulate(huge,200000),huge);
 const stats=R.stats(7);
 assert.equal(stats.modified>=1,true);
 assert.equal(stats.oversized>=1,true);
 assert.equal(stats.unchanged>=1,true);
 assert.equal(R.attach(req(),{filterResponseData(){throw Error("unavailable");}}),false);
 R.observeRequest(7);R.observeRequest(7);
 assert.equal(R.stats(7).playerRequests,2);
 R.clear(7);assert.equal(R.stats(7).observed,0);
 assert.equal(R.stats(7).playerRequests,0);
});

test("Build 83 standalone response module loads bundled feed helper and preserves ordinary items",()=>{
 const url="https://www.youtube.com/youtubei/v1/reel_watch_sequence";
 assert.equal(R.target(url),true);
 const original={entries:[
  {command:{reelWatchEndpoint:{videoId:"normal"}}},
  {command:{reelWatchEndpoint:{videoId:"paid",adClientParams:{isAd:true}}}}
 ],playbackTracking:{token:"private"}};
 const filtered=R.rewrite(JSON.stringify(original),url);
 assert.equal(filtered.changed,true);assert.equal(filtered.fields,1);
 const payload=JSON.parse(filtered.text);
 assert.equal(payload.entries.length,1);
 assert.deepEqual(payload.playbackTracking,original.playbackTracking);
});

test("Build 85 bounded stream releases buffered bytes on deadline",()=>{
 let callback,filter,disconnected=0,closed=0;
 const chunks=[],removed=[];
 const clock={setTimeout(fn,ms){assert.equal(ms,R.MAX_DELAY_MS);callback=fn;return 99;},
  clearTimeout(id){removed.push(id);}};
 const api={filterResponseData(){filter={write(b){chunks.push(Buffer.from(b));},
  disconnect(){disconnected++;},close(){closed++;}};return filter;}};
 assert.equal(R.attach({...req(),tabId:42},api,clock),true);
 filter.ondata({data:Buffer.from("partial")});
 assert.equal(chunks.length,0);
 callback();
 assert.equal(Buffer.concat(chunks).toString(),"partial");
 assert.equal(disconnected,1);
 assert.equal(closed,0);
 assert.deepEqual(removed,[99]);
 filter.onstop();
 assert.equal(R.stats(42).timedOut,1);
 assert.equal(R.stats(42).observed,1);
 R.clear(42);
});
test("Build 85 oversized reply passes captured bytes and disconnects immediately",()=>{
 let filter,disconnected=0;
 const chunks=[];
 const api={filterResponseData(){filter={write(b){chunks.push(Buffer.from(b));},
  disconnect(){disconnected++;},close(){throw Error("should disconnect");}};return filter;}};
 const clock={setTimeout(){return 2;},clearTimeout(){}};
 R.attach({...req(),tabId:43},api,clock);
 const bytes=Buffer.from("x".repeat(R.MAX_BYTES+10));
 filter.ondata({data:bytes.subarray(0,R.MAX_BYTES)});
 filter.ondata({data:bytes.subarray(R.MAX_BYTES)});
 assert.equal(disconnected,1);
 assert.equal(Buffer.concat(chunks).equals(bytes),true);
 filter.onstop();
 assert.equal(R.stats(43).oversized,1);
 assert.equal(R.stats(43).observed,1);
 R.clear(43);
});

test("Build 88 counts YouTube player, feed and Shorts API paths without storing the URL",()=>{
 const urls=["https://www.youtube.com/youtubei/v1/player?private=SECRET",
 "https://www.youtube.com/youtubei/v1/browse?private=SECRET",
 "https://www.youtube.com/youtubei/v1/reel_watch_sequence?private=SECRET"];
 for(const url of urls)R.observeRequest(74,url);
 const state=R.stats(74);
 assert.equal(state.playerRequests,3);
 for(const kind of ["player","feed","shorts"])assert.equal(state.byKind[kind].requests,1);
 assert.equal(JSON.stringify(state).includes("SECRET"),false);
 state.byKind.player.requests=999;
 assert.equal(R.stats(74).byKind.player.requests,1);
 R.clear(74);
});

test("Build 89 caps active interceptors per tab and frees slots after completion",()=>{
 let active=[];
 const api={filterResponseData(){
  const filter={write(){},close(){},disconnect(){}};
  active.push(filter);return filter;
 }};
 const clock={setTimeout(){return 11;},clearTimeout(){}};
 const details={...req(),tabId:510};
 for(let i=0;i<R.MAX_PER_TAB;i++)
  assert.equal(R.attach({...details,requestId:"test"+i},api,clock),true);
 assert.equal(R.attach({...details,requestId:"extra"},api,clock),false);
 assert.equal(active.length,R.MAX_PER_TAB,"rejected requests must not open a filter");
 assert.equal(R.stats(510).skippedBusy,1);
 active[0].onstop();
 assert.equal(R.attach({...details,requestId:"available"},api,clock),true);
 for(const filter of active.slice(1))filter.onerror();
 assert.equal(R.stats(510).skippedBusy,1);
 R.clear(510);
});
test("Build 89 globally caps active response filters to bounded memory",()=>{
 const filters=[];
 const api={filterResponseData(){
  const filter={write(){},close(){},disconnect(){}};
  filters.push(filter);return filter;
 }};
 const clock={setTimeout(){return 12;},clearTimeout(){}};
 for(let i=0;i<R.MAX_FILTERS;i++){
  const tabId=610+Math.floor(i/R.MAX_PER_TAB);
  assert.equal(R.attach({...req(),tabId,requestId:"global-"+i},api,clock),true);
 }
 assert.equal(R.attach({...req(),tabId:777},api,clock),false);
 assert.equal(R.stats(777).skippedBusy,1);
 assert.equal(filters.length,R.MAX_FILTERS);
 for(const filter of filters)filter.onerror();
 assert.equal(R.attach({...req(),tabId:778},api,clock),true);
 filters[filters.length-1].onstop();
 for(let id=610;id<610+R.MAX_FILTERS/R.MAX_PER_TAB;id++)R.clear(id);
 R.clear(777);R.clear(778);
});

test("Build 96 ignores old response completions after a tab navigates",()=>{
 const filters=[];
 const clock={setTimeout(){return 1;},clearTimeout(){}};
 const web={filterResponseData(){
  const filter={write(){},close(){},disconnect(){}};
  filters.push(filter);return filter;}};
 const d={...req(),tabId:611,requestId:"old"};
 R.observeRequest(611,d.url);
 assert.equal(R.attach(d,web,clock),true);
 R.clear(611);
 R.observeRequest(611,d.url);
 assert.equal(R.stats(611).playerRequests,1);
 filters[0].ondata({data:Buffer.from('{"videoDetails":{},"adSlots":[{}]}')});
 filters[0].onstop();
 assert.equal(R.stats(611).observed,0,"old completion cannot enter new page statistics");
 assert.equal(R.stats(611).modified,0);
 assert.equal(R.stats(611).playerRequests,1);
 assert.equal(R.attach({...d,requestId:"new"},web,clock),true);
 filters[1].ondata({data:Buffer.from('{"videoDetails":{},"adSlots":[{}]}')});
 filters[1].onstop();
 assert.equal(R.stats(611).modified,1);
 R.clear(611);
});
test("Build 96 post-navigation deadlines and errors never resurrect old tab records",()=>{
 const timers=[],filters=[];
 const clock={setTimeout(cb){timers.push(cb);return timers.length;},clearTimeout(){}};
 const web={filterResponseData(){
  const filter={write(){},close(){},disconnect(){}};
  filters.push(filter);return filter;}};
 const tabId=612;
 assert.equal(R.attach({...req(),tabId},web,clock),true);
 R.clear(tabId);
 timers[0]();
 assert.equal(R.stats(tabId).observed,0);
 assert.equal(R.stats(tabId).timedOut,0);
 assert.equal(R.attach({...req(),tabId},web,clock),true);
 R.clear(tabId);
 filters[1].onerror();
 assert.equal(R.stats(tabId).errors,0);
});

test("Build 103 response headers skipped without touching unsupported JSON/media",()=>{
 const tab=991,d={...req(),tabId:tab};
 let called=0;
 const api={filterResponseData(){called++;return {write(){},close(){},disconnect(){}}}};
 assert.equal(R.attach({...d,responseHeaders:[{name:"Content-Type",value:"video/mp4"}]},api),false);
 assert.equal(R.attach({...d,responseHeaders:[{name:"Content-Type",value:"application/json"},
  {name:"Content-Length",value:String(R.MAX_BYTES+10)}]},api),false);
 assert.equal(R.attach({...d,responseHeaders:[{name:"Content-Type",value:"application/json; charset=latin1"}]},api),false);
 assert.equal(called,0);
 assert.equal(R.stats(tab).skippedHeaders,3);
 assert.equal(R.stats(tab).observed,0);
 R.clear(tab);
});

test("Build 109 hundreds of unrelated tab clears never revive a prior page response",()=>{
 const attached=[];
 const web={filterResponseData(){
  const filter={write(){},close(){},disconnect(){}};attached.push(filter);return filter;}};
 const clock={setTimeout(){return 1;},clearTimeout(){}};
 const tabId=91001,d={...req(),tabId};
 assert.equal(R.attach(d,web,clock),true);
 R.clear(tabId);
 for(let i=92000;i<92500;i++)R.clear(i);
 attached[0].ondata({data:Buffer.from('{"videoDetails":{},"adSlots":[{}]}')});
 attached[0].onstop();
 assert.equal(R.stats(tabId).observed,0);
 assert.equal(R.stats(tabId).modified,0);
 R.observeRequest(tabId,d.url);
 assert.equal(R.stats(tabId).playerRequests,1);
 R.clear(tabId);
});
test("Build 109 active tab generation survives tab ID reuse and releases after final filter",()=>{
 const attached=[];
 const web={filterResponseData(){
  const filter={write(){},close(){},disconnect(){}};attached.push(filter);return filter;}};
 const clock={setTimeout(){return 1;},clearTimeout(){}};
 const d={...req(),tabId:91002};
 R.attach({...d,requestId:"old"},web,clock);
 R.clear(d.tabId);
 R.attach({...d,requestId:"new"},web,clock);
 attached[0].onstop();
 assert.equal(R.stats(d.tabId).observed,0);
 attached[1].ondata({data:Buffer.from('{"videoDetails":{},"adSlots":[{}]}')});
 attached[1].onstop();
 assert.equal(R.stats(d.tabId).modified,1);
 R.clear(d.tabId);
});

test("Build 115 refuses duplicate or ambiguous response headers without attaching",()=>{
 const d=req(),type={name:"Content-Type",value:"application/json"};
 assert.equal(R.safeHeaders({...d,responseHeaders:[type,{name:"content-type",value:"text/html"}]}),false);
 assert.equal(R.safeHeaders({...d,responseHeaders:[type,
  {name:"Content-Length",value:"25"},{name:"content-length",value:"26"}]}),false);
 assert.equal(R.safeHeaders({...d,responseHeaders:Array.from({length:101},()=>({name:"Other",value:"x"}))}),false);
 assert.equal(R.safeHeaders({...d,responseHeaders:[type,{name:"Content-Length",value:"25"}]}),true);
});

test("Build 118 permits first-party YouTube subdomain API calls but not external iframe initiators",()=>{
 const d={...req(),documentUrl:"https://m.youtube.com/watch?v=signed"};
 assert.equal(R.requestEligible(d,"www.youtube.com"),true);
 assert.equal(R.eligible(d,"www.youtube.com"),true);
 for(const documentUrl of ["https://untrusted.example/watch",
  "https://youtube.com.evil.example/watch","http://music.youtube.com/watch",
  "https://youtube.com@evil.example/watch"]){
  assert.equal(R.requestEligible({...d,documentUrl},"www.youtube.com"),false,documentUrl);
 }
});

test("Build 121 watch-next API is eligible only for trusted YouTube POST XHR",()=>{
 const url="https://www.youtube.com/youtubei/v1/next";
 assert.equal(R.target(url),true);
 assert.equal(R.eligible(req(url),"www.youtube.com"),true);
 assert.equal(R.target("https://www.youtube.com/youtubei/v1/next-malicious"),false);
 assert.equal(R.eligible({...req(url),method:"GET"},"www.youtube.com"),false);
});

test("Build 124 playlists pass through only recognized first-party POST JSON paths",()=>{
 const url="https://www.youtube.com/youtubei/v1/playlist";
 assert.equal(R.target(url),true);
 assert.equal(R.eligible(req(url),"www.youtube.com"),true);
 assert.equal(R.eligible({...req(url),method:"GET"},"www.youtube.com"),false);
 assert.equal(R.target(url+"_evil"),false);
});

test("Build 125 outer feed refusal remains byte-for-byte unchanged through shared response module",()=>{
 const url="https://www.youtube.com/youtubei/v1/next";
 const body=JSON.stringify({playabilityStatus:{status:"UNPLAYABLE"},
  contents:[{adSlotRenderer:{id:"sponsor"}}]});
 const out=R.rewrite(body,url);
 assert.equal(out.changed,false);
 assert.equal(out.text,body);
});

test("Build 126 keeps watch-next and playlist diagnostics separate from feeds",()=>{
 const tabId=988;
 for(const endpoint of ["browse","next","playlist","reel_watch_sequence","player"])
  R.observeRequest(tabId,"https://www.youtube.com/youtubei/v1/"+endpoint+"?videoId=PRIVATE");
 const stats=R.stats(tabId);
 assert.equal(stats.playerRequests,5);
 for(const kind of ["feed","next","playlist","shorts","player"])
  assert.equal(stats.byKind[kind].requests,1,kind);
 assert.equal(JSON.stringify(stats).includes("PRIVATE"),false);
 stats.byKind.next.requests=999;
 assert.equal(R.stats(tabId).byKind.next.requests,1);
 R.clear(tabId);
});
