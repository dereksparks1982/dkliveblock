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

test("Build 26 private backup validates all records and merges without duplicate IDs",()=>{
 const entry=DK.save([],{id:ID,url:URL,title:"A test video",position:123})[0];
 const backup=DK.exportBackup([entry]);
 assert.equal(backup.format,"DK-Live-Block-video-library");
 assert.equal(backup.version,1);
 assert.equal(DK.importBackup(backup).length,1);
 assert.equal(DK.importBackup({...backup,version:99}),null);
 assert.equal(DK.importBackup({...backup,videos:[entry,{id:"malicious",url:URL}]}),null);
 assert.equal(DK.importBackup({...backup,videos:Array(700).fill(entry)}),null);
 assert.equal(DK.merge([entry],[entry]).length,1);
 assert.deepEqual(DK.search([entry],"test").map(x=>x.id),[ID]);
 assert.deepEqual(DK.search([entry],"not here"),[]);
});
test("Build 26 library UI exposes search, sorting and local-only backup",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const html=fs.readFileSync(path.join(__dirname,"../src/library.html"),"utf8");
 const js=fs.readFileSync(path.join(__dirname,"../src/library.js"),"utf8");
 const bg=fs.readFileSync(path.join(__dirname,"../src/background.js"),"utf8");
 for(const id of ["videoSearch","videoSort","exportLibrary","importLibrary","clearLibrary"])
  assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(js,/DKVideoLibrary\.exportBackup/);
 assert.match(js,/DKVideoLibrary\.importBackup/);
 assert.match(js,/window\.confirm/);
 assert.match(bg,/importSavedVideos/);
 assert.match(bg,/clearSavedVideos/);
});

test("Build 28 auto-memory is off by default, opt-in only, and guards sender/video",()=>{
 const fs=require("node:fs"),path=require("node:path"),root=path.join(__dirname,"../src");
 const bg=fs.readFileSync(path.join(root,"background.js"),"utf8");
 const content=fs.readFileSync(path.join(root,"content.js"),"utf8");
 const opts=fs.readFileSync(path.join(root,"options.html"),"utf8");
 const settings=fs.readFileSync(path.join(root,"settings.js"),"utf8");
 assert.match(bg,/rememberVideos:false/);
 assert.match(bg,/sender\.frameId!==0/);
 assert.match(bg,/rememberVideoProgress/);
 assert.match(bg,/presented\.id!==actual\.id/);
 assert.match(settings,/rememberVideos/);
 assert.match(opts,/id="rememberVideos"/);
 assert.match(content,/lastRememberAt<30000/);
 assert.match(content,/player\.currentTime<60/);
 assert.match(content,/html5-video-player\.ad-showing/);
});

test("Build 29 favorites, watched state, notes and filters remain local and bounded",()=>{
 const original=DK.save([],{id:ID,url:URL,title:"First documentary",position:100})[0];
 assert.equal(original.favorite,false);
 assert.equal(original.watched,false);
 assert.equal(original.note,"");
 const modified=DK.updateMetadata([original],ID,{favorite:true,watched:true,note:"Important note!\nKeep watching."});
 assert.equal(modified[0].favorite,true);
 assert.equal(modified[0].watched,true);
 assert.equal(modified[0].note,"Important note!\nKeep watching.");
 assert.equal(DK.search(modified,"important","newest","favorites").length,1);
 assert.equal(DK.search(modified,"","newest","unfinished").length,0);
 assert.equal(DK.search(modified,"","newest","watched").length,1);
 assert.equal(DK.updateMetadata(modified,ID,{favorite:"yes"}),null);
 assert.equal(DK.updateMetadata(modified,ID,{note:"x".repeat(6000)}),null);
 assert.equal(DK.updateMetadata(modified,"bad",{favorite:true}),null);
 const renewed=DK.save(modified,{id:ID,url:URL,title:"New title",position:200})[0];
 assert.equal(renewed.favorite,true);
 assert.equal(renewed.note,modified[0].note);
 assert.equal(DK.importBackup(DK.exportBackup([renewed]))[0].watched,true);
});
