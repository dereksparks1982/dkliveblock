"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const dir=path.resolve(__dirname,"../src");
test("notification defense uses native Firefox API with correct permissions and UI",()=>{
 const m=JSON.parse(fs.readFileSync(path.join(dir,"manifest.json"),"utf8"));
 const html=fs.readFileSync(path.join(dir,"options.html"),"utf8");
 const bg=fs.readFileSync(path.join(dir,"background.js"),"utf8");
 assert.equal(m.version,"0.3.21");
 assert.ok(m.permissions.includes("browserSettings"));
 assert.ok(!m.permissions.includes("notifications"));
 assert.ok(m.background.scripts.indexOf("notification-protection.js")<m.background.scripts.indexOf("background.js"));
 assert.match(html,/id="blockNotificationPrompts"/);
 assert.match(html,/id="notificationControlStatus"/);
 assert.match(bg,/DKNotificationProtection\.sync/);
 assert.match(bg,/msg\.action==="getNotificationControl"/);
});
