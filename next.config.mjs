/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/cancellation',
        destination: '/refund',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*(ico|svg|png|webmanifest)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
