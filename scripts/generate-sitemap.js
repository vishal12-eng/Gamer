
const fs = require('fs');
const path = require('path');

// Mock data for build time - in a real app this would fetch from DB/API
const categories = ['Technology', 'AI', 'Business', 'Global', 'Product', 'Entertainment', 'Science', 'India', 'US'];
// Basic list of static routes
const staticRoutes = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/foryou',
  '/bookmarks',
  '/search'
];

// For the purpose of this build script, we will mock some article slugs.
// In a production environment connected to a CMS, you would fetch all article slugs here.
// Since we use client-side RSS fetching, we can't know dynamic URLs at build time,
// but we will add the "mock" articles as placeholders for demonstration.
const mockArticleSlugs = [
  'the-quantum-leap-in-ai-what-it-means-for-tomorrow',
  'next-gen-gadgets-unveiled-at-ces-2024',
  'navigating-the-new-digital-economy',
  'global-tech-summit-highlights-collaboration',
  'the-rise-of-generative-ai-in-entertainment',
  'the-future-of-personalized-medicine',
  'breakthrough-in-fusion-energy',
  'india-digital-payment-revolution',
  'us-tech-giants-face-new-antitrust-scrutiny'
];

const domain = 'https://futuretechjournal50.netlify.app';
const distDir = path.join(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const sitemapPath = path.join(distDir, 'sitemap.xml');

let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

// Add Static Routes
staticRoutes.forEach(route => {
  sitemapContent += `
  <url>
    <loc>${domain}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
});

// Add Category Routes
categories.forEach(cat => {
  sitemapContent += `
  <url>
    <loc>${domain}/category/${cat.toLowerCase()}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
});

// Add Article Routes
mockArticleSlugs.forEach(slug => {
  sitemapContent += `
  <url>
    <loc>${domain}/article/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
});

sitemapContent += `
</urlset>`;

fs.writeFileSync(sitemapPath, sitemapContent);

console.log(`Sitemap generated at ${sitemapPath}`);
