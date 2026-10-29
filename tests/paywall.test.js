"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {isSubscriptionWall,shouldHide,hasLoadedArticle}=require("../src/paywall.js");
test("subscription demands covering already-loaded articles",()=>{
 for(const txt of ["Subscribe to continue reading","Subscribe now to keep reading this article","Sign up to read the full article","To continue reading, become a subscriber","You've reached your free article limit","Subscriber-only article. Subscribe to continue reading","Unlock the full article with a subscription","Subscribe to read this story"])
  assert.equal(isSubscriptionWall(txt),true,txt);
});
test("exclude donation banners, account dialogs, cookie notices, anti-adblock demands",()=>{
 for(const txt of ["Subscribe to our newsletter","Donate to support independent journalism","Sign in to your account","Privacy settings and cookie preferences","Read why newspapers use subscriptions","The Wall Street Journal reports on tariffs","You need to confirm your purchase","Support us by disabling your ad blocker","Subscribe to continue watching"])
  assert.equal(isSubscriptionWall(txt),false,txt);
});
test("require article content, a visible overlay and no embedded media",()=>{
 const v={text:"Subscribe to continue reading",visible:true,overlay:true,articleLoaded:true};
 assert.equal(shouldHide(v),true);
 for(const flags of [{visible:false},{overlay:false},{articleLoaded:false},{containsPlayer:true},{rootElement:true}])assert.equal(shouldHide({...v,...flags}),false);
});
test("article evidence requires actual paragraphs rather than a teaser",()=>{
 const article={querySelectorAll:()=>[...Array(5)].map(()=>({textContent:"A detailed article paragraph with a substantial amount of content already in the browser. ".repeat(3)}))};
 const stub={querySelectorAll:q=>q==="article"?[article]:[]};
 const teaser={querySelectorAll:()=>[{textContent:"A headline."},{textContent:"Subscribe to read."}]};
 assert.equal(hasLoadedArticle(stub),true);
 assert.equal(hasLoadedArticle({querySelectorAll:q=>q==="article"?[teaser]:[]}),false);
 assert.equal(hasLoadedArticle(null),false);
});
