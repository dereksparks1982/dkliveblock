"use strict";
/* Opt-in developer tool. Reads TWO local exports, emits sanitized counts only. */
const fs=require("node:fs");
const Outcome=require("../src/youtube-outcome.js");
const LIMIT=3*1024*1024;
function read(file){
 const stat=fs.statSync(file);
 if(!stat.isFile()||stat.size>LIMIT)throw Error("Report file exceeds safe local size");
 const parsed=JSON.parse(fs.readFileSync(file,"utf8"));
 if(parsed?.format!=="DK Live Block YouTube compatibility report")
  throw Error("Expected a DK Live Block YouTube compatibility report");
 return parsed;
}
function inspect(first,second){return Outcome.compare(first,second);}
if(require.main===module){
 if(process.argv.length!==4){console.error("Provide two local YouTube report JSON files");process.exitCode=2;}
 else try{
  const summary=inspect(read(process.argv[2]),read(process.argv[3]));
  process.stdout.write(JSON.stringify(summary,null,2)+"\\n");
 }catch(_){console.error("Local report comparison failed; source paths and content are not displayed.");process.exitCode=1;}
}
module.exports={LIMIT,read,inspect};
