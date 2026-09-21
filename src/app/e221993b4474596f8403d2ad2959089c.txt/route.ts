export const dynamic = 'force-static';

export async function GET() {
  return new Response('e221993b4474596f8403d2ad2959089c', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
