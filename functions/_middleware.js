// Cloudflare Pages previews keep X-Robots-Tag: noindex in website/_headers.
// The same HTML is also the production document, whose meta robots stays
// index,follow. On *.pages.dev, rewrite that meta so header and meta agree.
export async function onRequest(context) {
  const response = await context.next();
  const host = new URL(context.request.url).hostname;
  if (!host.endsWith(".pages.dev")) return response;
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html") || !response.body) return response;
  const html = await response.text();
  const rewritten = html.replace(/<meta\b[^>]*\b(?:name|content)=["'][^"']*["'][^>]*>/gi, (tag) => {
    if (!/\bname=["']robots["']/i.test(tag)) return tag;
    if (/\bnoindex\b/i.test(tag)) return tag;
    if (/\bcontent=["'][^"']*["']/i.test(tag)) {
      return tag.replace(/\bcontent=["'][^"']*["']/i, 'content="noindex"');
    }
    return tag;
  });
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  if (!headers.has("x-robots-tag")) headers.set("X-Robots-Tag", "noindex");
  return new Response(rewritten, { status: response.status, statusText: response.statusText, headers });
}
