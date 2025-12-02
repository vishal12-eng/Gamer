const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const publicDir = path.join(__dirname, '../public');
const sitemapUrl = 'https://futuretechjournal50.netlify.app/sitemap.xml';

const content = `# Robots.txt for FutureTechJournal
# https://futuretechjournal50.netlify.app

User-agent: *
Allow: /

# Disallow admin and internal tool pages
Disallow: /admin/
Disallow: /ai-tools/

# Allow all search engine crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# Sitemap location
Sitemap: ${sitemapUrl}
`;

function generateRobots() {
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  fs.writeFileSync(path.join(distDir, 'robots.txt'), content);
  console.log(`Robots.txt generated at ${path.join(distDir, 'robots.txt')}`);

  if (fs.existsSync(publicDir)) {
    fs.writeFileSync(path.join(publicDir, 'robots.txt'), content);
    console.log(`Robots.txt also copied to ${path.join(publicDir, 'robots.txt')}`);
  }
}

generateRobots();
