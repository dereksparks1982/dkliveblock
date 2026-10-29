"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {isSubscriptionWall,shouldHide}=require("../src/paywall.js");
test("detect explicit subscription demands covering an article",()=>{
 for(const text of [
  "Subscribe to continue reading",
  "Subscribe now to keep reading this article",
  "Sign up to read the full article",
  "To continue reading, become a subscriber",
  "You've reached your free article limit",
  "Subscriber-only article. Subscribe to continue reading",
  "Unlock the full article with a subscription",
  "Subscribe to read this story"
 ])assert.equal(isSubscriptionWall(text),true,text);
});
test("never confuse ordinary journalism, donations and unrelated site dialogs",()=>{
 for(const text of [
  "Subscribe to our newsletter",
  "Donate to support independent journalism",
  "Sign in to your account",
  "Privacy settings and cookie preferences",
  "Read why newspapers use subscriptions",
  "The Wall Street Journal reports on tariffs",
  "You need to confirm your purchase",
  "Support us by disabling your ad blocker",
  "Subscribe to continue watching"
 ])assert.equal(isSubscriptionWall(text),false,text);
});
test("only cover a modal when meaningful article text is present",()=>{
 const view={text:"Subscribe to continue reading",visible:true,overlay:true,articleLoaded:true};
 assert.equal(shouldHide(view),true);
 for(const flag of [{visible:false},{overlay:false},{articleLoaded:false},{containsPlayer:true},{rootElement:true}])
  assert.equal(shouldHide({...view,...flag}),false,JSON.stringify(flag));
});
test("blank, oversized and non-text content are safe",()=>{
 assert.equal(isSubscriptionWall(""),false);
 assert.equal(isSubscriptionWall(null),false);
 assert.equal(shouldHide({text:"Subscribe to continue reading",visible:true,overlay:true,articleLoaded:false}),false);
});
