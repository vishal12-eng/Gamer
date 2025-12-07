
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SparklesIcon from '../components/icons/SparklesIcon';
import TechnologyIcon from '../components/icons/TechnologyIcon';
import GadgetsIcon from '../components/icons/GadgetsIcon';
import ChartIcon from '../components/icons/ChartIcon';
import ActivityIcon from '../components/icons/ActivityIcon';
import CloseIcon from '../components/icons/CloseIcon';
import ClipboardIcon from '../components/icons/ClipboardIcon';

const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [systemStatus, setSystemStatus] = useState<{ api: string, db: string, latency: number }>({ api: 'Checking...', db: 'Checking...', latency: 0 });
  const [stats, setStats] = useState<any[]>([
    { label: 'Articles Today', value: 'Loading...', trend: '--', color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { label: 'AI Credits Used', value: 'Loading...', trend: '--', color: 'text-purple-400', border: 'border-purple-500/30' },
    { label: 'Total Reads', value: 'Loading...', trend: '--', color: 'text-green-400', border: 'border-green-500/30' },
    { label: 'Pending Reviews', value: 'Loading...', trend: '--', color: 'text-yellow-400', border: 'border-yellow-500/30' },
  ]);
  const [chartData, setChartData] = useState<number[]>([40, 65, 45, 80, 55, 90, 75]);

  const [logs, setLogs] = useState<any[]>([
    { type: 'article_gen', label: 'Article Gen', color: 'green', timeAgo: '2m', details: '' },
    { type: 'seo_update', label: 'SEO Update', color: 'blue', timeAgo: '1h', details: '' },
    { type: 'ai_gen', label: 'AI Gen', color: 'purple', timeAgo: '3h', details: '' },
    { type: 'login', label: 'Login (Admin)', color: 'yellow', timeAgo: '5h', details: '' },
  ]);

  // Fetch live metrics from backend
  useEffect(() => {
    const getAuthToken = () => localStorage.getItem('authToken') || '';
    
    const fetchMetrics = async () => {
      try {
        const token = getAuthToken();
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [statsRes, chartRes, logsRes] = await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/admin/ai-usage', { headers }),
          fetch('/api/admin/logs', { headers })
        ]);
        
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.stats) setStats(statsData.stats);
          if (statsData.systemStatus) setSystemStatus(statsData.systemStatus);
        }
        
        if (chartRes.ok) {
          const chartDataRes = await chartRes.json();
          if (chartDataRes.chartData) setChartData(chartDataRes.chartData);
        }
        
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          if (logsData.logs && logsData.logs.length > 0) setLogs(logsData.logs);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        setStats([
          { label: 'Articles Today', value: '--', trend: 'N/A', color: 'text-cyan-400', border: 'border-cyan-500/30' },
          { label: 'AI Credits Used', value: '--', trend: 'N/A', color: 'text-purple-400', border: 'border-purple-500/30' },
          { label: 'Total Reads', value: '--', trend: 'N/A', color: 'text-green-400', border: 'border-green-500/30' },
          { label: 'Pending Reviews', value: '--', trend: 'N/A', color: 'text-yellow-400', border: 'border-yellow-500/30' },
        ]);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const tools = [
    { name: 'Manage Articles', path: '/admin/articles', icon: <ClipboardIcon className="w-6 h-6" />, desc: 'Edit, update, and SEO check.' },
    { name: 'AI Rewrite & SEO', path: '/ai-tools?tab=rewrite', icon: <SparklesIcon className="w-6 h-6" />, desc: 'Pro-level rewriting engine.' },
    { name: 'Blog Generator', path: '/ai-tools?tab=blog', icon: <TechnologyIcon className="w-6 h-6" />, desc: 'Draft posts from topics.' },
    { name: 'Image Generator', path: '/ai-tools?tab=generate', icon: <GadgetsIcon className="w-6 h-6" />, desc: 'Create visuals via Imagen.' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-1 flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse mr-3"></div>
            Mission Control
          </h1>
          <p className="text-gray-400">Logged in as <span className="text-cyan-400 font-semibold">{user?.name}</span> &middot; {user?.email}</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 uppercase font-bold">System Latency</p>
                <p className={`font-mono font-bold ${systemStatus.latency < 80 ? 'text-green-400' : 'text-yellow-400'}`}>{systemStatus.latency}ms</p>
            </div>
            <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
            <button 
            onClick={logout}
            className="px-6 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-full transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center font-medium"
            >
            <CloseIcon className="w-4 h-4 mr-2" />
            Secure Logout
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (Stats & Chart) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                <div key={idx} className={`bg-gray-900/40 p-5 rounded-xl border ${stat.border} hover:bg-gray-800/60 transition-all hover:-translate-y-1 relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full transition-opacity opacity-0 group-hover:opacity-100"></div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                    <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <span className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-300">{stat.trend}</span>
                    </p>
                </div>
                ))}
            </div>

            {/* Analytics Chart Area */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <ChartIcon className="w-6 h-6 mr-2 text-purple-400" />
                        AI Credit Usage
                    </h2>
                    <select className="bg-gray-800 text-gray-300 text-xs rounded-md border border-gray-700 px-2 py-1 outline-none">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                    </select>
                </div>
                
                {/* CSS-only mock chart */}
                <div className="h-48 flex items-end justify-between space-x-2 px-2">
                    {chartData.map((val, i) => (
                        <div key={i} className="w-full bg-gray-800/50 rounded-t-md relative group">
                            <div 
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-900/50 to-purple-600/50 rounded-t-md transition-all duration-1000 ease-out group-hover:to-cyan-400/80"
                                style={{ height: `${val}%` }}
                            ></div>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {val * 100}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 uppercase font-mono">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-cyan-400" />
                    Quick Launch
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tools.map((tool, idx) => (
                    <Link 
                        key={idx} 
                        to={tool.path}
                        className="group bg-gray-900/50 hover:bg-gradient-to-br hover:from-gray-800 hover:to-gray-900 p-5 rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all duration-300 flex items-start"
                    >
                        <div className="w-10 h-10 bg-gray-800 group-hover:bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 transition-colors mr-4 shrink-0">
                        {tool.icon}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{tool.name}</h3>
                            <p className="text-xs text-gray-500 mt-1 group-hover:text-gray-400">{tool.desc}</p>
                        </div>
                    </Link>
                    ))}
                </div>
            </div>
        </div>

        {/* Side Column (System Health & Activity) */}
        <div className="space-y-8">
            
            {/* System Health */}
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/10">
                <h2 className="text-lg font-bold text-white mb-4">System Status</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-300">
                            <div className={`w-2 h-2 rounded-full mr-3 ${systemStatus.api === 'Operational' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            Gemini API
                        </div>
                        <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">{systemStatus.api}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-300">
                            <div className="w-2 h-2 rounded-full mr-3 bg-green-500"></div>
                            RSS Pipeline
                        </div>
                        <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-300">
                            <div className="w-2 h-2 rounded-full mr-3 bg-green-500"></div>
                            Database
                        </div>
                        <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-1 rounded">{systemStatus.db}</span>
                    </div>
                </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-gray-900/50 rounded-2xl border border-white/10 overflow-hidden flex-grow">
                <div className="p-4 border-b border-white/10 bg-gray-800/30">
                    <h2 className="text-lg font-bold text-white flex items-center">
                        <ActivityIcon className="w-5 h-5 mr-2 text-cyan-400" />
                        Live Log
                    </h2>
                </div>
                <div className="p-2">
                    <table className="w-full text-left text-sm text-gray-400">
                        <tbody className="divide-y divide-gray-800">
                            {logs.slice(0, 4).map((log, idx) => {
                              const colorClasses: Record<string, string> = {
                                green: 'bg-green-500',
                                blue: 'bg-blue-500',
                                purple: 'bg-purple-500',
                                yellow: 'bg-yellow-500',
                                cyan: 'bg-cyan-500',
                                pink: 'bg-pink-500',
                                gray: 'bg-gray-500'
                              };
                              return (
                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center">
                                        <div className={`w-1.5 h-1.5 ${colorClasses[log.color] || 'bg-gray-500'} rounded-full mr-2`}></div>
                                        <span className="text-gray-200 text-xs font-mono">{log.label}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right text-xs text-gray-500">{log.timeAgo}</td>
                              </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 text-center border-t border-white/5">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">View All Logs</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
