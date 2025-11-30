import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface DailyStats {
  impressions: number;
  clicks: number;
  closes: number;
  refreshes: number;
  viewable: number;
}

interface PlacementStats {
  impressions: number;
  clicks: number;
  viewable: number;
}

interface AdsStats {
  summary: {
    totalImpressions: number;
    totalClicks: number;
    ctr: string;
    estimatedRevenue: string;
    uniqueSessions: number;
  };
  dailyStats: Record<string, DailyStats>;
  placements: Record<string, PlacementStats>;
  variants: Record<string, { impressions: number; clicks: number }>;
  alerts: {
    significantDrop: boolean;
    dropPercentage: string;
  };
  config: {
    enabled: boolean;
    verificationMode: boolean;
    refreshEnabled: boolean;
    debugMode: boolean;
  };
  lastUpdated: number;
}

interface AdEvent {
  type: string;
  timestamp: number;
  placement: string;
  sessionId: string;
  size?: string;
  variant?: string;
}

const AdminAdsPage: React.FC = () => {
  const [stats, setStats] = useState<AdsStats | null>(null);
  const [events, setEvents] = useState<AdEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'config'>('dashboard');
  const [config, setConfig] = useState({
    enabled: true,
    verificationMode: false,
    refreshEnabled: true,
    debugMode: false,
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/ads/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setConfig(data.config);
      setError(null);
    } catch (e) {
      setError('Failed to load analytics data');
      console.error(e);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/ads/events?limit=100');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events);
    } catch (e) {
      console.error('Failed to fetch events:', e);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchStats(), fetchEvents()]).finally(() => setLoading(false));
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, fetchEvents]);

  const updateConfig = async (updates: Partial<typeof config>) => {
    try {
      const response = await fetch('/api/ads/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update config');
      const data = await response.json();
      setConfig(data.config);
    } catch (e) {
      console.error('Failed to update config:', e);
    }
  };

  const updateBaseline = async () => {
    await updateConfig({ updateBaseline: true } as any);
    await fetchStats();
  };

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  if (loading) {
    return (
      <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className={`h-8 w-48 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
            <div className={`h-64 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin" className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:underline`}>
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold mt-2">Ad Analytics Dashboard</h1>
          </div>
          <button
            onClick={() => { fetchStats(); fetchEvents(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100 border'
            }`}
          >
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
            {error}
          </div>
        )}

        {stats?.alerts.significantDrop && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg text-yellow-600">
            Warning: Impressions dropped {stats.alerts.dropPercentage}% compared to baseline
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {(['dashboard', 'events', 'config'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-white hover:bg-gray-100 border'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Impressions', value: stats.summary.totalImpressions.toLocaleString() },
                { label: 'Total Clicks', value: stats.summary.totalClicks.toLocaleString() },
                { label: 'CTR', value: stats.summary.ctr },
                { label: 'Est. Revenue', value: stats.summary.estimatedRevenue },
                { label: 'Unique Sessions', value: stats.summary.uniqueSessions.toLocaleString() },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}
                >
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold mt-1">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
              <h2 className="text-lg font-semibold mb-4">Daily Performance (Last 7 Days)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      <th className="text-left py-2">Date</th>
                      <th className="text-right py-2">Impressions</th>
                      <th className="text-right py-2">Clicks</th>
                      <th className="text-right py-2">Viewable</th>
                      <th className="text-right py-2">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.dailyStats)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, day]) => (
                        <tr key={date} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="py-2">{date}</td>
                          <td className="text-right">{day.impressions}</td>
                          <td className="text-right">{day.clicks}</td>
                          <td className="text-right">{day.viewable}</td>
                          <td className="text-right">
                            {day.impressions > 0 ? ((day.clicks / day.impressions) * 100).toFixed(2) : 0}%
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
                <h2 className="text-lg font-semibold mb-4">Placement Performance</h2>
                <div className="space-y-3">
                  {Object.entries(stats.placements).map(([placement, data]) => (
                    <div
                      key={placement}
                      className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="font-medium capitalize">{placement.replace(/-/g, ' ')}</div>
                      <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {data.impressions} imp / {data.clicks} clicks / {data.viewable} viewable
                      </div>
                    </div>
                  ))}
                  {Object.keys(stats.placements).length === 0 && (
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No placement data yet
                    </div>
                  )}
                </div>
              </div>

              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
                <h2 className="text-lg font-semibold mb-4">A/B Test Variants</h2>
                <div className="space-y-3">
                  {Object.entries(stats.variants).map(([key, data]) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                    >
                      <div className="font-medium">{key}</div>
                      <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {data.impressions} imp / {data.clicks} clicks
                        {data.impressions > 0 && ` (${((data.clicks / data.impressions) * 100).toFixed(2)}% CTR)`}
                      </div>
                    </div>
                  ))}
                  {Object.keys(stats.variants).length === 0 && (
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No variant data yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
            <h2 className="text-lg font-semibold mb-4">Recent Events (Last 100)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Placement</th>
                    <th className="text-left py-2">Size</th>
                    <th className="text-left py-2">Variant</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, i) => (
                    <tr key={i} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className="py-2">{new Date(event.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          event.type === 'ad_click' ? 'bg-green-500/20 text-green-400' :
                          event.type === 'ad_impression' ? 'bg-blue-500/20 text-blue-400' :
                          event.type === 'ad_viewable' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {event.type.replace('ad_', '')}
                        </span>
                      </td>
                      <td className="py-2">{event.placement}</td>
                      <td className="py-2">{event.size || '-'}</td>
                      <td className="py-2">{event.variant || '-'}</td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={5} className={`py-8 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No events recorded yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
            <h2 className="text-lg font-semibold mb-6">Ad Configuration</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Ads Enabled (Global Kill Switch)</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Turn off all ads across the site
                  </div>
                </div>
                <button
                  onClick={() => updateConfig({ enabled: !config.enabled })}
                  className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                    config.enabled ? 'bg-green-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Verification Mode</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Use verification iframe for debugging
                  </div>
                </div>
                <button
                  onClick={() => updateConfig({ verificationMode: !config.verificationMode })}
                  className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                    config.verificationMode ? 'bg-blue-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-Refresh Enabled</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Allow ads to refresh after user interaction
                  </div>
                </div>
                <button
                  onClick={() => updateConfig({ refreshEnabled: !config.refreshEnabled })}
                  className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                    config.refreshEnabled ? 'bg-blue-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Debug Mode</div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Log ad events to console
                  </div>
                </div>
                <button
                  onClick={() => updateConfig({ debugMode: !config.debugMode })}
                  className={`w-14 h-7 rounded-full flex items-center px-1 transition-colors ${
                    config.debugMode ? 'bg-blue-500 justify-end' : 'bg-gray-600 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={updateBaseline}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  Update Baseline (Set Current as Normal)
                </button>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  This sets today's stats as the baseline for drop alerts
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`mt-6 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          Last updated: {stats ? new Date(stats.lastUpdated).toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default AdminAdsPage;
