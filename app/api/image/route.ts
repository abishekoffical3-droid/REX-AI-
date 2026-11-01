import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Add OPENAI_API_KEY in Vercel Environment Variables first.' }, { status: 503 });
    const { prompt } = await req.json();
    if (typeof prompt !== 'string' || prompt.trim().length < 3) return NextResponse.json({ error: 'Describe the image you want.' }, { status: 400 });
    const form = new FormData(); form.append('model', 'gpt-image-1'); form.append('prompt', prompt.slice(0, 3500)); form.append('size', '1024x1024'); form.append('quality', 'medium');
    const r = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form, signal: AbortSignal.timeout(120000) });
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ error: data?.error?.message || 'Image generation failed.' }, { status: r.status });
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: 'The image provider returned no image.' }, { status: 502 });
    return NextResponse.json({ image: `data:image/png;base64,${b64}` });
  } catch { return NextResponse.json({ error: 'Image request failed. Please try again.' }, { status: 500 }); }
}
