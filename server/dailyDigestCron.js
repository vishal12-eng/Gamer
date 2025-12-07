const cron = require('node-cron');

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-token';

async function fetchLatestArticles() {
  try {
    const response = await fetch(`${API_BASE}/api/articles?status=published&limit=5`);
    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('[Daily Digest] Failed to fetch articles:', error);
    return [];
  }
}

async function generateNewsletter(articles) {
  try {
    const response = await fetch(`${API_BASE}/api/newsletter/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        articles: articles.map(a => ({
          title: a.title,
          summary: a.summary || a.content?.substring(0, 200)
        }))
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate newsletter: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Daily Digest] Failed to generate newsletter:', error);
    return null;
  }
}

async function sendNewsletter(subject, content) {
  try {
    const response = await fetch(`${API_BASE}/api/newsletter/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ subject, content }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to send: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Daily Digest] Failed to send newsletter:', error);
    return null;
  }
}

async function runDailyDigest() {
  console.log('[Daily Digest] Starting daily digest job at', new Date().toISOString());
  
  const articles = await fetchLatestArticles();
  if (articles.length === 0) {
    console.log('[Daily Digest] No articles to send');
    return;
  }
  
  console.log(`[Daily Digest] Found ${articles.length} articles for digest`);
  
  const newsletter = await generateNewsletter(articles);
  if (!newsletter || !newsletter.subject || !newsletter.content) {
    console.log('[Daily Digest] Failed to generate newsletter content');
    return;
  }
  
  console.log(`[Daily Digest] Generated newsletter: "${newsletter.subject}"`);
  
  const result = await sendNewsletter(newsletter.subject, newsletter.content);
  if (result && result.success) {
    console.log('[Daily Digest] Newsletter sent successfully!');
  } else {
    console.log('[Daily Digest] Failed to send newsletter');
  }
}

function startScheduler() {
  console.log('[Daily Digest] Scheduler initialized');
  console.log('[Daily Digest] Daily digest will run at 8:00 AM every day');
  
  cron.schedule('0 8 * * *', () => {
    runDailyDigest();
  }, {
    timezone: 'Asia/Kolkata'
  });
}

function stopScheduler() {
  console.log('[Daily Digest] Scheduler stopped');
}

if (require.main === module) {
  if (process.argv.includes('--run-now')) {
    runDailyDigest().then(() => process.exit(0));
  } else {
    startScheduler();
  }
}

module.exports = { startScheduler, stopScheduler, runDailyDigest };
