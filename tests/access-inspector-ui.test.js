"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const src=path.resolve(__dirname,"../src");
test("Network Monitor exposes explicit scoped allowances and revocation",()=>{
 const html=fs.readFileSync(path.join(src,"network-monitor.html"),"utf8"),
  js=fs.readFileSync(path.join(src,"network-monitor.js"),"utf8");
 for(const id of ["accessInspector","allowScope","allowStatus","allowList","monitorRows"])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(js,/allowMonitoredRequest/);
 assert.match(js,/revokeMonitoredRequest/);
 assert.match(js,/window\.confirm/);
 assert.match(js,/DKAccessInspector\.describe/);
 assert.match(html,/does NOT permit just one URL/);
 assert.ok(html.indexOf('src="access-inspector.js"')<html.indexOf('src="network-monitor.js"'));
 assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|sendNativeMessage/);
});
