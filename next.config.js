/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'storage.googleapis.com',
            port: '',
            pathname: `/${process.env.NEXT_PUBLIC_GCP_BUCKET}/**`,
        },
        {
          protocol: 'https',
          hostname: 'avatar.vercel.sh',
      },
    ],
  },
  optimizeFonts:true,
}

module.exports = nextConfig
