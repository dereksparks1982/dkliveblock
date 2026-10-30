/* DK Live Block Build 22: static, reviewed catalog. External sites are links only. */
(function(root){"use strict";
const ITEMS=Object.freeze([
 {id:"yt-dlp",name:"yt-dlp",group:"tool",summary:"Download supported videos and audio using an optional native integration.",url:"https://github.com/yt-dlp/yt-dlp",detect:true},
 {id:"ffmpeg",name:"FFmpeg",group:"tool",summary:"Merge, convert and process downloaded media.",url:"https://ffmpeg.org/download.html",detect:true},
 {id:"deno",name:"Deno",group:"tool",summary:"JavaScript runtime supported by yt-dlp for YouTube extraction.",url:"https://deno.com/",detect:true},
 {id:"node",name:"Node.js",group:"tool",summary:"Alternative JavaScript runtime supported by yt-dlp.",url:"https://nodejs.org/en/download",detect:true},
 {id:"ejs",name:"yt-dlp-ejs",group:"tool",summary:"Optional YouTube challenge scripts. Install with the matching yt-dlp release; detection is not implemented.",url:"https://github.com/yt-dlp/ejs",detect:false},
 {id:"sublime",name:"Sublime Text",group:"application",summary:"Fast Linux-compatible text editor. Continued use requires a paid license.",url:"https://www.sublimetext.com/download",detect:false},
 {id:"kate",name:"Kate",group:"application",summary:"Free and open-source advanced text editor.",url:"https://kate-editor.org/",detect:false},
 {id:"geany",name:"Geany",group:"application",summary:"Lightweight free development editor and IDE.",url:"https://www.geany.org/",detect:false},
 {id:"vscodium",name:"VSCodium",group:"application",summary:"Community-built code editor with open-source distribution.",url:"https://vscodium.com/",detect:false}
].map(item=>Object.freeze(item)));
function isTrustedLink(url){try{const u=new URL(url);return u.protocol==="https:"&&!u.username&&!u.password&&!u.hash;}catch(_){return false;}}
const api=Object.freeze({ITEMS,isTrustedLink,HOST_NAME:"dk_live_block_companion",PROTOCOL:1});
root.DKDependencyCatalog=api;
if(typeof module!=="undefined")module.exports=api;
})(typeof globalThis!=="undefined"?globalThis:this);
