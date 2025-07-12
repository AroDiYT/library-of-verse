'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface CurrentUser {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  role: string;
  created_at: string;
  last_login: string;
}

interface AnalyticsData {
  dailyLogins: {
    date: string;
    count: number;
  }[];
  chapterViews: {
    chapter_id: number;
    chapter_title: string;
    view_count: number;
  }[];
  userRegistrations: {
    date: string;
    count: number;
  }[];
  readingProgress: {
    user_id: number;
    username: string;
    chapters_read: number;
    total_chapters: number;
  }[];
  summary: {
    totalUsers: number;
    totalChapters: number;
    totalCharacters: number;
    totalViews: number;
    activeUsers: number;
    avgReadingTime: number;
  };
}

const AdminAnalyticsPage = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAnalytics();
    }
  }, [currentUser, dateRange]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
        if (data.user.role !== 'admin') {
          router.push('/admin');
          return;
        }
      } else {
        router.push('/admin');
        return;
      }
    } catch (error) {
      router.push('/admin');
      return;
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?days=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      setError('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-slate-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-slate-900 pt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-400 mb-4">Analytics</h1>
            <p className="text-red-400">{error || 'Failed to load analytics data'}</p>
          </div>
        </div>
      </div>
    );
  }

  const loginChartData = {
    labels: analytics.dailyLogins.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Logins',
        data: analytics.dailyLogins.map(d => d.count),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const registrationChartData = {
    labels: analytics.userRegistrations.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'New Registrations',
        data: analytics.userRegistrations.map(d => d.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const chapterViewsData = {
    labels: analytics.chapterViews.slice(0, 10).map(c => c.chapter_title),
    datasets: [
      {
        label: 'Chapter Views',
        data: analytics.chapterViews.slice(0, 10).map(c => c.view_count),
        backgroundColor: [
          '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
          '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
        ],
      },
    ],
  };

  const readingProgressData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [
          analytics.readingProgress.filter(r => r.chapters_read === r.total_chapters).length,
          analytics.readingProgress.filter(r => r.chapters_read > 0 && r.chapters_read < r.total_chapters).length,
          analytics.readingProgress.filter(r => r.chapters_read === 0).length,
        ],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
      y: {
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: '#334155',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#e2e8f0',
          padding: 20,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-900 pt-20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-400 mb-2">Analytics Dashboard</h1>
            <p className="text-slate-300">Track user engagement and content performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={() => router.push('/admin')}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{analytics.summary.totalUsers}</p>
                <p className="text-slate-400 text-sm">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{analytics.summary.activeUsers}</p>
                <p className="text-slate-400 text-sm">Active Users</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{analytics.summary.totalViews}</p>
                <p className="text-slate-400 text-sm">Total Views</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{Math.round(analytics.summary.avgReadingTime)} min</p>
                <p className="text-slate-400 text-sm">Avg Reading Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Logins Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-4">Daily Login Activity</h3>
            <div className="h-80">
              <Line data={loginChartData} options={chartOptions} />
            </div>
          </div>

          {/* User Registrations Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-4">New User Registrations</h3>
            <div className="h-80">
              <Bar data={registrationChartData} options={chartOptions} />
            </div>
          </div>

          {/* Most Popular Chapters */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-4">Most Popular Chapters</h3>
            <div className="h-80">
              <Doughnut data={chapterViewsData} options={doughnutOptions} />
            </div>
          </div>

          {/* Reading Progress */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-amber-400 mb-4">Reader Progress Distribution</h3>
            <div className="h-80">
              <Doughnut data={readingProgressData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-amber-400 mb-4">Top Readers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Chapters Read
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {analytics.readingProgress
                  .sort((a, b) => b.chapters_read - a.chapters_read)
                  .slice(0, 10)
                  .map((reader, index) => (
                    <tr key={reader.user_id} className="hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">{index + 1}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{reader.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {reader.chapters_read} / {reader.total_chapters}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-slate-700 rounded-full h-2 mr-3">
                            <div 
                              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full" 
                              style={{width: `${(reader.chapters_read / reader.total_chapters) * 100}%`}}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-300">
                            {Math.round((reader.chapters_read / reader.total_chapters) * 100)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
