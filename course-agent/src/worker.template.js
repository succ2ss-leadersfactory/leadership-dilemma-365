/**
 * 과정개발 에이전트 · 연결 서버 (Cloudflare Worker)
 *
 * 이 파일 하나를 Worker에 붙여 넣으면
 *   GET  /            → 웹앱 화면
 *   POST /api/check   → 교육 코드 확인, 모델 이름 알려 주기
 *   POST /api/messages → Anthropic Messages API로 전달(스트리밍)
 *
 * Worker 설정 › 변수와 비밀(Variables and Secrets)에 넣을 값
 *   ANTHROPIC_API_KEY  (비밀, 필수)  Anthropic Console에서 만든 API 키
 *   ACCESS_CODE        (비밀, 필수)  웹앱에 들어갈 때 쓰는 코드, 16자 이상 권장
 *   MODEL              (선택)        기본값 claude-sonnet-5-5
 *   MAX_TOKENS         (선택)        한 번 응답의 최대 길이, 기본값 12000
 *
 * 웹앱 화면과 방법론 문서는 이 파일 아래쪽 APP_HTML에 들어 있다.
 * 빌드: node build.mjs  →  dist/course-agent-worker.js
 */

const DEFAULT_MODEL = "claude-sonnet-5-5";
const DEFAULT_MAX_TOKENS = 12000;
const HARD_MAX_TOKENS = 32000;
const MAX_BODY_BYTES = 600 * 1024;
const ANTHROPIC_VERSION = "2023-06-01";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return new Response(APP_HTML, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
          "referrer-policy": "no-referrer",
        },
      });
    }

    if (url.pathname === "/api/check" && request.method === "POST") {
      const denied = checkAccess(request, env);
      if (denied) return denied;
      return json({
        ok: true,
        model: env.MODEL || DEFAULT_MODEL,
        maxTokens: maxTokens(env),
      });
    }

    if (url.pathname === "/api/messages" && request.method === "POST") {
      const denied = checkAccess(request, env);
      if (denied) return denied;
      return relay(request, env);
    }

    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204 });
    return json({ error: "없는 주소입니다." }, 404);
  },
};

function maxTokens(env) {
  const n = parseInt(env.MAX_TOKENS || "", 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MAX_TOKENS;
  return Math.min(n, HARD_MAX_TOKENS);
}

function checkAccess(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "연결 서버에 ANTHROPIC_API_KEY가 없습니다. Worker 설정에서 비밀 값으로 넣어 주세요." }, 500);
  }
  if (!env.ACCESS_CODE) {
    return json({ error: "연결 서버에 ACCESS_CODE가 없습니다. Worker 설정에서 비밀 값으로 넣어 주세요." }, 500);
  }
  const given = request.headers.get("x-access-code") || "";
  if (!safeEqual(given, env.ACCESS_CODE)) {
    return json({ error: "접속 코드가 맞지 않습니다." }, 401);
  }
  return null;
}

function safeEqual(a, b) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  const n = Math.max(ea.length, eb.length);
  for (let i = 0; i < n; i++) diff |= (ea[i] || 0) ^ (eb[i] || 0);
  return diff === 0;
}

async function relay(request, env) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ error: "보내는 내용이 너무 깁니다. 붙여 넣은 자료를 줄여 주세요." }, 413);
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "요청 형식이 올바르지 않습니다." }, 400);
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: "messages가 비어 있습니다." }, 400);
  }

  // 모델과 길이는 서버가 정한다. 화면에서 보낸 값은 쓰지 않는다.
  const payload = {
    model: env.MODEL || DEFAULT_MODEL,
    max_tokens: maxTokens(env),
    stream: true,
    messages: body.messages,
  };
  if (body.system) payload.system = body.system;

  const base = env.API_BASE || "https://api.anthropic.com";
  let upstream;
  try {
    upstream = await fetch(base + "/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return json({ error: "Anthropic API에 연결하지 못했습니다. 잠시 뒤 다시 해 주세요." }, 502);
  }

  if (!upstream.ok) {
    let detail = "";
    try {
      const j = await upstream.json();
      detail = (j && j.error && j.error.message) || "";
    } catch {}
    return json({ error: explain(upstream.status, detail), status: upstream.status, detail }, upstream.status);
  }

  return new Response(upstream.body, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function explain(status, detail) {
  if (status === 401) return "API 키가 올바르지 않습니다. Worker의 ANTHROPIC_API_KEY를 확인해 주세요.";
  if (status === 403) return "이 API 키로는 요청할 수 없습니다. 워크스페이스 권한을 확인해 주세요.";
  if (status === 404) return "모델을 찾지 못했습니다. Worker의 MODEL 값을 확인해 주세요.";
  if (status === 413) return "보내는 내용이 너무 깁니다.";
  if (status === 429) return "사용 한도에 닿았습니다. 잠시 뒤 다시 하거나 Console에서 한도를 확인해 주세요.";
  if (status === 529 || status >= 500) return "Anthropic API가 잠시 붐빕니다. 1~2분 뒤 다시 해 주세요.";
  if (/credit|balance/i.test(detail)) return "API 크레딧이 부족합니다. Console에서 결제 상태를 확인해 주세요.";
  return "요청을 처리하지 못했습니다. (" + status + ") " + detail;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

const APP_HTML = __APP_HTML__;
