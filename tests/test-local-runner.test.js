"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {spawnSync}=require("node:child_process");
const RUNNER=path.join(__dirname,"../scripts/test-local.sh");

// Runs only a copy of the shell runner with fake test programs, never Firefox.
function runFixture(failing,approved=false){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"dk-live-block-test-gate-"));
 try{
  const bin=path.join(root,"bin");
  for(const name of ["scripts","src","tests","bin"])fs.mkdirSync(path.join(root,name),{recursive:true});
  fs.copyFileSync(RUNNER,path.join(root,"scripts/test-local.sh"));
  fs.writeFileSync(path.join(root,"src/fixture.js"),"/* synthetic */\n");
  fs.writeFileSync(path.join(root,"tests/fixture.js"),"/* synthetic */\n");
  const fakeNode=[
   "#!/usr/bin/env bash",
   'if [[ "$1" == "--check" ]]; then exit 0; fi',
   'if [[ "$1" != "--test" ]]; then exit 91; fi',
   'if [[ "${DKLB_FIXTURE_FAIL:-}" == "yes" && "$*" == *"tests/version-contract.test.js"* ]]; then',
   " printf '# tests 3\\n# suites 0\\n# pass 2\\n# fail 1\\n# cancelled 0\\n# skipped 0\\n# todo 0\\n'",
   " exit 2",
   "fi",
   "printf '# tests 3\\n# suites 0\\n# pass 2\\n# fail 0\\n# cancelled 0\\n# skipped 1\\n# todo 0\\n'"
  ].join("\n")+"\n";
  const fakePython=[
   "#!/usr/bin/env bash",
   'if [[ "${DKLB_FIXTURE_FAIL:-}" == "yes" && "$1" == "scripts/test-companion.py" ]]; then exit 7; fi',
   "exit 0"
  ].join("\n")+"\n";
  fs.writeFileSync(path.join(bin,"node"),fakeNode,{mode:0o755});
  fs.writeFileSync(path.join(bin,"python3"),fakePython,{mode:0o755});
  if(failing||approved){
   const workflows=path.join(root,".github/workflows");
   fs.mkdirSync(workflows,{recursive:true});
   if(failing)fs.writeFileSync(path.join(workflows,"fixture.yml"),"# unreviewed workflow\n");
   else fs.copyFileSync(path.resolve(__dirname,"../.github/workflows/offline-verification.yml"),
    path.join(workflows,"offline-verification.yml"));
  }
  const result=spawnSync("bash",[path.join(root,"scripts/test-local.sh")],{
   cwd:root,encoding:"utf8",timeout:25000,maxBuffer:250000,
   env:{...process.env,DKLB_FIXTURE_FAIL:failing?"yes":"no",PATH:bin+path.delimiter+process.env.PATH}
  });
  if(result.error)throw result.error;
  return {status:result.status,output:result.stdout+"\n"+result.stderr};
 }finally{fs.rmSync(root,{recursive:true,force:true});}
}

test("Build 161: all seven phases run and TAP totals include legitimate skipped cases",()=>{
 const result=runFixture(false);
 assert.equal(result.status,0,result.output);
 assert.equal((result.output.match(/PHASE START:/g)||[]).length,7);
 assert.match(result.output,/Node cases: 6 total, 4 passed, 0 failed, 2 skipped, 0 todo, 0 cancelled/);
 assert.match(result.output,/Python companion scripts: 6 executed, 0 failed/);
 assert.match(result.output,/FINAL PASS: 7 offline phases passed/);
});
test("Build 161: failures do not hide later phases and final exit remains nonzero",()=>{
 const result=runFixture(true);
 assert.equal(result.status,1,result.output);
 assert.equal((result.output.match(/PHASE START:/g)||[]).length,7);
 assert.match(result.output,/PHASE START: Offline Firefox release audit/);
 assert.match(result.output,/Node cases: 6 total, 4 passed, 1 failed, 1 skipped, 0 todo, 0 cancelled/);
 assert.match(result.output,/Python companion scripts: 6 executed, 1 failed/);
 assert.match(result.output,/FINAL FAIL: 3 of 7 offline phases failed/);
});

test("Build 283: reviewed on-demand Linux workflow passes the restricted CI gate",()=>{
 const result=runFixture(false,true);
 assert.equal(result.status,0,result.output);
 assert.match(result.output,/PHASE PASS: Restricted GitHub Actions policy/);
 assert.equal((result.output.match(/PHASE START:/g)||[]).length,7);
});
