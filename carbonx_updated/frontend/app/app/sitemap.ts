import { MetadataRoute } from 'next'
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const pages = ['','marketplace','pricing','about','contact','blog','feedback','calculator','terms','privacy','auth']
  return pages.map(p => ({ url: p ? `${base}/${p}` : base, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: p === '' ? 1.0 : 0.8 }))
}
