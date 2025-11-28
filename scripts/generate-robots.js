const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const robotsPath = path.join(distDir, 'robots.txt');
const sitemapUrl = 'https://futuretechjournal50.netlify.app/sitemap.xml';

const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /ai-tools/

Sitemap: ${sitemapUrl}
`;

fs.writeFileSync(robotsPath, content);

console.log(`Robots.txt generated at ${robotsPath}`);
