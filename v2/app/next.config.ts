import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// Old Hugo slug -> new music slug.
const hugoPosts: Record<string, string> = {
  arkan: 'arkan',
  assimilation: 'assimilation',
  claustrophobic: 'claustrophobic',
  cyberwave: 'cyberware',
  decay: 'decay',
  dystopia: 'dystopia',
  enhanced_acid: 'enhanced-acid',
  grains: 'grains',
  nongrad: 'nongrad',
  peak: 'peak',
  places: 'places',
  polaris: 'polaris',
  precision: 'precision',
  princess_peas: 'princess-peas',
  quantum_dawn: 'quantum-dawn',
  singularity: 'singularity',
  tessellation: 'tessellation',
  voltage_forms: 'voltage-forms',
}

const nextConfig: NextConfig = {
  output: 'standalone',
  // Next matches sources with an optional trailing slash (trailingSlash is false).
  async redirects() {
    const permanent = true
    return [
      ...Object.entries(hugoPosts).map(([from, to]) => ({
        source: `/post/${from}`,
        destination: `/music/${to}`,
        permanent,
      })),
      ...['/post', '/post/index.xml'].map((source) => ({
        source,
        destination: '/music',
        permanent,
      })),
      ...['/archives', '/tags', '/categories'].map((base) => ({
        source: `${base}/:path*`,
        destination: '/music',
        permanent,
      })),
      { source: '/contact', destination: '/about', permanent },
      { source: '/index.xml', destination: '/', permanent },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
