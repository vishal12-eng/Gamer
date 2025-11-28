import { Handler } from '@netlify/functions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Mock data for demonstration (in production, this would query your database)
const mockArticles = [
  { date: new Date().toISOString().split('T')[0], views: 245 },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], views: 312 },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], views: 198 },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], views: 456 },
  { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], views: 289 },
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], views: 534 },
  { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], views: 412 },
];

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'ok' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Articles today: Count articles created today
    const articlesToday = Math.floor(Math.random() * 8) + 4; // 4-11 articles
    
    // AI Credits Used: Track API calls (simulated as usage percentage)
    const totalCreditsPerDay = 10000;
    const creditsUsed = Math.floor(Math.random() * 8500) + 1500; // 1500-10000
    const creditPercentage = Math.round((creditsUsed / totalCreditsPerDay) * 100);
    
    // Total Reads: Sum of views today
    const totalReads = mockArticles.find(a => a.date === today)?.views || Math.floor(Math.random() * 1000) + 500;
    
    // Pending Reviews: Articles awaiting approval
    const pendingReviews = Math.floor(Math.random() * 6) + 1; // 1-6 pending
    
    // API Latency: Simulate real latency
    const latency = Math.floor(Math.random() * 80) + 20; // 20-100ms
    
    // Chart data: Last 7 days credit usage as percentage
    const chartData = mockArticles.map(article => {
      const usage = Math.floor(Math.random() * 90) + 10;
      return usage;
    });
    
    // System Status
    const isHealthy = latency < 100;
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
      body: JSON.stringify({
        stats: [
          { 
            label: 'Articles Today', 
            value: String(articlesToday), 
            trend: `+${Math.floor(Math.random() * 30)}%`,
            color: 'text-cyan-400', 
            border: 'border-cyan-500/30' 
          },
          { 
            label: 'AI Credits Used', 
            value: creditsUsed.toLocaleString(), 
            trend: `${creditPercentage}% cap`,
            color: 'text-purple-400', 
            border: 'border-purple-500/30' 
          },
          { 
            label: 'Total Reads', 
            value: totalReads.toLocaleString(), 
            trend: `+${Math.floor(Math.random() * 15)}%`,
            color: 'text-green-400', 
            border: 'border-green-500/30' 
          },
          { 
            label: 'Pending Reviews', 
            value: String(pendingReviews), 
            trend: pendingReviews > 3 ? 'Urgent' : 'On Track',
            color: 'text-yellow-400', 
            border: 'border-yellow-500/30' 
          },
        ],
        chartData,
        systemStatus: {
          api: isHealthy ? 'Operational' : 'Degraded',
          db: 'Connected',
          latency,
        },
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to fetch metrics' }),
    };
  }
};

export { handler };
