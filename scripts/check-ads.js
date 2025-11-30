#!/usr/bin/env node

/**
 * Ad Smoke Test Script
 * 
 * This script verifies that A-ADS ad integrations are properly loaded
 * on the production/staging site.
 * 
 * Usage:
 *   node scripts/check-ads.js [url]
 * 
 * Examples:
 *   node scripts/check-ads.js
 *   node scripts/check-ads.js https://your-site.com
 */

const https = require('https');
const http = require('http');

const AD_UNIT_ID = process.env.VITE_AADS_AD_UNIT_ID || '2419015';
const DEFAULT_URL = process.env.SITE_URL || 'http://localhost:5000';

const PAGES_TO_CHECK = [
  '/',
  '/category/technology',
];

const EXPECTED_AD_MARKERS = [
  `ad.a-ads.com/${AD_UNIT_ID}`,
  'data-aa=',
  'AAdsTopBanner',
  'StickyAAdsBanner',
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, { 
      headers: { 'User-Agent': 'AdSmokeTest/1.0' },
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function checkPage(baseUrl, path) {
  const url = `${baseUrl}${path}`;
  log(`\nChecking: ${url}`, 'blue');
  
  try {
    const { status, body } = await fetchPage(url);
    
    if (status !== 200) {
      log(`  ✗ HTTP ${status} - Page not accessible`, 'red');
      return { path, success: false, reason: `HTTP ${status}` };
    }
    
    log(`  ✓ HTTP 200 - Page loaded`, 'green');
    
    const foundMarkers = [];
    const missingMarkers = [];
    
    for (const marker of EXPECTED_AD_MARKERS) {
      if (body.includes(marker)) {
        foundMarkers.push(marker);
        log(`  ✓ Found: ${marker}`, 'green');
      } else {
        missingMarkers.push(marker);
        log(`  ✗ Missing: ${marker}`, 'yellow');
      }
    }
    
    // Check for ad iframe specifically
    const iframeRegex = new RegExp(`<iframe[^>]*ad\\.a-ads\\.com/${AD_UNIT_ID}`, 'i');
    const hasIframe = iframeRegex.test(body);
    
    if (hasIframe) {
      log(`  ✓ A-ADS iframe found with unit ID ${AD_UNIT_ID}`, 'green');
    } else {
      log(`  ⚠ A-ADS iframe not found in initial HTML (may load dynamically)`, 'yellow');
    }
    
    // Check for consent banner
    if (body.includes('ConsentBanner') || body.includes('ads_consent')) {
      log(`  ✓ Consent banner detected`, 'green');
    }
    
    // Check for analytics
    if (body.includes('/api/ads/event') || body.includes('AdAnalytics')) {
      log(`  ✓ Ad analytics detected`, 'green');
    }
    
    return {
      path,
      success: foundMarkers.length >= 2,
      foundMarkers,
      missingMarkers,
      hasIframe,
    };
    
  } catch (error) {
    log(`  ✗ Error: ${error.message}`, 'red');
    return { path, success: false, reason: error.message };
  }
}

async function checkApiEndpoints(baseUrl) {
  log('\n--- API Endpoints ---', 'blue');
  
  const endpoints = [
    { path: '/api/ads/stats', method: 'GET' },
    { path: '/api/ads/config', method: 'GET' },
  ];
  
  for (const { path, method } of endpoints) {
    try {
      const url = `${baseUrl}${path}`;
      const { status, body } = await fetchPage(url);
      
      if (status === 200) {
        try {
          JSON.parse(body);
          log(`  ✓ ${method} ${path} - OK (valid JSON)`, 'green');
        } catch {
          log(`  ⚠ ${method} ${path} - OK but invalid JSON`, 'yellow');
        }
      } else {
        log(`  ✗ ${method} ${path} - HTTP ${status}`, 'red');
      }
    } catch (error) {
      log(`  ✗ ${method} ${path} - ${error.message}`, 'red');
    }
  }
}

async function runSmokeTest() {
  const baseUrl = process.argv[2] || DEFAULT_URL;
  
  log('========================================', 'blue');
  log('       A-ADS Smoke Test', 'blue');
  log('========================================', 'blue');
  log(`Base URL: ${baseUrl}`, 'dim');
  log(`Ad Unit ID: ${AD_UNIT_ID}`, 'dim');
  log(`Time: ${new Date().toISOString()}`, 'dim');
  
  const results = [];
  
  log('\n--- Page Checks ---', 'blue');
  
  for (const path of PAGES_TO_CHECK) {
    const result = await checkPage(baseUrl, path);
    results.push(result);
  }
  
  await checkApiEndpoints(baseUrl);
  
  // Summary
  log('\n========================================', 'blue');
  log('       Summary', 'blue');
  log('========================================', 'blue');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`Pages checked: ${results.length}`, 'dim');
  log(`Passed: ${passed}`, passed > 0 ? 'green' : 'dim');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'dim');
  
  if (failed === 0) {
    log('\n✓ All checks passed!', 'green');
    process.exit(0);
  } else {
    log('\n✗ Some checks failed. Review the output above.', 'red');
    process.exit(1);
  }
}

// Run the test
runSmokeTest().catch((error) => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
