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
  const output=[],filter={closed:0,write(b){output.push(Buffer.from(b));},close(){this.closed++;},disconnect(){this.closed++;}};
  const api={filterResponseData(){return filter;}},d=req();
  assert.equal(R.attach(d,api),true);
  const bytes=enc.encode(body);
  for(let i=0;i<bytes.length;i+=chop)filter.ondata({data:bytes.slice(i,i+chop)});
  filter.onstop();
  assert.equal(filter.closed,1);
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
