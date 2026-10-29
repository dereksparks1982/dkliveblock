"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"..","src");
test("popup exposes failed-resource count and recovery navigation",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"popup.js"),"utf8");
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 for(const id of ["issues","recovery"])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(js,/current\.networkIssueCount/);
 assert.match(js,/browser\.runtime\.openOptionsPage/);
 assert.match(bg,/networkIssueCount:/);
});
test("Firefox popup retains ordinary controls alongside recovery",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 for(const id of ["enabled","toggle","temporary","picker","undo","update","settings"])
  assert.match(html,new RegExp('id="'+id+'"'));
});

test("Playback Rescue is available only as an explicit toolbar action",()=>{
 const html=fs.readFileSync(path.join(root,"popup.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"popup.js"),"utf8");
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 assert.match(html,/id="mediaRecoveryRow" hidden/);
 assert.match(html,/id="mediaRecovery"/);
 assert.match(html,/Some video ads may play/);
 assert.match(js,/mediaRecoveryAvailable/);
 assert.match(js,/toggleMediaRecovery/);
 assert.match(bg,/mediaRecoveryAllowed/);
});
