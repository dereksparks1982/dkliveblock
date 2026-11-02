"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const base=path.join(__dirname,"..");
test("Build 253 mirrored project pages link to websites, never to project repositories",()=>{
 const root=fs.readFileSync(path.join(base,"index.html"),"utf8");
 const docs=fs.readFileSync(path.join(base,"docs/index.html"),"utf8");
 const paths=["Hanafi-Islam-Learning-Deck","folkhold","capitalandconsequence"];
 for(const html of [root,docs]){
  const area=html.slice(html.indexOf('<section id="more-elderred-projects"'),html.lastIndexOf("</main>"));
  assert.ok(area.startsWith('<section id="more-elderred-projects"'));
  for(const p of paths)assert.ok(area.includes('https://dereksparks1982.github.io/'+p+'/'),p);
  assert.equal((area.match(/<article>/g)||[]).length,3);
  assert.equal((area.match(/class="project-link-button"/g)||[]).length,3);
  assert.match(html,/#more-elderred-projects \.project-link-button\{display:flex/);
  assert.match(html,/#more-elderred-projects \.cards article>p:last-child\{margin-top:auto/);

  assert.ok(!area.includes("Nougat Media Plus"));
  assert.ok(!area.includes("Nougat-Media-Plus"));
  assert.equal(area.includes("https://github.com/dereksparks1982/"),false);
 }
 assert.equal(root,docs);
});
