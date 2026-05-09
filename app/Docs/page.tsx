"use client";

import { useState } from "react";

const ENDPOINTS = [
  {
    id: "mask",
    method: "POST",
    path: "/api/mask",
    description: "Mask sensitive values in a plain text string. Detected values are replaced with vault tokens.",
    headers: [
      { name: "x-api-key", type: "string", required: true, description: "Your Vault API key" },
      { name: "Content-Type", type: "string", required: true, description: "application/json" },
    ],
    body: [
      { name: "text", type: "string", required: true, description: "The plain text string to mask" },
    ],
    response: `{
  "masked": "My card is __CARD_a1b2c3__ and email is __EMAIL_d4e5f6__"
}`,
    curl: `curl -X POST https://yourdomain.com/api/mask \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "My card is 4111111111111111 and email is john@gmail.com"}'`,
    js: `const res = await fetch("https://yourdomain.com/api/mask", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "My card is 4111111111111111 and email is john@gmail.com",
  }),
});

const { masked } = await res.json();`,
    python: `import requests

res = requests.post(
  "https://yourdomain.com/api/mask",
  headers={
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  json={"text": "My card is 4111111111111111 and email is john@gmail.com"},
)

masked = res.json()["masked"]`,
  },
  {
    id: "unmask",
    method: "POST",
    path: "/api/unmask",
    description: "Restore original values from a string containing vault tokens.",
    headers: [
      { name: "x-api-key", type: "string", required: true, description: "Your Vault API key" },
      { name: "Content-Type", type: "string", required: true, description: "application/json" },
    ],
    body: [
      { name: "text", type: "string", required: true, description: "The string containing vault tokens to unmask" },
    ],
    response: `{
  "unmasked": "My card is 4111111111111111 and email is john@gmail.com"
}`,
    curl: `curl -X POST https://yourdomain.com/api/unmask \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "My card is __CARD_a1b2c3__ and email is __EMAIL_d4e5f6__"}'`,
    js: `const res = await fetch("https://yourdomain.com/api/unmask", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "My card is __CARD_a1b2c3__ and email is __EMAIL_d4e5f6__",
  }),
});

const { unmasked } = await res.json();`,
    python: `import requests

res = requests.post(
  "https://yourdomain.com/api/unmask",
  headers={
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  json={"text": "My card is __CARD_a1b2c3__ and email is __EMAIL_d4e5f6__"},
)

unmasked = res.json()["unmasked"]`,
  },
  {
    id: "mask-deep",
    method: "POST",
    path: "/api/mask-deep",
    description: "Recursively mask sensitive values inside any JSON object or array. Every string field is scanned and masked automatically.",
    headers: [
      { name: "x-api-key", type: "string", required: true, description: "Your Vault API key" },
      { name: "Content-Type", type: "string", required: true, description: "application/json" },
    ],
    body: [
      { name: "any", type: "object | array", required: true, description: "Any valid JSON — objects, arrays, nested structures" },
    ],
    response: `{
  "masked": {
    "name": "John",
    "email": "__EMAIL_d4e5f6__",
    "payment": {
      "card": "__CARD_a1b2c3__",
      "cvv": "__CVV_x7y8z9__"
    }
  }
}`,
    curl: `curl -X POST https://yourdomain.com/api/mask-deep \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@gmail.com",
  "payment":{"card":"4111111111111111","cvv":"123"}}'`,
    js: `const res = await fetch("https://yourdomain.com/api/mask-deep", {
  method: "POST",
  headers: {
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "John",
    email: "john@gmail.com",
    payment: { card: "4111111111111111", cvv: "123" },
  }),
});

const { masked } = await res.json();`,
    python: `import requests

res = requests.post(
  "https://yourdomain.com/api/mask-deep",
  headers={
    "x-api-key": "YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  json={
    "name": "John",
    "email": "john@gmail.com",
    "payment": {"card": "4111111111111111", "cvv": "123"},
  },
)

masked = res.json()["masked"]`,
  },
];

type Lang = "curl" | "js" | "python";

const METHOD_COLORS: Record<string, string> = {
  POST:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  GET:    "bg-blue-50 text-blue-700 border-blue-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
  PATCH:  "bg-amber-50 text-amber-700 border-amber-200",
};

