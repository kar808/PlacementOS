import React, { useState, useEffect } from "react";
import { getWaitlistStats, WaitlistStats, WaitlistEntry } from "../lib/waitlist";
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
  UserCheck,
  Building,
  RefreshCw,
  Search,
  CalendarDays,
  FileCheck2,
  CopyX
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar 
} from "recharts";

interface AdminDashboardProps {
  currentLogsCount?: number;
}

export default function AdminDashboard({ currentLogsCount = 0 }: AdminDashboardProps) {
  const [metrics, setMetrics] = useState<EndpointMetric[]>([]);
  const [waitlistData, setWaitlistData] = useState<WaitlistStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    duplicates: 0,
    entries: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");

  const fetchWaitlistStats = async () => {
    setLoading(true);
    try {
      const stats = await getWaitlistStats();
      setWaitlistData(stats);
    } catch (err) {
      console.error("Error retrieving waitlist statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlistStats();
    
    // Subscribe to endpoint metrics
    const unsubscribe = subscribeToMetrics((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Compute stats for visualization
  // 1. Role distribution
  const roleCounts: Record<string, number> = {};
  waitlistData.entries.forEach(entry => {
    const r = entry.role || "Unknown";
    roleCounts[r] = (roleCounts[r] || 0) + 1;
  });

  const ROLE_COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#ef4444"];
  const roleDistributionData = Object.entries(roleCounts).map(([name, value]) => ({
    name,
    value
  }));

  // 2. Timeline distribution (last 7 days of registrations)
  const timelineData: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    timelineData[label] = 0;
  }

  waitlistData.entries.forEach(entry => {
    const d = new Date(entry.created_at);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (label in timelineData) {
      timelineData[label]++;
    }
  });

  const timelineChartData = Object.entries(timelineData).map(([day, count]) => ({
    day,
    registrations: count
  }));

  // Filter and search entries
  const filteredEntries = waitlistData.entries.filter(entry => {
    const matchesSearch = 
      entry.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.organization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRoleFilter === "all" || entry.role === selectedRoleFilter;
    
    return matchesSearch && matchesRole;
  });

  const exportCSV = () => {
    try {
      const headers = ["ID", "Full Name", "Email", "Role", "Organization", "Source", "Registered At"];
      const rows = waitlistData.entries.map(e => [
        e.id || "",
        `"${e.full_name.replace(/"/g, '""')}"`,
        e.email,
        e.role,
        `"${e.organization.replace(/"/g, '""')}"`,
        e.source,
        e.created_at
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `placementos_waitlist_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="space-y-6" id="admin_console">
      {/* Admin Title Panel */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> PlacementOS Pre-Launch Control
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Waitlist Performance & Lead Analytics</h2>
            <p className="text-xs text-white/50 leading-relaxed max-w-xl">
              Track real-time registrations, channel conversion sources, and campaign duplicates securely synchronized inside Google Cloud Firestore.
            </p>
          </div>

          <button
            onClick={fetchWaitlistStats}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 active:bg-white/15 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Leads
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Registrants */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Total Leads</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono">
              {loading ? "..." : waitlistData.total}
            </h3>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Unique verified emails registered on waitlist.</p>
        </div>

        {/* Metric 2: Registrations Today */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Registered Today</span>
            <CalendarDays className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono">
              {loading ? "..." : waitlistData.today}
            </h3>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Early access signups in past 24 hours.</p>
        </div>

        {/* Metric 3: Registrations This Week */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">This Week</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono">
              {loading ? "..." : waitlistData.thisWeek}
            </h3>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Signups registered in last 7 trailing days.</p>
        </div>

        {/* Metric 4: Registrations This Month */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">This Month</span>
            <FileCheck2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono">
              {loading ? "..." : waitlistData.thisMonth}
            </h3>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Active signups in current calendar month.</p>
        </div>

        {/* Metric 5: Duplicate Attempts */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 col-span-2 lg:col-span-1 space-y-3">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Duplicate Blocked</span>
            <CopyX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex justify-between items-baseline">
            <h3 className="text-3xl font-black text-white font-mono text-rose-400">
              {loading ? "..." : waitlistData.duplicates}
            </h3>
          </div>
          <p className="text-[10px] text-white/40 leading-relaxed">Filtered identical email registration retries.</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      {waitlistData.entries.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Registration trend over past week */}
          <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Recent Registration Velocity</h3>
              <span className="text-[10px] font-mono text-white/40 uppercase">Trailing 7 Days</span>
            </div>
            
            <div className="h-[240px] w-full font-mono text-[11px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="day" stroke="#555" />
                  <YAxis stroke="#555" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                    labelStyle={{ color: "#888" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="registrations" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Role breakdown */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Target Role Cohorts</h3>
              <span className="text-[10px] font-mono text-white/40 uppercase">Leads Split</span>
            </div>

            <div className="h-[240px] w-full flex flex-col items-center justify-center font-mono text-[11px]">
              {roleDistributionData.length > 0 ? (
                <div className="w-full h-full flex flex-row items-center">
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {roleDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ROLE_COLORS[index % ROLE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                          itemStyle={{ color: "#fff" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 flex flex-col gap-2 pl-2">
                    {roleDistributionData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: ROLE_COLORS[index % ROLE_COLORS.length] }} />
                        <span className="text-white/60 truncate text-[10px] uppercase font-bold">{entry.name}</span>
                        <span className="text-white font-bold ml-auto text-[10px] font-mono">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-white/30 text-xs">Waiting for lead data...</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registrant Ledger */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Lead Activation Ledger</h3>
            <p className="text-[11px] text-white/40 leading-normal">
              Browse, filter, and export the official registry of early-adopter contacts.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search name, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-4 py-1.5 bg-black/40 border border-white/10 hover:border-white/20 focus:border-purple-500 rounded-xl text-xs text-white placeholder-white/30 outline-none transition-all"
              />
            </div>

            {/* Filter */}
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-black/40 border border-white/10 hover:border-white/20 rounded-xl text-xs text-white outline-none transition-all cursor-pointer font-semibold"
            >
              <option value="all">All Roles</option>
              <option value="Student">Student</option>
              <option value="Graduate">Graduate</option>
              <option value="Professional">Professional</option>
              <option value="Recruiter">Recruiter</option>
            </select>

            {/* Export */}
            <button 
              onClick={exportCSV}
              disabled={waitlistData.entries.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 active:bg-purple-500/30 border border-purple-500/20 rounded-xl text-xs font-bold text-purple-400 hover:text-purple-300 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto border border-white/5 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-black/40 border-b border-white/10 font-mono text-[10px] text-white/40 uppercase">
                <th className="p-3.5 font-bold">Contact Name</th>
                <th className="p-3.5 font-bold">Role</th>
                <th className="p-3.5 font-bold">Organization / College</th>
                <th className="p-3.5 font-bold">Source</th>
                <th className="p-3.5 font-bold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-white/40 font-mono">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-500" />
                    Synchronizing live database leads...
                  </td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-white/40 font-mono">
                    No leads match your current search queries.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 text-white flex flex-col">
                      <span className="font-bold text-white text-sm">{lead.full_name}</span>
                      <span className="font-mono text-[10px] text-white/40">{lead.email}</span>
                    </td>
                    <td className="p-3.5 text-white/80">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/80 font-mono uppercase">
                        {lead.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-white/70">
                      {lead.organization ? (
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-white/30 shrink-0" />
                          <span>{lead.organization}</span>
                        </div>
                      ) : (
                        <span className="text-white/20 italic">None Provided</span>
                      )}
                    </td>
                    <td className="p-3.5 text-white/60 font-mono text-[10px] uppercase">{lead.source}</td>
                    <td className="p-3.5 text-white/40 font-mono text-[10px]">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
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
              {metrics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-white/40 font-mono">
                    No active runtime endpoint calls yet.
                  </td>
                </tr>
              ) : (
                metrics.map((metric) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
