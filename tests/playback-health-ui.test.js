"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const dir=path.join(__dirname,"../src");
test("YouTube health report UI requires user action to inspect or clear",()=>{
 const html=fs.readFileSync(path.join(dir,"options.html"),"utf8");
 const js=fs.readFileSync(path.join(dir,"options.js"),"utf8");
 for(const id of ["playbackHealthShow","playbackHealthClear","playbackHealthStatus","playbackHealthRows"])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(js,/getPlaybackHealth/);assert.match(js,/clearPlaybackHealth/);
 assert.match(html,/not a confirmed cause|not proof|do not prove/i);
 assert.doesNotMatch(js,/sendNativeMessage\(|XMLHttpRequest\(/);
});
test("playback probe is top-frame only and sends category without media metadata",()=>{
 const page=fs.readFileSync(path.join(dir,"content.js"),"utf8");
 assert.match(page,/window!==window\.top/);
 assert.match(page,/healthProbe\.scan\(player,document\)/);
 assert.match(page,/action:"reportPlaybackHealth",kind/);
 assert.match(page,/samplePlaybackHealth\(\)/);
 assert.doesNotMatch(page,/reportPlaybackHealth",kind,.*(?:currentTime|videoId|title|url)/);
});
test("backend validates real YouTube tab and never auto-unblocks media",()=>{
 const bg=fs.readFileSync(path.join(dir,"background.js"),"utf8");
 assert.match(bg,/sender\.frameId!==0/);
 assert.match(bg,/DKPlaybackHealth\.record/);
 assert.match(bg,/DKStreamingDiagnostics\.recent/);
 assert.match(bg,/now-row\.when<=120000/);
 assert.match(bg,/playbackHealth\.clear\(\)/);
 const snippet=bg.slice(bg.indexOf('if(msg.action==="reportPlaybackHealth")'),
   bg.indexOf('if(msg.action==="getStreamingIssues")'));
 assert.doesNotMatch(snippet,/DKStreamingRepair\.allow|DKRequestControls\.grant|return \{cancel:false\}/);
});