const LANG_LABELS: Record<Lang, string> = {
  curl: "cURL",
  js: "JavaScript",
  python: "Python",
};

type Endpoint = typeof ENDPOINTS[number];

// ── Syntax highlighter ──────────────────────────────────────────────────────
// GitHub Dark color palette
const C = {
  keyword:  "#ff7b72", // red-pink   — keywords, HTTP methods
  string:   "#a5d6ff", // light blue — strings, URLs
  strVal:   "#a8ff97", // green      — string values / single-quoted args
  number:   "#f0883e", // orange     — numbers
  builtin:  "#79c0ff", // blue       — builtins, commands
  param:    "#d2a8ff", // purple     — flags, keys, params
  comment:  "#8b949e", // grey       — comments
  plain:    "#e6edf3", // off-white  — default text
  operator: "#f0883e", // orange     — operators
};

type Token = { text: string; color: string };

function applyPatterns(
  text: string,
  patterns: { re: RegExp; color: string }[]
): Token[] {
  const matches: { index: number; end: number; color: string; text: string }[] = [];

  for (const { re, color } of patterns) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      // Use first capture group if present, else full match
      const matched = m[1] ?? m[0];
      const offset = m[1] ? m.index + m[0].indexOf(m[1]) : m.index;
      matches.push({ index: offset, end: offset + matched.length, color, text: matched });
    }
  }

  // Sort; discard overlapping (keep first)
  matches.sort((a, b) => a.index - b.index);
  const tokens: Token[] = [];
  let pos = 0;
  for (const match of matches) {
    if (match.index < pos) continue;
    if (match.index > pos) tokens.push({ text: text.slice(pos, match.index), color: C.plain });
    tokens.push({ text: match.text, color: match.color });
    pos = match.end;
  }
  if (pos < text.length) tokens.push({ text: text.slice(pos), color: C.plain });
  return tokens;
}

