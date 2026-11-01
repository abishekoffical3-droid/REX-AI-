import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
const SYSTEM = `You are REX AI, an intelligent assistant created by developer KARAN BAHADUR BHUSAL D. Your identity is REX AI. Never claim to be ChatGPT, GPT, or another AI product. Be honest about your actual capabilities and limitations; do not pretend to have tools or access you do not have. Help with coding, debugging, learning, research, writing, planning, and creative work. Respond in the user's language, including Nepali and Romanized Nepali. For technical answers, give complete, practical steps and explain uncertainty. Do not expose secrets or request API keys. For web research, cite the sources returned by web search when available. Keep answers clear and thoughtful.`;
function cors(req: NextRequest, response: NextResponse) {
  const origin = req.headers.get('origin');
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(x => x.trim()).filter(Boolean);
  if (origin && (!allowed.length || allowed.includes(origin))) response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Vary', 'Origin');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
export async function OPTIONS(req: NextRequest) { return cors(req, new NextResponse(null, { status: 204 })); }
export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) return cors(req, NextResponse.json({ error: 'Server is not configured yet. Add OPENAI_API_KEY in Vercel Environment Variables.' }, { status: 503 }));
    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-24) : [];
    if (!messages.length) return cors(req, NextResponse.json({ error: 'Please enter a message.' }, { status: 400 }));
    const input = messages.map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 12000) }));
    const payload: any = { model: process.env.OPENAI_MODEL || 'gpt-4.1', instructions: SYSTEM, input, max_output_tokens: 2200 };
    if (body.webSearch === true) payload.tools = [{ type: 'web_search_preview' }];
    const upstream = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(90000) });
    const data = await upstream.json();
    if (!upstream.ok) return cors(req, NextResponse.json({ error: data?.error?.message || `AI provider returned ${upstream.status}` }, { status: upstream.status }));
    const text = (data.output || []).flatMap((item: any) => item.content || []).filter((c: any) => c.type === 'output_text').map((c: any) => c.text).join('\n\n');
    const sources = (data.output || []).filter((x: any) => x.type === 'web_search_call').flatMap((x: any) => x.action?.sources || []).map((s: any) => ({ title: s.title, url: s.url })).filter((s: any) => s.url).slice(0, 8);
    return cors(req, NextResponse.json({ text: text || 'I could not create a text response. Please try again.', sources }));
  } catch (e: any) { return NextResponse.json({ error: e?.name === 'TimeoutError' ? 'The request took too long. Try again.' : 'Unexpected server error. Please try again.' }, { status: 500 }); }
}
