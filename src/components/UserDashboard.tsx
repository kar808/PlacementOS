import React, { useState } from "react";
import { StudentProfile, ReadinessScores, PastInterviewSession } from "../types";
import { auth } from "../lib/firebase";
import { 
  LayoutDashboard, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  Bell, 
  Check, 
  Settings, 
  GraduationCap, 
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  FolderGit
} from "lucide-react";

interface UserDashboardProps {
  profile: StudentProfile;
  scores: ReadinessScores | null;
  interviewHistory: PastInterviewSession[];
  onNavigateToSection: (section: string) => void;
  activities: { id: string; event: string; description: string; timestamp: string; category: string }[];
  notifications: { id: string; title: string; body: string; timestamp: string; read: boolean }[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export default function UserDashboard({
  profile,
  scores,
  interviewHistory,
  onNavigateToSection,
  activities,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onRefreshData,
  isRefreshing
}: UserDashboardProps) {
  const [showAllNotifications, setShowAllNotifications] = useState<boolean>(false);

  // Compute profile completion rate
  const calculateProfileCompletion = (): number => {
    const fieldsToTrack: (keyof StudentProfile)[] = [
      "name", "college", "degree", "branch", "year", "gpa", "location", 
      "preferredLocation", "linkedinUrl", "githubUrl", "phone"
    ];
    let populatedCount = 0;
    fieldsToTrack.forEach(field => {
      const value = profile[field];
      if (Array.isArray(value) && value.length > 0) populatedCount++;
      else if (typeof value === "string" && value.trim() !== "") populatedCount++;
    });

    if (profile.technicalSkills.length > 0) populatedCount++;
    if (profile.targetRoles.length > 0) populatedCount++;

    const totalFields = fieldsToTrack.length + 2;
    return Math.round((populatedCount / totalFields) * 100);
  };

  const completionPercent = calculateProfileCompletion();
  const unreadNotifications = notifications.filter(n => !n.read);

  // Get active student's first name
  const studentFirstName = profile.name ? profile.name.split(" ")[0] : "Student";

  // Get interview scores summary
  const latestInterview = interviewHistory[0];
  const averageInterviewScore = interviewHistory.length > 0 
    ? Math.round(interviewHistory.reduce((sum, item) => sum + item.overallScore, 0) / interviewHistory.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Dynamic Welcome Hero Panel */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
              <Zap className="w-2.5 h-2.5" /> Nodes online & synchronized
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Welcome back, {studentFirstName}! <Sparkles className="w-5 h-5 text-emerald-400" />
            </h2>
            <p className="text-xs text-white/50 leading-relaxed max-w-xl">
              Your career co-pilot is active. We analyzed your background and synchronized {interviewHistory.length} mock sessions. You are currently tracked on target pathways for <strong className="text-emerald-400 font-mono">{profile.targetRoles[0] || "Software Engineer"}</strong>.
            </p>
          </div>

          {onRefreshData && (
            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer text-white/70 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Profile Completion */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">Profile Builder</span>
              <h3 className="text-2xl font-black text-white font-mono">{completionPercent}%</h3>
            </div>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
            </div>
            <div className="flex justify-between items-center text-[10px] text-white/40 font-mono">
              <span>{completionPercent < 100 ? "Incomplete metadata" : "100% Configured"}</span>
              <button 
                onClick={() => onNavigateToSection("blueprint")}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5 cursor-pointer hover:underline"
              >
                Configure <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Resume & ATS Grade */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">ATS Resume Match</span>
              <h3 className="text-2xl font-black text-white font-mono">
                {scores?.resume?.score ? `${scores.resume.score}%` : "Pending"}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-white/50 leading-snug">
              {scores?.resume?.score 
                ? `Ready for application queues. Ranked 'Strong' match.` 
                : "No resume analysis cache detected on system nodes."}
            </p>
            <button
              onClick={() => onNavigateToSection("resume")}
              className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 mt-1 cursor-pointer font-mono hover:underline"
            >
              Analyze Resume <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Interview Score */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">Interview Index</span>
              <h3 className="text-2xl font-black text-white font-mono">
                {interviewHistory.length > 0 ? `${averageInterviewScore}%` : "No sessions"}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-white/50 leading-snug">
              {interviewHistory.length > 0 
                ? `Evaluated across ${interviewHistory.length} custom AI simulator sprints.` 
                : "Simulation sandbox is idle. Launch AI interview simulator."}
            </p>
            <button
              onClick={() => onNavigateToSection("interview")}
              className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 mt-1 cursor-pointer font-mono hover:underline"
            >
              Practice Interview <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Career Readiness Index */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block font-mono">Readiness Index</span>
              <h3 className="text-2xl font-black text-emerald-400 font-mono">
                {scores?.overall ? `${scores.overall}%` : "Pending"}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-white/50 leading-snug">
              {scores?.overall 
                ? `Employability benchmark is ${scores.overall >= 80 ? "elite" : "moderate"}.` 
                : "Requires complete Audit suite run to construct index map."}
            </p>
            <button
              onClick={() => onNavigateToSection("dashboard")}
              className="text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 mt-1 cursor-pointer font-mono hover:underline"
            >
              View Gaps Audit <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary split panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Notification Center & Quick Actions */}
        <div className="lg:col-span-2 space-y-5">
          {/* In-app Notification center */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Notification Center</h3>
                {unreadNotifications.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-rose-500 text-white font-black font-mono text-[9px] rounded-full">
                    {unreadNotifications.length} NEW
                  </span>
                )}
              </div>
              {unreadNotifications.length > 0 && (
                <button
                  onClick={onMarkAllNotificationsRead}
                  className="text-[10px] font-bold text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-xs font-mono">
                  All notification channels are empty and quiet.
                </div>
              ) : (
                (showAllNotifications ? notifications : notifications.slice(0, 4)).map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-3.5 border rounded-xl flex items-start gap-3 transition-all ${
                      notif.read 
                        ? "bg-transparent border-white/5 opacity-50" 
                        : "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${notif.read ? "bg-white/5 text-white/30" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {notif.read ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5 animate-pulse" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-white truncate leading-snug">{notif.title}</h4>
                        <span className="text-[9px] text-white/30 font-mono shrink-0">{notif.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-white/50 leading-relaxed font-semibold">{notif.body}</p>
                      {!notif.read && (
                        <button
                          onClick={() => onMarkNotificationRead(notif.id)}
                          className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors mt-1.5 block cursor-pointer"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 4 && (
              <button
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                className="w-full text-center py-2 border border-white/5 rounded-xl text-xs text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/10 font-bold cursor-pointer"
              >
                {showAllNotifications ? "Collapse Notifications" : `Show All Notifications (${notifications.length})`}
              </button>
            )}
          </div>

          {/* Quick Action Matrix (Bento style) */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">Employability Quick Sprint Matrix</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigateToSection("resume")}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/20 text-left rounded-xl space-y-2 group transition-all cursor-pointer"
              >
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg w-fit group-hover:scale-105 transition-transform">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Optimize ATS Bullet</h4>
                  <p className="text-[10px] text-white/40 leading-normal mt-0.5">Rewrite and sync resume items to bypass robot filters.</p>
                </div>
              </button>

              <button
                onClick={() => onNavigateToSection("interview")}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/20 text-left rounded-xl space-y-2 group transition-all cursor-pointer"
              >
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg w-fit group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Mock Simulator</h4>
                  <p className="text-[10px] text-white/40 leading-normal mt-0.5">Staged 5-question mock session tailored to role profile.</p>
                </div>
              </button>

              <button
                onClick={() => onNavigateToSection("roadmap")}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/20 text-left rounded-xl space-y-2 group transition-all cursor-pointer"
              >
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg w-fit group-hover:scale-105 transition-transform">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">View Learning Path</h4>
                  <p className="text-[10px] text-white/40 leading-normal mt-0.5">Structured study plans addressing domain gaps.</p>
                </div>
              </button>

              <button
                onClick={() => onNavigateToSection("projects")}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/20 text-left rounded-xl space-y-2 group transition-all cursor-pointer"
              >
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg w-fit group-hover:scale-105 transition-transform">
                  <FolderGit className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Project Ideation</h4>
                  <p className="text-[10px] text-white/40 leading-normal mt-0.5">Design high-impact, resume-ready project templates.</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Activity Log & Upcoming Tasks */}
        <div className="space-y-5">
          {/* System Security & Session Info */}
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>SECURITY PROTOCOLS</span>
            </div>
            <p className="text-[10px] text-white/60 leading-normal">
              Your profile metrics and session histories are encrypted and isolated under UID <code className="text-emerald-400 font-mono font-bold">{auth.currentUser?.uid?.substring(0, 8) || "SANDBOX"}...</code>.
            </p>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Activity Ledger</h3>
              <Clock className="w-3.5 h-3.5 text-white/30" />
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <div className="text-center py-10 text-white/30 text-xs font-mono">
                  No registered actions on file ledger.
                </div>
              ) : (
                activities.slice(0, 6).map((act, index) => (
                  <div key={act.id || index} className="flex gap-3 relative">
                    {/* Visual connecting timeline bar */}
                    {index < activities.slice(0, 6).length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-0 w-[1px] bg-white/5" />
                    )}

                    <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center gap-4">
                        <h4 className="text-xs font-bold text-white">{act.event}</h4>
                        <span className="text-[8px] text-white/30 font-mono">{act.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-white/50 leading-relaxed font-semibold">{act.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
