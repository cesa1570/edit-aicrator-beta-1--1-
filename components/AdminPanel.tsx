import React, { useEffect, useState } from 'react';
import {
    Users, DollarSign, Activity, Server, Search, Shield,
    TrendingUp, PieChart as PieChartIcon, BarChart3, AlertCircle
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { fetchAllUsers, AdminUserStats, updateUser, fetchSystemStats, fetchProjectStats, adjustUserCredits, fetchRevenueStats } from '../services/adminService';
import { getTransactions, Transaction } from '../services/transactionService';

// Mock Data for Charts (Until we have a dedicated Analytics Collection)
const USAGE_DATA = [
    { name: 'Mon', credits: 4000, videos: 24 },
    { name: 'Tue', credits: 3000, videos: 18 },
    { name: 'Wed', credits: 2000, videos: 12 },
    { name: 'Thu', credits: 2780, videos: 20 },
    { name: 'Fri', credits: 1890, videos: 15 },
    { name: 'Sat', credits: 2390, videos: 19 },
    { name: 'Sun', credits: 3490, videos: 25 },
];

const MODEL_DATA = [
    { name: 'Wan 2.1 (Video)', value: 400 },
    { name: 'Veo (Video)', value: 300 },
    { name: 'Gemini (Img)', value: 1200 },
    { name: 'TTS (Audio)', value: 800 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const AdminPanel: React.FC = () => {
    const [users, setUsers] = useState<AdminUserStats[]>([]);
    const [stats, setStats] = useState<any>({
        totalUsers: 0, activePro: 0, totalCredits: 0, estimatedRevenue: 0, systemHealth: '100%'
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [revenueData, setRevenueData] = useState<any[]>([]); // New State
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersData, systemStats, projectStats, txData, revData] = await Promise.all([
                fetchAllUsers(),
                fetchSystemStats(),
                fetchProjectStats(),
                getTransactions(),
                fetchRevenueStats()
            ]);
            setUsers(usersData);
            setStats(systemStats);
            setChartData(projectStats.length > 0 ? projectStats : USAGE_DATA); // Fallback if no projects
            setTransactions(txData);
            setRevenueData(revData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBan = async (user: AdminUserStats) => {
        if (!confirm(`Are you sure you want to ${user.status === 'banned' ? 'unban' : 'ban'} this user?`)) return;

        const newStatus = user.status === 'banned' ? 'active' : 'banned';
        try {
            await updateUser(user.id, { status: newStatus });
            // Optimistic UI update
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        } catch (error) {
            alert("Failed to update user status");
        }
    };

    // Filter users
    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.includes(searchTerm)
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Shield className="text-purple-500" size={32} />
                    Admin Command Center
                </h1>
                <p className="text-slate-400 mt-2">System Overview & User Management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Total Users"
                    value={stats.totalUsers.toString()}
                    icon={Users}
                    trend="Live"
                    color="text-blue-400"
                />
                <StatCard
                    label="Active Pro Subscriptions"
                    value={stats.activePro.toString()}
                    icon={DollarSign}
                    trend="Est. Revenue"
                    color="text-emerald-400"
                />
                <StatCard
                    label="Total Credits Circulating"
                    value={stats.totalCredits.toLocaleString()}
                    icon={Activity}
                    trend="Global"
                    color="text-amber-400"
                />
                <StatCard
                    label="System Health"
                    value={stats.systemHealth}
                    icon={Server}
                    trend="Stable"
                    color="text-purple-400"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Usage Chart */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp size={18} className="text-blue-400" />
                            Credit Consumption (7 Days)
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="credits" stroke="#8884d8" fillOpacity={1} fill="url(#colorCredits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <BarChart3 size={18} className="text-emerald-400" />
                            Revenue Trends (30 Days)
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(val) => `$${val}`} />
                                <Tooltip
                                    cursor={{ fill: '#1e293b' }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Bar dataKey="revenue" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* User Management Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">User Database</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Plan</th>
                                <th className="p-4 font-bold">Credits</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold">Joined</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center">Loading users...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No users found.</td></tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-medium text-white">
                                            <div>{user.email}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">{user.id}</div>
                                        </td>
                                        <td className={`p-4 font-bold uppercase ${user.plan === 'pro' ? 'text-purple-400' : 'text-slate-400'}`}>
                                            {user.plan}
                                        </td>
                                        <td className="p-4 font-mono text-amber-400">
                                            {user.credits.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.status === 'banned' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {user.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    const amount = prompt("Enter credit amount to ADD (e.g. 100) or REMOVE (e.g. -100):");
                                                    if (amount && !isNaN(parseInt(amount))) {
                                                        const val = parseInt(amount);
                                                        const reason = prompt("Reason for adjustment:");
                                                        if (reason) {
                                                            adjustUserCredits(user.id, val)
                                                                .then(() => {
                                                                    alert(`Successfully ${val > 0 ? 'added' : 'deducted'} ${Math.abs(val)} credits.`);
                                                                    // Optimistic Update
                                                                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, credits: (u.credits || 0) + val } : u));
                                                                })
                                                                .catch(e => alert("Failed: " + e.message));
                                                        }
                                                    }
                                                }}
                                                className="text-xs px-3 py-1.5 rounded-lg transition-colors font-bold uppercase bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                                            >
                                                Adjust Credits
                                            </button>
                                            <button
                                                onClick={() => handleToggleBan(user)}
                                                className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-bold uppercase ${user.status === 'banned'
                                                    ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    }`}
                                            >
                                                {user.status === 'banned' ? 'Unban' : 'Ban'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Transaction History */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <DollarSign className="text-emerald-500" size={20} />
                        Recent Transactions
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold">ID / Date</th>
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Description</th>
                                <th className="p-4 font-bold">Method</th>
                                <th className="p-4 font-bold text-right">Amount</th>
                                <th className="p-4 font-bold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                            {transactions.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-slate-500">No transactions recorded yet.</td></tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-mono text-xs text-slate-500">
                                            <div className="text-white font-bold mb-1">{tx.id.substring(0, 8)}...</div>
                                            {tx.date?.seconds ? new Date(tx.date.seconds * 1000).toLocaleString() : new Date().toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{tx.email || 'Unknown'}</div>
                                            <div className="text-[10px] text-slate-500 font-mono">{tx.userId}</div>
                                        </td>
                                        <td className="p-4 font-medium">{tx.description}</td>
                                        <td className="p-4 text-xs uppercase tracking-wide opacity-80">{tx.method}</td>
                                        <td className="p-4 text-right font-bold text-emerald-400">
                                            ${tx.amount.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${tx.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, trend, color }: any) => (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-all">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-slate-950 ${color}`}>
                <Icon size={24} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-950 ${trend.includes('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend}
            </span>
        </div>
        <h3 className="text-3xl font-black text-white">{value}</h3>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{label}</p>
    </div>
);

export default AdminPanel;
