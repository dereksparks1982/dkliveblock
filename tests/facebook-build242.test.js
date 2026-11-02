"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict");
const FB=require("../src/facebook-ads.js");
function node({label="",heading=false,article=false,width=500,height=250}={}){
 const n={nodeType:1,children:[],parentElement:null,isConnected:true,
  style:{setProperty(){}},
  getAttribute:k=>k==="aria-label"?label:null,
  getBoundingClientRect:()=>({width,height,left:100}),
  getClientRects:()=>[{}],
  matches:s=>article&&s.includes('[role="article"]'),
  closest(s){let x=this;while(x){if(s.includes('[role="article"]')&&x.article)return x;
    if(s.includes("nav")&&x.protected)return x;x=x.parentElement;}return null;},
  contains(x){while(x){if(x===this)return true;x=x.parentElement;}return false;},
  querySelector(s){return heading&&s.includes("heading")?{}:null;},
  querySelectorAll(s){if(s.includes("aria-label"))return this.labels||[];
    return this.articles||[];}
 };
 n.article=article;return n;
}
function link(a,b){a.children.push(b);b.parentElement=a;return b;}
function fixture({landmark=false,multiple=false,protectedCard=false}={}){
 const body=node({height:900}), card=link(body,node({heading:true})),
  post=landmark?link(card,node({article:true,heading:true})):card,
  menu=link(post,node({label:"Open menu for Sponsored content"}));
 body.matches=()=>false;
 card.protected=protectedCard;
 post.labels=multiple?[menu,node({label:"Open menu for Sponsored content"})]:[menu];
 card.labels=post.labels;
 const doc={body,documentElement:node(),querySelectorAll:()=>[]};
 const win={innerWidth:1280};
 return {doc,win,post,menu};
}
test("Build 242: sponsored menu can resolve its own card without inspector",()=>{
 const {doc,win,post,menu}=fixture();
 assert.equal(FB.sponsoredFeedCard(menu,doc,win),post);
});
test("Build 242: designated single-post landmark has precedence",()=>{
 const {doc,win,post,menu}=fixture({landmark:true});
 assert.equal(FB.sponsoredFeedCard(menu,doc,win),post);
});
test("Build 242: multiple sponsored menus prevent broad wrapper fallback",()=>{
 const {doc,win,menu}=fixture({multiple:true});
 assert.equal(FB.sponsoredFeedCard(menu,doc,win),null);
});
test("Build 242: non-sponsored labels never hide a post",()=>{
 const {doc,win,menu}=fixture();
 menu.getAttribute=()=>"Open menu for ordinary post";
 assert.equal(FB.sponsoredFeedCard(menu,doc,win),null);
});
