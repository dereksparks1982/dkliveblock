/* DK Live Block: bounded Meta advertising delivery inventory.
   Technical possibility is NOT proof of an advertisement. Read-only, local
   evidence vocabulary; no blocking, external queries, cookies, or telemetry. */
(function(root){"use strict";
const DATA=[
 ["third-party-request","network","Third-party advertising request","ad_endpoint","request_context","review"],
 ["first-party-ad-api","network","First-party ad-specific API request","ad_endpoint","api_schema","review"],
 ["graphql-sponsored","response","Sponsored entity in GraphQL/JSON","sponsored_data","response_schema","review"],
 ["jsonl-stream","response","Sponsored entity in streamed JSON lines","sponsored_data","jsonl_record","review"],
 ["server-rendered","document","Sponsored markup in initial HTML","sponsor_label","post_boundary","review"],
 ["javascript-inserted","document","Script-inserted advertising card","sponsor_label","dynamic_insert","review"],
 ["shadow-dom","document","Advert rendered inside a web component","sponsor_label","shadow_boundary","review"],
 ["iframe-embedded","document","Advertisement inside an iframe","ad_attribution","iframe_boundary","review"],
 ["obfuscated-label","document","Split, hidden or SVG-sponsored label","decoded_label","author_header","review"],
 ["unlabeled-native","document","Native advertisement without readable label","ad_attribution","commercial_cta","observe"],
 ["right-rail","document","Sponsored sidebar section","sponsor_label","rail_section","review"],
 ["promoted-product","commerce","Promoted product or shopping listing","promoted_badge","product_card","review"],
 ["sponsored-stories","social","Sponsored story insertion","sponsor_label","story_boundary","review"],
 ["sponsored-reels","media","Sponsored reel or short-form video","sponsor_label","reel_boundary","review"],
 ["video-client-insert","media","Client-inserted video advertising","ad_break_metadata","player_ad_slot","review"],
 ["video-stitched","media","Server-stitched advertising segment","ad_break_metadata","stream_segment","observe"],
 ["image-creative","media","Static image advertising creative","ad_attribution","image_slot","review"],
 ["canvas-creative","media","Ad creative painted into canvas/WebGL","ad_attribution","canvas_context","observe"],
 ["css-overlay","document","CSS-generated or positioned ad overlay","ad_attribution","overlay_boundary","review"],
 ["popup-redirect","navigation","Sponsored popup or forced navigation","unwanted_navigation","ad_destination","review"],
 ["tracking-pixel","tracking","Advertising measurement pixel","tracker_endpoint","request_context","review"],
 ["attribution","tracking","Click/view conversion attribution","ad_attribution","request_context","review"],
 ["anti-adblock","defense","Website adblock detection or enforcement","blocker_challenge","page_enforcement","review"],
 ["notification-ad","social","Advertising via permitted notifications","notification_ad","notification_origin","observe"]
];
const entries=Object.freeze(DATA.map(([id,layer,description,signal,context,mode])=>
 Object.freeze({id,layer,description,signal,context,mode})));
const byId=new Map(entries.map(x=>[x.id,x]));
const TOKEN=/^[a-z][a-z0-9_]{2,47}$/;
function inspect(signals){
 if(!Array.isArray(signals))return [];
 const seen=new Set(signals.filter(x=>typeof x==="string"&&TOKEN.test(x)).slice(0,40));
 return entries.filter(row=>seen.has(row.signal)&&seen.has(row.context)).map(row=>
  Object.freeze({id:row.id,layer:row.layer,action:row.mode,
    evidence:Object.freeze([row.signal,row.context])}));
}
function describe(id){return typeof id==="string"?byId.get(id)||null:null;}
const API=Object.freeze({entries,describe,inspect});
root.DKMetaDeliveryCatalog=API;
if(typeof module!=="undefined")module.exports=API;
})(typeof globalThis!=="undefined"?globalThis:this);
