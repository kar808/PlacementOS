import React, { useState, useEffect } from "react";
import { subscribeToMetrics, EndpointMetric } from "../lib/apiMonitoring";
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Zap, 
  Activity, 
  ShieldAlert, 
  CheckCircle, 
  ArrowUpRight, 
  FileText, 
  MessageSquare, 
  Compass, 
  MapPin, 
  Download,
  Filter,
  UserCheck
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar,
  Cell
} from "recharts";

// Mock Aggregated Growth Data
const REGISTRATION_TREND_DATA = [
  { month: "Jan", users: 450, active: 310, retention: 72 },
  { month: "Feb", users: 680, active: 490, retention: 76 },
  { month: "Mar", users: 920, active: 710, retention: 81 },
  { month: "Apr", users: 1340, active: 1040, retention: 84 },
  { month: "May", users: 1890, active: 1530, retention: 86 },
  { month: "Jun", users: 2450, active: 2020, retention: 89 },
];

// Feature Usage Metrics Data
const FEATURE_USAGE_DATA = [
  { name: "ATS Scans", count: 1890, pct: 38 },
  { name: "AI Interviews", count: 1450, pct: 29 },
  { name: "Study Roadmaps", count: 980, pct: 20 },
  { name: "Offer Negotiations", count: 650, pct: 13 },
];

// Mock Registered Active Users List for Admin view
const RECENTLY_REGISTERED_USERS = [
  { id: "u_1", name: "Sushil Madan", email: "sushilmadan.yg@gmail.com", role: "Full Stack Engineer", college: "IIT Bombay", scores: 88, status: "Active" },
  { id: "u_2", name: "Aditi Rao", email: "aditi.rao@gmail.com", role: "Product Manager", college: "BITS Pilani", scores: 92, status: "Active" },
  { id: "u_3", name: "Pranav Shah", email: "pranav.s@university.edu", role: "Data Scientist", college: "IIT Kharagpur", scores: 76, status: "Active" },
  { id: "u_4", name: "Kirti Shinde", email: "kirti.shinde@outlook.com", role: "UI/UX Designer", college: "NID Ahmedabad", scores: 81, status: "Active" },
  { id: "u_5", name: "Rahul Verma", email: "verma.rahul@gmail.com", role: "DevOps Engineer", college: "NIT Trichy", scores: 65, status: "Inactive" },
];

interface AdminDashboardProps {
  currentLogsCount?: number;
}

