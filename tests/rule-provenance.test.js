"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const R=require("../src/rules.js"),P=require("../src/rule-provenance.js");
test("native blocked rule source matches full parsed key, not just target hostname",()=>{
 const index=P.create([{name:"Built-in fallback",text:"||doubleclick.net^\n||ads.test^$script"},
  {name:"EasyList",text:"||ads.test^$script\n||other.test^$image"},
  {name:"User custom filters",text:"||youtube.com^$xmlhttprequest,domain=site.test"}],R.network);
 assert.equal(P.identify(R.network("||doubleclick.net^"),index),"Built-in fallback");
 assert.equal(P.identify(R.network("||ads.test^$script"),index),"Multiple active filter sources");
 assert.equal(P.identify(R.network("||other.test^$image"),index),"EasyList");
 assert.equal(P.identify(R.network("||youtube.com^$xmlhttprequest,domain=site.test"),index),"User custom filters");
 assert.equal(P.identify(R.network("||youtube.com^$xmlhttprequest,domain=other.test"),index),"Unattributed active filter");
});
test("never expose custom subscription URL or raw secret as filter source",()=>{
 const index=P.create([{name:"https://private.example/rules?token=SECRET",text:"||ads.test^"}],R.network);
 assert.equal(P.identify(R.network("||ads.test^"),index),"Unattributed active filter");
 assert.equal(P.identify({p:"[Ghostery network filter]"},index),"Embedded Ghostery filter match");
 assert.equal(P.identify({p:"[User-selected block]"},index),"User-selected host/type block");
 assert.equal(P.clean("Custom subscription 9"),"Custom subscription 9");
});
