export default function Sitemap() {
  return null
}

export async function getServerSideProps({ res }) {
  const baseUrl = 'https://lumivex-store.vercel.app'

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/products</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>
      <url>
        <loc>${baseUrl}/auth</loc>
        <changefreq>monthly</changefreq>
        <priority>0.5</priority>
      </url>
    </urlset>`

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return { props: {} }
}
