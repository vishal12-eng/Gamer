const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = 'dist';

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// 1. Build the JavaScript/TypeScript code
esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    minify: true,
    sourcemap: true,
    target: 'es2020',
    outfile: path.join(distDir, 'bundle.js'),
    define: {
        // Replace process.env.API_KEY with the actual environment variable
        // Netlify will provide this during the build.
        'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    },
    loader: {
        '.tsx': 'tsx',
        '.ts': 'ts'
    }
}).then(() => {
    // 2. Read the original index.html
    let html = fs.readFileSync('index.html', 'utf-8');

    // 3. Modify the HTML for production
    // Remove the importmap
    html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
    // Replace the module script with the bundled script
    html = html.replace(
        '<script type="module" src="/index.tsx"></script>',
        '<script defer src="/bundle.js"></script>'
    );

    // 4. Write the new index.html to the dist directory
    fs.writeFileSync(path.join(distDir, 'index.html'), html);

    console.log('App build successful!');

    // 5. Run SEO Generation Scripts
    console.log('Generating SEO assets (sitemap, robots.txt)...');
    try {
        execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
        execSync('node scripts/generate-robots.js', { stdio: 'inherit' });
    } catch (err) {
        console.error('Error generating SEO assets:', err);
    }

}).catch((e) => {
    console.error('Build failed:', e);
    process.exit(1);
});
