/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(?!.*application/json).*', // Don't redirect API calls
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

