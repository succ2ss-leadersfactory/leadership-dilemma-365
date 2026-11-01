// 빌드: node build.mjs  →  dist/course-agent-worker.js (Cloudflare Worker에 붙여 넣을 한 파일)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const here = new URL(".", import.meta.url);
const read = p => readFileSync(new URL(p, here), "utf8");

const knowledge = read("src/knowledge.md");
const stages = read("src/stages.js");
let html = read("src/app.html");

const safeScript = s => s.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "<\\!--");
html = html.replace("/*__STAGES__*/", () => safeScript(stages));
html = html.replace("__KNOWLEDGE_JSON__", () => safeScript(JSON.stringify(knowledge)));

const worker = read("src/worker.template.js").replace("__APP_HTML__", () => JSON.stringify(html));

mkdirSync(new URL("dist/", here), { recursive: true });
writeFileSync(new URL("dist/course-agent-worker.js", here), worker);
writeFileSync(new URL("dist/app-preview.html", here), html);
console.log("worker", (worker.length / 1024).toFixed(1) + "KB", "· html", (html.length / 1024).toFixed(1) + "KB");
