import { generateLlmsDocumentation } from '@/lib/llms';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const content = generateLlmsDocumentation();

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
