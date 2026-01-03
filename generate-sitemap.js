const fs = require('fs');
const pages = [
  '/',
  '/profile.html',
  '/portfolio.html',
  '/templates.html',
  '/templates/template1/index.html',
  '/templates/template2/index.html',
  '/templates/template3/index.html'
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages.map(page => `
  <url>
    <loc>https://dibungo.netlify.app${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync('sitemap.xml', xml);
console.log('Sitemap generated!');
