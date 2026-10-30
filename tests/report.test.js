"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const S=require("../src/support.js");
const fs=require("node:fs"),path=require("node:path");
test("official support address is stable and voluntarily usable",()=>{
 assert.equal(S.SUPPORT_EMAIL,"elderredsoftworks@proton.me");
 const r=S.buildReport({kind:"popup",description:"Scam tab appeared after clicking a torrent link.",
  website:"https://1337x.to/download?account_token=PRIVATE_TOKEN",version:"0.3.8"});
 assert.equal(r.subject,"DK Live Block: Unwanted popup or redirect");
 assert.match(r.body,/1337x\.to/);
 assert.match(r.body,/0\.3\.8/);
 assert.doesNotMatch(r.body,/PRIVATE_TOKEN|\/download|account_token/);
 assert.equal(S.bugMailto(r).startsWith("mailto:elderredsoftworks@proton.me?subject="),true);
 assert.ok(decodeURIComponent(S.bugMailto(r)).includes("Scam tab appeared"));
});
test("report input is bounded and invalid sites rejected",()=>{
 const base={kind:"bug",description:"A website is broken after enabling the blocker."};
 assert.equal(S.buildReport({...base,kind:"unknown"}),null);
 assert.equal(S.buildReport({...base,description:"short"}),null);
 assert.equal(S.buildReport({...base,website:"javascript:alert(1)"}),null);
 assert.equal(S.buildReport({...base,website:"https://someone:secret@example.org/"}),null);
 assert.equal(S.buildReport({...base,website:"https://example.org:443/path?token=secret"}).body.includes("secret"),false);
 assert.equal(S.buildReport({...base,description:"x".repeat(2300)}).body.includes("x".repeat(1801)),false);
 assert.equal(S.bugMailto({subject:"OK",body:"x".repeat(7000)}),"");
});
test("report page has explicit review, copy and email controls, no hidden upload",()=>{
 const dir=path.join(__dirname,"../src");
 const html=fs.readFileSync(path.join(dir,"report.html"),"utf8");
 const script=fs.readFileSync(path.join(dir,"report.js"),"utf8");
 const popup=fs.readFileSync(path.join(dir,"popup.html"),"utf8");
 const settings=fs.readFileSync(path.join(dir,"options.html"),"utf8");
 for(const id of ["bugReportForm","reportKind","reportWebsite","reportDescription",
  "reportPreview","reportDraftSection","copyReport","openEmailDraft"])assert.ok(html.includes('id="'+id+'"'));
 assert.match(html,/elderredsoftworks@proton\.me/);
 assert.match(popup,/id="reportBug"/);
 assert.match(settings,/id="openBugReport"/);
 assert.match(script,/DKSupport\.buildReport/);
 assert.match(script,/DKSupport\.bugMailto/);
 assert.match(script,/addEventListener\("click"/);
 assert.doesNotMatch(script,/fetch\(|XMLHttpRequest|sendNativeMessage|storage\.local/);
});
