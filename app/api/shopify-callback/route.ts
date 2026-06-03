import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID     = process.env.SHOPIFY_CLIENT_ID     ?? '1f0d3b23f78ea6ddd4ed8d5291aa68bb';
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET ?? '';
const SHOP          = 'yd7u79-bt.myshopify.com';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new NextResponse(`<html><body style="background:#0a0a0a;color:red;font-family:sans-serif;padding:40px"><h2>Error: ${error}</h2></body></html>`, {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  if (!code) {
    return new NextResponse('No code received', { status: 400 });
  }

  try {
    // Exchange code for access token
    const res = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });

    const rawText = await res.text();
    let data: { access_token?: string } = {};
    try { data = JSON.parse(rawText); } catch {
      return new NextResponse(`<html><body style="background:#0a0a0a;color:white;font-family:sans-serif;padding:40px"><h2 style="color:#ff6b1a">Error del servidor Shopify:</h2><pre>${rawText}</pre><p>CLIENT_SECRET presente: ${CLIENT_SECRET ? 'Sí' : 'No (env var vacía)'}</p></body></html>`, { headers: { 'Content-Type': 'text/html' } });
    }
    const token = data.access_token;

    if (!token) {
      return new NextResponse(`Error: ${JSON.stringify(data)}`, { status: 500 });
    }

    // Show token on screen so user can copy it
    const html = `
<!DOCTYPE html>
<html>
<head><title>Token Obtenido — Nova Shop CR</title></head>
<body style="background:#0a0a0a;color:white;font-family:sans-serif;text-align:center;padding:60px;max-width:700px;margin:0 auto">
  <div style="font-size:60px">🎉</div>
  <h1 style="color:#ff6b1a;margin:20px 0">¡Token de Shopify obtenido!</h1>
  <p style="color:#9ca3af;margin-bottom:30px">Copiá este token y mandáselo a Claude:</p>
  <div style="background:#1a1a1a;border:2px solid #ff6b1a;border-radius:12px;padding:20px;margin:20px 0">
    <code style="color:#4ade80;font-size:14px;word-break:break-all;display:block">${token}</code>
  </div>
  <button onclick="navigator.clipboard.writeText('${token}').then(()=>this.textContent='✅ Copiado!')"
    style="background:#ff6b1a;color:white;border:none;padding:14px 32px;border-radius:8px;font-size:16px;cursor:pointer;margin-top:10px">
    📋 Copiar token
  </button>
  <p style="color:#6b7280;margin-top:30px;font-size:13px">Podés cerrar esta ventana luego de copiar el token.</p>
</body>
</html>`;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Error: ${message}`, { status: 500 });
  }
}
