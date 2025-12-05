/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		// Permitir hosts externos usados por Cloudflare R2 (ej: pub-<id>.r2.dev)
		// También aceptamos cualquier subdominio de r2.dev usando remotePatterns.
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.r2.dev',
			},
			{
				protocol: 'https',
				hostname: '**.cloudflareusercontent.com',
			},
		],
	},
};

export default nextConfig;
