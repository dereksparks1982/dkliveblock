/* DK Live Block Build 275: descriptive Agent Nesty team catalog.
   Canonical names describe responsibilities. Historical numeric IDs remain
   aliases for logs, tests and saved references, never independent agents. */
(function(root){"use strict";
const specialists=Object.freeze([
 Object.freeze({id:"nesty_cookie_watch",key:"cookie",title:"Nesty Cookie Watch",
  role:"Observe cookie-setting attempts; never collect cookie values or block cookies",
  mode:"observer",legacyIds:Object.freeze(["agent_nesty_1","agent_nesty_2","agent_nesty_3"]),
  methods:Object.freeze(["HTTP response headers","Firefox cookie changes","JavaScript cookie writes"])}),
 Object.freeze({id:"nesty_popup_guard",key:"popup",title:"Nesty Popup Guard",
  role:"Evaluate unwanted new tabs, foreign redirects and original-tab takeovers",
  mode:"guard",legacyIds:Object.freeze(["agent_nesty_4","agent_nesty_5"]),
  methods:Object.freeze(["Strict new-tab trap","Source-linked foreign navigation","Confirmed-video original-tab takeover"])}),
 Object.freeze({id:"nesty_meta_ad_scout",key:"meta",title:"Nesty Meta Ad Scout",
  role:"Recognize bounded Facebook advertising signals without hiding ordinary posts",
  mode:"detector",legacyIds:Object.freeze([
   "agent_nesty_meta_01","agent_nesty_meta_02","agent_nesty_meta_03",
   "agent_nesty_meta_04","agent_nesty_meta_05","agent_nesty_meta_06"
  ]),
  methods:Object.freeze(["Fragmented Sponsored labels","Sponsored menu wording",
   "CSS visibility changes","Temporary ad-label reuse","GraphQL envelope safety",
   "Referenced Sponsored labels"])}),
 Object.freeze({id:"nesty_layout_scout",key:"layout",title:"Nesty Layout Scout",
  role:"Review bounded page-spacing and empty-slot diagnostics without changing page layout",
  mode:"advisor",legacyIds:Object.freeze([]),
  methods:Object.freeze(["On-demand layout count review","Repeated-count pattern detection",
   "Manual-only repair suggestions"])}),
]);
function byKey(key){return specialists.find(x=>x.key===key)||null;}
function byId(id){return specialists.find(x=>x.id===id||x.legacyIds.includes(id))||null;}
const api=Object.freeze({all:()=>specialists,byKey,byId});
root.DKNestyTeam=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
