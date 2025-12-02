const fs = require('fs');
const path = require('path');

const domain = 'https://futuretechjournal50.netlify.app';
const distDir = path.join(__dirname, '../dist');
const publicDir = path.join(__dirname, '../public');

const categories = ['Technology', 'AI', 'Business', 'Global', 'Product', 'Entertainment', 'Science', 'India', 'US'];

const staticRoutes = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/disclaimer', changefreq: 'yearly', priority: '0.3' },
  { path: '/foryou', changefreq: 'daily', priority: '0.7' },
  { path: '/search', changefreq: 'daily', priority: '0.7' },
  { path: '/sitemap', changefreq: 'weekly', priority: '0.4' }
];

const today = new Date().toISOString().split('T')[0];

function generateSitemap() {
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  staticRoutes.forEach(route => {
    sitemapContent += `
  <url>
    <loc>${domain}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  });

  categories.forEach(cat => {
    sitemapContent += `
  <url>
    <loc>${domain}/category/${cat.toLowerCase()}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemapContent += `
</urlset>`;

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapContent);
  console.log(`Sitemap generated at ${path.join(distDir, 'sitemap.xml')}`);
  
  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
    console.log(`Sitemap also copied to ${path.join(publicDir, 'sitemap.xml')}`);
  }
}

generateSitemap();