function tokenizeCurl(code: string): Token[] {
  return applyPatterns(code, [
    // curl command
    { re: /\bcurl\b/g,                                         color: C.builtin },
    // flags  -X  -H  -d  --data  etc.
    { re: /(\s)(-{1,2}[a-zA-Z][-\w]*)/g,                      color: C.param },
    // HTTP method after -X
    { re: /\b(POST|GET|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/g,     color: C.keyword },
    // URL
    { re: /https?:\/\/[^\s\\'"\n]+/g,                          color: C.string },
    // single-quoted JSON value strings
    { re: /'[^']*'/g,                                          color: C.strVal },
    // double-quoted header/key strings
    { re: /"[^"]*"/g,                                          color: C.string },
    // numbers
    { re: /\b\d+\b/g,                                          color: C.number },
    // backslash line continuation
    { re: /\\/g,                                               color: C.comment },
  ]);
}

function tokenizeJS(code: string): Token[] {
  return applyPatterns(code, [
    // comments first so they aren't broken apart
    { re: /\/\/.*/g,                                                            color: C.comment },
    // template literals
    { re: /`[^`]*`/g,                                                           color: C.strVal },
    // regular strings
    { re: /"[^"]*"|'[^']*'/g,                                                  color: C.strVal },
    // keywords
    { re: /\b(const|let|var|await|async|return|new|import|export|from|function|if|else|true|false|null|undefined|of|in|for|while|do|class|extends|try|catch|throw|typeof|instanceof)\b/g, color: C.keyword },
    // built-ins / globals
    { re: /\b(fetch|JSON|Object|Array|Promise|console|Math|parseInt|parseFloat|Boolean|String|Number|res|req|response|request)\b/g, color: C.builtin },
    // object keys  key:
    { re: /([a-zA-Z_$][\w$]*)(?=\s*:(?!:))/g,                                 color: C.param },
    // numbers
    { re: /\b\d+(\.\d+)?\b/g,                                                  color: C.number },
    // operators
    { re: /[=!<>]=?|&&|\|\||[+\-*/%]/g,                                        color: C.operator },
  ]);
}

function tokenizePython(code: string): Token[] {
  return applyPatterns(code, [
    // comments
    { re: /#.*/g,                                                               color: C.comment },
    // triple-quoted strings
    { re: /"""[\s\S]*?"""|'''[\s\S]*?'''/g,                                    color: C.strVal },
    // regular strings
    { re: /"[^"]*"|'[^']*'/g,                                                  color: C.strVal },
    // keywords
    { re: /\b(import|from|as|def|class|return|if|elif|else|for|while|in|not|and|or|True|False|None|with|try|except|finally|raise|pass|lambda|yield|global|nonlocal|del|assert|break|continue)\b/g, color: C.keyword },
    // builtins / common names
    { re: /\b(print|len|range|str|int|float|list|dict|set|tuple|type|open|super|self|cls|requests|json|os|sys|re|math|datetime|Path)\b/g, color: C.builtin },
    // function / method calls
    { re: /([a-zA-Z_]\w*)(?=\s*\()/g,                                          color: C.builtin },
    // dict / kwarg keys   key=  or  "key":
    { re: /([a-zA-Z_]\w*)(?=\s*=(?!=))/g,                                      color: C.param },
    // numbers
    { re: /\b\d+(\.\d+)?\b/g,                                                  color: C.number },
    // decorators
    { re: /@[\w.]+/g,                                                           color: C.param },
  ]);
}

function highlight(code: string, lang: Lang): Token[] {
  if (lang === "curl")   return tokenizeCurl(code);
  if (lang === "js")     return tokenizeJS(code);
  return tokenizePython(code);
}

function HighlightedCode({ code, lang }: { code: string; lang: Lang }) {
  const tokens = highlight(code, lang);
  return (
    <code>
      {tokens.map((t, i) =>
        t.color !== C.plain ? (
          <span key={i} style={{ color: t.color }}>{t.text}</span>
        ) : (
          <span key={i} style={{ color: C.plain }}>{t.text}</span>
        )
      )}
    </code>
  );
}
// ────────────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeLang, setActiveLang] = useState<Lang>("curl");
  const [copied, setCopied] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("mask");

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#1a1a1a]">
      {/* Top nav */}
      <div className="border-b border-black/8 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-lg font-bold tracking-tight hover:opacity-70 transition-opacity">
              Vault
            </a>
            <span className="text-black/20">/</span>
            <span className="text-sm text-black/40 font-medium">API Reference</span>
          </div>
          <div className="flex items-center gap-2 bg-black/5 rounded-lg p-1">
            {(Object.keys(LANG_LABELS) as Lang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeLang === lang
                    ? "bg-white text-black shadow-sm"
                    : "text-black/40 hover:text-black/70"
                }`}
              >
                {LANG_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-[220px_1fr] gap-12">
        {/* Sidebar */}
        <div className="sticky top-24 h-fit">
          <p className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-4">Endpoints</p>
          <nav className="flex flex-col gap-1">
            {ENDPOINTS.map((ep) => (
              <a
                key={ep.id}
                href={`#${ep.id}`}
                onClick={() => setActiveSection(ep.id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeSection === ep.id
                    ? "bg-black/8 text-black font-medium"
                    : "text-black/40 hover:text-black/70 hover:bg-black/4"
                }`}
              >
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                {ep.path}
              </a>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-black/8">
            <p className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-4">Authentication</p>
            <p className="text-xs text-black/50 leading-relaxed">
              All requests require an{" "}
              <code className="bg-black/6 px-1.5 py-0.5 rounded text-black/70">x-api-key</code>{" "}
              header. Generate keys from the API Keys page.
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-16 min-w-0">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">API Reference</h1>
            <p className="text-black/50 text-lg leading-relaxed max-w-xl">
              Vault lets you mask and unmask sensitive data in any string or JSON object. Tokens are stored encrypted and tied to your account.
            </p>
            <div className="mt-6 flex items-center gap-3 bg-white border border-black/8 rounded-xl px-5 py-3 w-fit">
              <span className="text-xs font-semibold text-black/30 uppercase tracking-wider">Base URL</span>
              <code className="text-sm text-black/70">https://ycsummer.vercel.app/</code>
              <button
                onClick={() => copy("https://ycsummer.vercel.app/", "baseurl")}
                className="text-xs text-black/30 hover:text-black/60 transition-all"
              >
                {copied === "baseurl" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {ENDPOINTS.map((ep: Endpoint) => (
            <div key={ep.id} id={ep.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold px-2 py-1 rounded-md border ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-lg font-semibold text-black/80">{ep.path}</code>
              </div>
              <p className="text-black/50 mb-8 leading-relaxed">{ep.description}</p>

              <div className="grid grid-cols-2 gap-6 min-w-0">
                {/* Left — params */}
                <div className="flex flex-col gap-6 min-w-0">
                  {/* Headers */}
                  <div>
                    <p className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-3">Headers</p>
                    <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                      {ep.headers.map((h, i) => (
                        <div key={h.name} className={`px-5 py-4 ${i !== ep.headers.length - 1 ? "border-b border-black/6" : ""}`}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <code className="text-sm font-semibold text-black/80">{h.name}</code>
                            <span className="text-[10px] text-black/30 bg-black/5 px-1.5 py-0.5 rounded">{h.type}</span>
                            {h.required && <span className="text-[10px] text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">required</span>}
                          </div>
                          <p className="text-xs text-black/40">{h.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <p className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-3">Body</p>
                    <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                      {ep.body.map((b, i) => (
                        <div key={b.name} className={`px-5 py-4 ${i !== ep.body.length - 1 ? "border-b border-black/6" : ""}`}>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <code className="text-sm font-semibold text-black/80">{b.name}</code>
                            <span className="text-[10px] text-black/30 bg-black/5 px-1.5 py-0.5 rounded">{b.type}</span>
                            {b.required && <span className="text-[10px] text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">required</span>}
                          </div>
                          <p className="text-xs text-black/40">{b.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Response */}
                  <div>
                    <p className="text-xs font-semibold text-black/30 uppercase tracking-widest mb-3">Response</p>
                    <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-black/6">
                        <span className="text-xs text-black/30 font-medium">200 OK</span>
                        <button onClick={() => copy(ep.response, `res-${ep.id}`)} className="text-xs text-black/30 hover:text-black/60 transition-all">
                          {copied === `res-${ep.id}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <pre className="px-5 py-4 text-xs text-black/60 overflow-x-auto leading-relaxed">{ep.response}</pre>
                    </div>
                  </div>
                </div>

                {/* Right — syntax-highlighted terminal */}
                <div className="sticky top-24 h-fit min-w-0">
                  <div className="bg-[#0d1117] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    {/* Title bar */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-[#161b22]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-white/25 font-medium tracking-wide">{LANG_LABELS[activeLang]}</span>
                        <button
                          onClick={() => copy(ep[activeLang], `code-${ep.id}`)}
                          className="text-[11px] text-white/30 hover:text-white/70 transition-all"
                        >
                          {copied === `code-${ep.id}` ? "✓ Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Color legend dots */}
                    <div className="flex items-center gap-3 px-5 pt-3 pb-1">
                      {activeLang === "curl" && (
                        <>
                          <span className="text-[10px]" style={{ color: C.builtin }}>command</span>
                          <span className="text-[10px]" style={{ color: C.keyword }}>method</span>
                          <span className="text-[10px]" style={{ color: C.string }}>url</span>
                          <span className="text-[10px]" style={{ color: C.param }}>flag</span>
                          <span className="text-[10px]" style={{ color: C.strVal }}>value</span>
                        </>
                      )}
                      {activeLang === "js" && (
                        <>
                          <span className="text-[10px]" style={{ color: C.keyword }}>keyword</span>
                          <span className="text-[10px]" style={{ color: C.builtin }}>builtin</span>
                          <span className="text-[10px]" style={{ color: C.strVal }}>string</span>
                          <span className="text-[10px]" style={{ color: C.param }}>key</span>
                          <span className="text-[10px]" style={{ color: C.number }}>number</span>
                        </>
                      )}
                      {activeLang === "python" && (
                        <>
                          <span className="text-[10px]" style={{ color: C.keyword }}>keyword</span>
                          <span className="text-[10px]" style={{ color: C.builtin }}>builtin</span>
                          <span className="text-[10px]" style={{ color: C.strVal }}>string</span>
                          <span className="text-[10px]" style={{ color: C.param }}>param</span>
                          <span className="text-[10px]" style={{ color: C.number }}>number</span>
                        </>
                      )}
                    </div>

                    {/* Code */}
                    <div className="overflow-x-auto">
                      <pre className="px-5 py-4 text-xs leading-relaxed whitespace-pre font-mono">
                        <HighlightedCode code={ep[activeLang]} lang={activeLang} />
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 border-b border-black/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}