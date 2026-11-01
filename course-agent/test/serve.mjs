// 로컬 점검용: Worker를 Node에서 돌리고, Anthropic API 대신 모의 서버를 붙인다.
// node test/serve.mjs  →  http://localhost:8787  (접속 코드: test-code-1234)
import http from "node:http";

const MOCK_PORT = 8788, APP_PORT = 8787;
const calls = [];

// --- 모의 Anthropic API ---
http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  const j = JSON.parse(body);
  calls.push({ headers: req.headers, body: j });
  const user = j.messages[j.messages.length - 1].content;
  const stage = (user.match(/\[단계 ([^\]]+)\]/) || [, "수정"])[1];
  const text = mockText(stage, j.messages.length > 1);
  res.writeHead(200, { "content-type": "text/event-stream" });
  const send = o => res.write(`event: ${o.type}\ndata: ${JSON.stringify(o)}\n\n`);
  send({ type: "message_start", message: { usage: { input_tokens: 1200, cache_creation_input_tokens: calls.length === 1 ? 9000 : 0, cache_read_input_tokens: calls.length > 1 ? 9000 : 0 } } });
  send({ type: "content_block_start", index: 0, content_block: { type: "text", text: "" } });
  const chunks = text.match(/[\s\S]{1,40}/g);
  for (const c of chunks) { send({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: c } }); await new Promise(r => setTimeout(r, 8)); }
  send({ type: "content_block_stop", index: 0 });
  send({ type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 850 } });
  send({ type: "message_stop" });
  res.end();
}).listen(MOCK_PORT);

function mockText(stage, revised) {
  const tail = `\n\n## 넣은 가정\n- 평가제도는 일반 MBO+역량평가로 [가정]\n\n## 설계자 확인 필요\n1. 핵심 메시지 주 안이 맞는지\n2. 학습목표 수가 적당한지` + (revised ? `\n\n## 이번 수정에서 바뀐 것\n- 학습목표를 4개로 줄임` : "");
  return `## 모의 응답 · 단계 ${stage}\n\n| 항목 | 내용 |\n| --- | --- |\n| 고객사·업종 | 테스트제약 · 제약 영업 |\n| 대상 | 신임 팀장 30명 |\n| 교육 시간 | 4시간 [확인 필요] |\n\n## 문제 정의\n신임 팀장이 평가 근거를 기록하지 않아 면담에서 납득을 얻지 못한다.\n\n- **이렇게 본 이유**: 요청의 "면담 때마다 이의가 나온다"\n  - 하위 항목 예시\n- 두 번째 이유\n\n1. 첫째\n2. 둘째\n\n> 인용 예시` + tail;
}

// --- Worker를 Node에서 ---
const mod = await import(new URL("../dist/course-agent-worker.js", import.meta.url));
const env = { ANTHROPIC_API_KEY: "sk-test", ACCESS_CODE: "test-code-1234", API_BASE: `http://localhost:${MOCK_PORT}` };
http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  const request = new Request(`http://localhost:${APP_PORT}${req.url}`, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : body });
  const r = await mod.default.fetch(request, env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  if (r.body) { const rd = r.body.getReader(); for (;;) { const { value, done } = await rd.read(); if (done) break; res.write(value); } }
  res.end();
}).listen(APP_PORT, () => console.log("ready"));

// 점검용: 모의 서버가 받은 마지막 요청
http.createServer((req, res) => { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify(calls.map(c => ({ key: c.headers["x-api-key"], ver: c.headers["anthropic-version"], model: c.body.model, max: c.body.max_tokens, stream: c.body.stream, sysLen: JSON.stringify(c.body.system).length, cache: c.body.system?.[0]?.cache_control, n: c.body.messages.length, first: c.body.messages[0].content.slice(0, 120), last: c.body.messages[c.body.messages.length - 1].content.slice(0, 300) })))); }).listen(8789);
