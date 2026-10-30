"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const DK=require("../src/video-library.js");
const ID="dQw4w9WgXcQ", URL="https://www.youtube.com/watch?v="+ID;
test("strict YouTube URL parsing, canonicalization and Shorts",()=>{
 for(const u of [URL,URL+"&list=PL123&t=300", "https://youtu.be/"+ID,
   "https://m.youtube.com/watch?v="+ID,"https://www.youtube.com/shorts/"+ID])
  assert.deepEqual(DK.parseVideo(u),{id:ID,url:URL});
 for(const u of ["http://www.youtube.com/watch?v="+ID,"https://evil.example/watch?v="+ID,
  "https://youtube.com.evil.example/watch?v="+ID,"https://www.youtube.com/watch?v=bad",
  "https://www.youtube.com/playlist?list=abc","https://www.youtube.com/watch?v="+ID+"X"])
  assert.equal(DK.parseVideo(u),null);
});
test("save and resume position preserve one record per video, bounded",()=>{
 const saved=DK.save([], {id:ID,url:URL,title:"   Sample video  ",position:221.9});
 assert.equal(saved.length,1);assert.equal(saved[0].position,221);
 assert.equal(DK.resumeUrl(saved[0]),URL+"&t=221s");
 assert.equal(DK.save(saved,{id:ID,url:URL,title:"Updated",position:350}).length,1);
 assert.equal(DK.remove(saved,ID).length,0);
 assert.equal(DK.remove(saved,"not-id"),null);
});
test("malformed stored data rejected, positions clamped, titles sanitized",()=>{
 const saved=DK.save([],{id:ID,url:URL,title:"A\u0000B",position:-100});
 assert.equal(saved[0].title,"A B");
 assert.equal(saved[0].position,0);
 assert.equal(DK.normalize({id:"invalid",url:URL}),null);
 assert.deepEqual(DK.list([{id:"invalid",url:URL},saved[0]]),saved);
 assert.equal(DK.seconds(Infinity),0);
 assert.equal(DK.seconds(90000),86400);
});

test("no passive tracking, native permissions stay optional and library page has explicit actions",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const src=path.join(__dirname,"../src");
 const manifest=JSON.parse(fs.readFileSync(path.join(src,"manifest.json"),"utf8"));
 const html=fs.readFileSync(path.join(src,"popup.html"),"utf8");
 const page=fs.readFileSync(path.join(src,"library.html"),"utf8");
 const popup=fs.readFileSync(path.join(src,"popup.js"),"utf8");
 const background=fs.readFileSync(path.join(src,"background.js"),"utf8");
 assert.ok(manifest.optional_permissions.includes("nativeMessaging"));
 assert.ok(!manifest.permissions.includes("nativeMessaging"));
 for(const id of ["videoTools","saveVideo","downloadVideo","savedVideos"])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(page,/src="library.js"/);
 assert.match(popup,/saveVideo/);
 assert.match(popup,/startVideoDownload/);
 assert.match(background,/verifiedActiveVideo/);
 assert.match(background,/videoJob\.state==="running"/);
});
