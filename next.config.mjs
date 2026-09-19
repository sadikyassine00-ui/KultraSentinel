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
};

export default nextConfig;
