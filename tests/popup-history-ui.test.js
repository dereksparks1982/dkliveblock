"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../src");
test("popup activity controls are local and explicitly clearable",()=>{
 const html=fs.readFileSync(path.join(root,"network-monitor.html"),"utf8");
 const js=fs.readFileSync(path.join(root,"network-monitor.js"),"utf8");
 for(const id of ["popupHistoryRefresh","popupHistoryClear","popupHistoryStatus","popupHistoryRows"])
  assert.ok(html.includes('id="'+id+'"'));
 assert.match(js,/getPopupHistory/);
 assert.match(js,/clearPopupHistory/);
 assert.match(js,/renderPopupHistory/);
 assert.doesNotMatch(js,/sendNativeMessage|XMLHttpRequest/);
});