export default function AdminDashboard({ currentLogsCount = 0 }: AdminDashboardProps) {
  const [metricFilter, setMetricFilter] = useState<string>("all");
  const [metrics, setMetrics] = useState<EndpointMetric[]>([]);

  useEffect(() => {
    return subscribeToMetrics((newMetrics) => {
      setMetrics(newMetrics);
    });
  }, []);

  // Sum total registered mock + real users
  const totalMockUsers = 2450 + 1; // 2450 pre-seeded + current session profile
  const dailyActiveUsers = 480;
  const weeklyActiveUsers = 1250;
  const monthlyActiveUsers = 2150;
  
  // Calculate DAU / MAU ratio (vital SaaS health metric)
  const dauMauRatio = Math.round((dailyActiveUsers / monthlyActiveUsers) * 100);

  return (
    <div className="space-y-6">
      {/* Admin Title Panel */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> PlacementOS Admin Console
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">System Performance & Product Analytics</h2>
            <p className="text-xs text-white/50 leading-relaxed max-w-xl">
              Monitor aggregate student registration trends, DAU/MAU cohorts, average session durations, and feature activation benchmarks across active cloud nodes.
            </p>
          </div>
        </div>
      </div>

      {/* Aggregate Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Registered */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">Total Users</span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono">{totalMockUsers}</h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">+18% MoM</span>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Active student sandboxes registered in default Firestore clusters.</p>
        </div>

        {/* Metric 2: DAU / MAU Ratio */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">DAU / MAU Engagement</span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono">{dauMauRatio}%</h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">Excellent</span>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Percentage of monthly users returning daily. Goal: &gt;15%.</p>
        </div>

        {/* Metric 3: Active Cohort */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">WAU Cohort</span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono">{weeklyActiveUsers}</h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">Active</span>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Students executing interviews or ATS audits within trailing 7 days.</p>
        </div>

        {/* Metric 4: Average Session Length */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-3">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">Avg. Session Duration</span>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono">14.6m</h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">+1.2m</span>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Average duration of high-fidelity mock interview sessions.</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Registration & Retention Trend */}
        <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">User Growth & Retention Cohorts</h3>
            <span className="text-[10px] font-mono text-white/40 uppercase">Trailing 6 Months</span>
          </div>
          
          <div className="h-[280px] w-full font-mono text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REGISTRATION_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="month" stroke="#555" />
                <YAxis stroke="#555" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                  labelStyle={{ color: "#888" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Line type="monotone" name="Total Registrations" dataKey="users" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Active Sandboxes" dataKey="active" stroke="#60a5fa" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Feature Activation breakdown */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Feature Activation Metrics</h3>
            <span className="text-[10px] font-mono text-white/40 uppercase">Total Hits</span>
          </div>

          <div className="h-[280px] w-full font-mono text-[11px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FEATURE_USAGE_DATA} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis type="number" stroke="#555" />
                <YAxis type="category" dataKey="name" stroke="#555" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {FEATURE_USAGE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#059669"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Registrant Access Ledger</h3>
            <p className="text-[11px] text-white/40 leading-normal">Interactive ledger of verified student accounts registered in the Firestore environment.</p>
          </div>
          
          <div className="flex gap-2">
            <button className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white/70 hover:text-white transition-all cursor-pointer">
              <Filter className="w-3.5 h-3.5" /> Filter Cohorts
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white/70 hover:text-white transition-all cursor-pointer">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto border border-white/5 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 font-mono text-[10px] text-white/40 uppercase">
                <th className="p-3.5 font-bold">Student Name</th>
                <th className="p-3.5 font-bold">Institutional Email</th>
                <th className="p-3.5 font-bold">Target Role</th>
                <th className="p-3.5 font-bold">University</th>
                <th className="p-3.5 font-bold text-center">Readiness Index</th>
                <th className="p-3.5 font-bold text-center">Auth Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {RECENTLY_REGISTERED_USERS.map((usr) => (
                <tr key={usr.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 text-white flex items-center gap-2">
                    <div className="w-6.5 h-6.5 bg-emerald-500/10 text-emerald-400 font-black flex items-center justify-center rounded-lg text-[10px] font-mono shrink-0 border border-emerald-500/10">
                      {usr.name[0]}
                    </div>
                    <span>{usr.name}</span>
                  </td>
                  <td className="p-3.5 text-white/70 font-mono text-[11px]">{usr.email}</td>
                  <td className="p-3.5 text-white/80">{usr.role}</td>
                  <td className="p-3.5 text-white/60">{usr.college}</td>
                  <td className="p-3.5 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      usr.scores >= 85 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}>
                      {usr.scores}%
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {usr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Endpoint Health & Latency Monitor Panel */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              Service Endpoint Performance & Health
            </h3>
            <p className="text-[11px] text-white/40 leading-normal">
              Real-time latency metrics, error frequencies, and service health scores of cloud-hosted career endpoint controllers.
            </p>
          </div>
        </div>

        {/* Latency / Endpoint Health Table */}
        <div className="overflow-x-auto border border-white/5 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 font-mono text-[10px] text-white/40 uppercase">
                <th className="p-3.5 font-bold">API Endpoint Controller</th>
                <th className="p-3.5 font-bold text-center">Requests</th>
                <th className="p-3.5 font-bold text-center">Success Rate</th>
                <th className="p-3.5 font-bold text-center">Avg Latency</th>
                <th className="p-3.5 font-bold text-center">Endpoint Health</th>
                <th className="p-3.5 font-bold text-right">Last Invocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {metrics.map((metric) => (
                <tr key={metric.endpoint} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 text-white font-mono text-[11px]">{metric.endpoint}</td>
                  <td className="p-3.5 text-center font-mono text-white/80">{metric.totalCalls}</td>
                  <td className="p-3.5 text-center font-mono">
                    <span className="text-emerald-400">{metric.successCalls}</span>
                    <span className="text-white/30 mx-1">/</span>
                    <span className="text-red-400">{metric.failedCalls}</span>
                  </td>
                  <td className="p-3.5 text-center font-mono text-white/70">{metric.averageLatencyMs}ms</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      metric.healthScore >= 95 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : metric.healthScore >= 80 
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}>
                      {metric.healthScore}% Health
                    </span>
                  </td>
                  <td className="p-3.5 text-right text-white/40 font-mono text-[10px]">
                    {metric.lastCallTimestamp > 0 
                      ? new Date(metric.lastCallTimestamp).toLocaleTimeString() 
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
