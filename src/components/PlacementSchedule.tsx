import React, { useState, useEffect } from "react";
import { StudentProfile } from "../types";
import { 
  Calendar, 
  Download, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Briefcase, 
  Flame, 
  Search, 
  ChevronRight, 
  Award,
  Filter,
  CheckCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Bell,
  AlertTriangle,
  Plus,
  Trash2,
  ExternalLink,
  X,
  CalendarDays,
  Info
} from "lucide-react";

interface PlacementScheduleProps {
  profile: StudentProfile;
}

interface CalendarTask {
  day: number;
  title: string;
  category: "Study" | "Application" | "Outreach" | "Portfolio";
  description: string;
  duration: string;
  deliverable: string;
  isCompleted?: boolean;
  skillGaps?: string[];
  deadlineDate?: string;
}

interface CompanyDeadline {
  id: string;
  company: string;
  role: string;
  date: string; // YYYY-MM-DD
  skillGaps: string[];
}

const getGapsForTask = (day: number, category: string): string[] => {
  if (category === "Study") {
    if (day <= 10) return ["Core Data Structures", "LeetCode Easy-Medium Drills"];
    if (day <= 20) return ["Advanced BST Traversals", "System Design Load Balancers"];
    return ["Dynamic Programming Tabulation", "Mock Interview Pressure Training"];
  }
  if (category === "Portfolio") {
    if (day <= 10) return ["ATS-Optimized Project Architecture", "GitHub README Best Practices"];
    if (day <= 20) return ["Dynamic Mock API Integration", "Cloud Container Deployments"];
    return ["Production Code Error-Handling", "Pristine UI Responsive Layouts"];
  }
  if (category === "Outreach") {
    if (day <= 15) return ["LinkedIn Connection Pitching", "Alumni Outreach Engagement"];
    return ["Hiring Manager Cold Messages", "Internal Referral Requests"];
  }
  // Application
  if (day <= 15) return ["Active Keyword Optimization", "Job Matching Outlines"];
  return ["Application Tracking Systems", "Quantifiable Value Proofs"];
};

export default function PlacementSchedule({ profile }: PlacementScheduleProps) {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Drag and drop states
  const [draggedDay, setDraggedDay] = useState<number | null>(null);
  const [dragOverDay, setDragOverDay] = useState<number | null>(null);

  // Deadlines states
  const [deadlines, setDeadlines] = useState<CompanyDeadline[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newGaps, setNewGaps] = useState("");

  // Sync modal states
  const [showSyncInstructions, setShowSyncInstructions] = useState(false);

  // Load custom deadlines from local storage or set defaults relativized to current date
  useEffect(() => {
    const cachedDeadlines = localStorage.getItem(`placement_deadlines_${profile.name}`);
    if (cachedDeadlines) {
      try {
        setDeadlines(JSON.parse(cachedDeadlines));
        return;
      } catch (e) {
        console.warn("Failed to parse cached deadlines", e);
      }
    }

    const today = new Date();
    const relativeDate = (daysFromToday: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() + daysFromToday);
      return d.toISOString().split('T')[0];
    };

    const defaults: CompanyDeadline[] = [
      {
        id: "dl-1",
        company: profile.targetCompanies[0] || "Google",
        role: profile.targetRoles[0] || "Software Engineer",
        date: relativeDate(3), // 3 days left
        skillGaps: ["Advanced Tree Algorithms", "System Design Scalability"]
      },
      {
        id: "dl-2",
        company: profile.targetCompanies[1] || "Stripe",
        role: profile.targetRoles[1] || "Full-Stack Developer",
        date: relativeDate(6), // 6 days left
        skillGaps: ["CORS & Security Configurations", "Database Schema Tuning"]
      },
      {
        id: "dl-3",
        company: "Amazon",
        role: profile.targetRoles[0] || "SDE-1",
        date: relativeDate(12), // 12 days left
        skillGaps: ["Mock Interview Verbal Confidence", "Behavioral STAR Formulations"]
      }
    ];

    setDeadlines(defaults);
    localStorage.setItem(`placement_deadlines_${profile.name}`, JSON.stringify(defaults));
  }, [profile]);

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(dateStr);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleAddDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole || !newDate) return;

    const newDl: CompanyDeadline = {
      id: `dl-custom-${Date.now()}`,
      company: newCompany,
      role: newRole,
      date: newDate,
      skillGaps: newGaps ? newGaps.split(",").map(s => s.trim()).filter(Boolean) : ["General Application Requirements"]
    };

    const updated = [...deadlines, newDl];
    setDeadlines(updated);
    localStorage.setItem(`placement_deadlines_${profile.name}`, JSON.stringify(updated));

    setNewCompany("");
    setNewRole("");
    setNewDate("");
    setNewGaps("");
    setShowAddForm(false);
  };

  const handleDeleteDeadline = (id: string) => {
    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    localStorage.setItem(`placement_deadlines_${profile.name}`, JSON.stringify(updated));
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, day: number) => {
    setDraggedDay(day);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent, day: number) => {
    e.preventDefault();
    setDragOverDay(day);
  };

  const handleDrop = (e: React.DragEvent, targetDay: number) => {
    e.preventDefault();
    setDragOverDay(null);
    if (draggedDay === null || draggedDay === targetDay) return;

    const updated = [...tasks];
    const dragIdx = updated.findIndex(t => t.day === draggedDay);
    const targetIdx = updated.findIndex(t => t.day === targetDay);

    if (dragIdx !== -1 && targetIdx !== -1) {
      const temp = { ...updated[dragIdx] };
      updated[dragIdx] = {
        ...updated[targetIdx],
        day: draggedDay
      };
      updated[targetIdx] = {
        ...temp,
        day: targetDay
      };
      
      saveTasks(updated);
    }
    setDraggedDay(null);
  };

  // Generate 30-day calendar customized based on student profile
  useEffect(() => {
    const cached = localStorage.getItem(`placement_schedule_${profile.name}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const backfilled = parsed.map((task: any) => ({
          ...task,
          skillGaps: task.skillGaps || getGapsForTask(task.day, task.category)
        }));
        setTasks(backfilled);
        setSelectedTask(backfilled[0] || null);
        return;
      } catch (e) {
        console.warn("Failed to parse cached schedule", e);
      }
    }

    const targetRole = profile.targetRoles[0] || "Software Engineer";
    const primarySkill = profile.technicalSkills[0] || "Core Fundamentals";
    const targetCompany = profile.targetCompanies[0] || "Tier-1 Tech Companies";

    const baseSchedule: CalendarTask[] = [
      {
        day: 1,
        title: `Align Profile for ${targetRole}`,
        category: "Study",
        description: `Research exact ATS keywords and core competencies expected for a junior/entry-level ${targetRole} role. Map these against your current skill checklist.`,
        duration: "2 hours",
        deliverable: "Target keyword ledger and specific competency checklist."
      },
      {
        day: 2,
        title: `Tailor Resume Base Draft`,
        category: "Portfolio",
        description: `Rewrite your resume summary and title line to directly target ${targetRole} positions. Refine internships/projects to highlight ${primarySkill}.`,
        duration: "3 hours",
        deliverable: "Optimized primary ATS-compliant resume PDF draft."
      },
      {
        day: 3,
        title: "Audit LinkedIn Profile",
        category: "Outreach",
        description: "Update your professional headline, about summary, and experience sections with quantitative outcomes (e.g. metrics, scale, percentages).",
        duration: "2.5 hours",
        deliverable: "Perfected LinkedIn URL with a strong headline banner."
      },
      {
        day: 4,
        title: `Construct LinkedIn Dream List`,
        category: "Outreach",
        description: `Search and compile 15 alumni or professionals working as ${targetRole}s at ${targetCompany} or nearby companies. Save their profiles.`,
        duration: "2 hours",
        deliverable: "Excel ledger containing names, links, and customized connection message templates."
      },
      {
        day: 5,
        title: `Deep-dive on ${primarySkill} Basics`,
        category: "Study",
        description: `Review intermediate to advanced syntax, structures, memory models, or fundamental paradigms of ${primarySkill}. Complete 3 simple drills.`,
        duration: "4 hours",
        deliverable: "GitHub repository with basic drills and structured notes."
      },
      {
        day: 6,
        title: "LeetCode / Data Structures Foundations",
        category: "Study",
        description: "Review essential arrays, hashing, and sliding window strategies. Implement 2 Easy and 1 Medium difficulty questions without hints.",
        duration: "3 hours",
        deliverable: "Clean implementations documented on your technical dashboard."
      },
      {
        day: 7,
        title: "Draft Primary Project Architecture",
        category: "Portfolio",
        description: `Brainstorm a unique capstone project focusing on ${targetRole} duties using ${primarySkill} as the foundational framework.`,
        duration: "3 hours",
        deliverable: "System architecture diagram, data flow diagram, and README layout."
      },
      {
        day: 8,
        title: "Build Capstone Project Repository",
        category: "Portfolio",
        description: "Initialize a standard GitHub repository with high-quality README, setup instructions, license, and initial environment scripts.",
        duration: "3 hours",
        deliverable: "Active GitHub link with standard repository assets and initial commit."
      },
      {
        day: 9,
        title: "Outreach Phase 1: Alumni Messages",
        category: "Outreach",
        description: "Send personalized connection requests with short, conversational messages to the first 5 professionals compiled on your ledger.",
        duration: "2 hours",
        deliverable: "5 active personalized outreach invitations dispatched."
      },
      {
        day: 10,
        title: "Two-pointer & Linked List Mastery",
        category: "Study",
        description: "Master two-pointer navigation patterns, reverse lists, cycle detection, and merging techniques. Solve 3 standard challenges.",
        duration: "3.5 hours",
        deliverable: "Successfully passing LeetCode test constraints and saving source files."
      },
      {
        day: 11,
        title: "Develop Core Capstone Features",
        category: "Portfolio",
        description: `Implement the primary CRUD controllers, schema layout, and essential logic handlers for your ${primarySkill} project.`,
        duration: "4 hours",
        deliverable: "Operational core server/engine running locally."
      },
      {
        day: 12,
        title: "Configure API Mock Integrations",
        category: "Portfolio",
        description: "Integrate a real-world API or a mock endpoint layer (e.g. JSON placeholder, weather, maps) to bring live dynamic data to your capstone project.",
        duration: "3.5 hours",
        deliverable: "Dynamic data rendered cleanly on the system terminal or UI."
      },
      {
        day: 13,
        title: "Outreach Phase 2: Warm Follow-ups",
        category: "Outreach",
        description: "Check LinkedIn response rates. For any accepted requests, propose a brief 10-minute coffee chat asking about target-role preparation.",
        duration: "2 hours",
        deliverable: "Successfully schedule at least 1 informal mentoring or coffee chat."
      },
      {
        day: 14,
        title: "Binary Trees & BST Navigation",
        category: "Study",
        description: "Study Depth First Search (DFS) and Breadth First Search (BFS) recursive models. Solve 2 medium BST pathfinding challenges.",
        duration: "4 hours",
        deliverable: "Document tree traversal algorithms in your study hub."
      },
      {
        day: 15,
        title: "Perform Mid-way Calendar Sync",
        category: "Application",
        description: `Review current local recruitment postings for junior/associate ${targetRole} positions. Save 5 live postings that align with your stack.`,
        duration: "2 hours",
        deliverable: "5 target job URLs compiled with specific tailoring outlines."
      },
      {
        day: 16,
        title: "Perfect Project Styling & Handling",
        category: "Portfolio",
        description: "Add robust error-handling states, loading indicators, styling, and basic responsive behavior to your capstone project draft.",
        duration: "4 hours",
        deliverable: "Fully styled web/system view with zero console warnings."
      },
      {
        day: 17,
        title: "Deploy Capstone Portfolio Asset",
        category: "Portfolio",
        description: "Deploy the frontend/backend to a cloud container platform (e.g., Vercel, Netlify, Render, Cloud Run) and verify operational readiness.",
        duration: "3 hours",
        deliverable: "Live URL link added to the main GitHub README file."
      },
      {
        day: 18,
        title: "System Design Essentials",
        category: "Study",
        description: "Study basic load balancers, caching strategies, horizontal vs vertical scaling, and microservice basics for modern web applications.",
        duration: "3 hours",
        deliverable: "1-page summary chart on distributed system fundamentals."
      },
      {
        day: 19,
        title: "Mock Interview Round: Technical",
        category: "Study",
        description: `Practice answering high-intensity technical questions focusing on ${primarySkill} and core design patterns.`,
        duration: "2.5 hours",
        deliverable: "Evaluate responses using real-time simulation tools."
      },
      {
        day: 20,
        title: "Submit Application Wave 1",
        category: "Application",
        description: `Customize your optimized resume for the first 3 job postings compiled on Day 15 and submit formal applications.`,
        duration: "3 hours",
        deliverable: "3 verified job submissions with application confirmations."
      },
      {
        day: 21,
        title: "Behavioral Star Formula Grid",
        category: "Study",
        description: "Write down 5 concrete professional or academic stories formatted precisely in Situation, Task, Action, and Result (STAR) formulas.",
        duration: "3 hours",
        deliverable: "A comprehensive cheat-sheet of behavioral narratives."
      },
      {
        day: 22,
        title: "Outreach Wave 3: Hiring Managers",
        category: "Outreach",
        description: `Identify recruiters or hiring managers listing ${targetRole} openings at target companies. Craft a high-impact cold intro pitch.`,
        duration: "2 hours",
        deliverable: "5 high-conversion pitches sent directly via LinkedIn or email."
      },
      {
        day: 23,
        title: "Dynamic Programming Foundations",
        category: "Study",
        description: "Understand recursion memoization vs tabular approaches. Solve Fibonacci variants, grid travelers, and subset sum fundamentals.",
        duration: "4 hours",
        deliverable: "2 classic DP solutions written out with space/time analysis."
      },
      {
        day: 24,
        title: "Conduct Live Mock Interview",
        category: "Study",
        description: "Practice vocal responses under pressure. Set a 45-minute countdown and answer 5 random intermediate questions out loud.",
        duration: "2 hours",
        deliverable: "Speech analysis report evaluating filler-words and sentiment."
      },
      {
        day: 25,
        title: "Polishing Technical Case Studies",
        category: "Portfolio",
        description: "Refine your GitHub profile. Pin your top 2 capstone projects, add elegant descriptions, and write brief, easy-to-digest case studies.",
        duration: "3.5 hours",
        deliverable: "A pristine GitHub profile page targeting recruiters."
      },
      {
        day: 26,
        title: "Submit Application Wave 2",
        category: "Application",
        description: "Submit 5 additional applications to active postings, adapting keywords in your cover letter and experience sections.",
        duration: "3 hours",
        deliverable: "5 completed application dashboard statuses."
      },
      {
        day: 27,
        title: "Aptitude & Logical Reasoning Sprint",
        category: "Study",
        description: "Review common quantitative pattern puzzles, logical sequence questions, and probability matrices used in screening tests.",
        duration: "2 hours",
        deliverable: "1 conceptual practice sheet with solved exercises."
      },
      {
        day: 28,
        title: "Outreach Wave 4: Referral Solicit",
        category: "Outreach",
        description: "Engage warm connections established in earlier weeks. Respectfully ask if they'd be comfortable referring you to relevant listings.",
        duration: "2 hours",
        deliverable: "Secure at least 1 direct internal referral lead."
      },
      {
        day: 29,
        title: "Final Interview Polish & Drills",
        category: "Study",
        description: "Simulate a mock behavioral interview panel using your STAR stories. Review system design architectures and core technical traps.",
        duration: "3 hours",
        deliverable: "Full physical check, workspace camera setting setup, and audio check."
      },
      {
        day: 30,
        title: "Strategy Audit & Launch Plan",
        category: "Application",
        description: "Review response rates, follow-ups, and calendar invitations. Map out your next 30 days of active pipeline tracking.",
        duration: "2 hours",
        deliverable: "Updated active pipeline spreadsheet with future action dates."
      }
    ];

    const baseScheduleWithGaps = baseSchedule.map(task => ({
      ...task,
      skillGaps: task.skillGaps || getGapsForTask(task.day, task.category)
    }));

    setTasks(baseScheduleWithGaps);
    localStorage.setItem(`placement_schedule_${profile.name}`, JSON.stringify(baseScheduleWithGaps));
    setSelectedTask(baseScheduleWithGaps[0]);
  }, [profile]);

  const saveTasks = (updatedTasks: CalendarTask[]) => {
    setTasks(updatedTasks);
    localStorage.setItem(`placement_schedule_${profile.name}`, JSON.stringify(updatedTasks));
    if (selectedTask) {
      const currentSelected = updatedTasks.find(t => t.day === selectedTask.day);
      if (currentSelected) {
        setSelectedTask(currentSelected);
      }
    }
  };

  const handleToggleComplete = (day: number) => {
    const updated = tasks.map(t => {
      if (t.day === day) {
        return { ...t, isCompleted: !t.isCompleted };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Compile tasks into standard client-side .ics (iCalendar) payload for download
  const handleExportICS = () => {
    const today = new Date();
    
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VORYNEXA//Tactical Placement Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    // Add study/application planner events
    tasks.forEach(task => {
      const taskDate = new Date();
      taskDate.setDate(today.getDate() + (task.day - 1));
      
      const year = taskDate.getFullYear();
      const month = String(taskDate.getMonth() + 1).padStart(2, '0');
      const day = String(taskDate.getDate()).padStart(2, '0');
      
      const dateStr = `${year}${month}${day}`;
      const gapsStr = task.skillGaps ? task.skillGaps.join(', ') : '';

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:placementos-day-${task.day}-${profile.name.replace(/\s+/g, '-')}-${Date.now()}@placementos.com`,
        `DTSTAMP:${year}${month}${day}T090000Z`,
        `DTSTART;VALUE=DATE:${dateStr}`,
        `DTEND;VALUE=DATE:${dateStr}`,
        `SUMMARY:VORYNEXA Day ${task.day}: ${task.title}`,
        `DESCRIPTION:${task.description.replace(/,/g, '\\,')}\\n\\nDuration: ${task.duration}\\nDeliverable: ${task.deliverable.replace(/,/g, '\\,')}\\nRequired Skill Gaps: ${gapsStr.replace(/,/g, '\\,')}`,
        `CATEGORIES:${task.category}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    // Add application deadline events
    deadlines.forEach(dl => {
      const dateParts = dl.date.split('-');
      if (dateParts.length === 3) {
        const dateStr = dateParts.join('');
        icsContent.push(
          "BEGIN:VEVENT",
          `UID:placementos-deadline-${dl.id}-${profile.name.replace(/\s+/g, '-')}-${Date.now()}@placementos.com`,
          `DTSTAMP:${dateStr}T090000Z`,
          `DTSTART;VALUE=DATE:${dateStr}`,
          `DTEND;VALUE=DATE:${dateStr}`,
          `SUMMARY:🔴 DEADLINE: Apply to ${dl.company} (${dl.role})`,
          `DESCRIPTION:Critical Application Deadline!\\n\\nRequired Skill Gaps to Address: ${dl.skillGaps.join(', ').replace(/,/g, '\\,')}`,
          `CATEGORIES:Placement Deadline`,
          "STATUS:CONFIRMED",
          "END:VEVENT"
        );
      }
    });

    icsContent.push("END:VCALENDAR");

    const fullIcsString = icsContent.join("\r\n");
    const blob = new Blob([fullIcsString], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `VORYNEXA_30_Day_Schedule_${profile.name.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = filterCategory === "All" || task.category === filterCategory;
    const matchesStatus = filterStatus === "All" || 
      (filterStatus === "Completed" && task.isCompleted) || 
      (filterStatus === "Pending" && !task.isCompleted);
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.deliverable.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Study":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Application":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "Outreach":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Portfolio":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      default:
        return "text-white/60 bg-white/5 border-white/10";
    }
  };

  return (
    <div id="placement-schedule-container" className="space-y-8">
      {/* Premium Header Dashboard */}
      <div className="bg-[#111] p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono">
              <Sparkles className="w-3 h-3 animate-pulse" /> 30-Day Tactical Campaign Planner
            </div>
            <h2 id="schedule-heading" className="text-xl md:text-2xl font-black text-white">
              Tactical Study & Application Schedule
            </h2>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              Based on your target deadline (<strong className="text-white">{profile.placementDeadline || "Not Specifed"}</strong>) and target stack, we've dynamically generated a day-by-day action map to optimize technical readiness, construct capstone assets, and execute targeted outreach.
            </p>
          </div>

          <button
            onClick={() => {
              handleExportICS();
              setShowSyncInstructions(true);
            }}
            id="btn-sync-calendar"
            className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 shrink-0 animate-pulse"
          >
            <CalendarDays className="w-4 h-4" /> Sync with Google Calendar
          </button>
        </div>

        {/* Progress Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/10 mt-6 pt-6">
          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block font-mono">Campaign Progress</span>
              <span className="text-2xl font-extrabold text-white font-mono">{progressPercent}%</span>
            </div>
            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block font-mono">Tasks Completed</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{completedCount} <span className="text-white/40 text-sm">/ {tasks.length}</span></span>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500/20" />
          </div>

          <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block font-mono">Target Deadline</span>
              <span className="text-sm font-extrabold text-white truncate font-mono block max-w-[150px]">{profile.placementDeadline || "Immediate Target"}</span>
            </div>
            <Clock className="w-8 h-8 text-white/10" />
          </div>
        </div>
      </div>

      {/* DEADLINE NOTIFICATION AND ACTIVE APPLICATION TRACKER */}
      {(() => {
        const urgentCount = deadlines.filter(d => {
          const rem = getDaysRemaining(d.date);
          return rem >= 0 && rem <= 7;
        }).length;

        return (
          <div className="space-y-4">
            {urgentCount > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <p className="text-xs text-rose-300 font-medium leading-relaxed">
                  <strong className="font-black">CRITICAL ALERTS:</strong> You have {urgentCount} high-priority placement applications closing within 7 days! Prepare to bridge your required skill gaps immediately.
                </p>
              </div>
            )}

            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Placement Deadlines & Skill Gaps</h3>
                </div>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Application
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {deadlines.map(dl => {
                  const daysLeft = getDaysRemaining(dl.date);
                  const isUrgent = daysLeft >= 0 && daysLeft <= 7;
                  return (
                    <div
                      key={dl.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative ${
                        isUrgent 
                          ? "bg-rose-500/[0.03] border-rose-500/30 shadow-md shadow-rose-500/5" 
                          : "bg-black/20 border-white/5"
                      }`}
                    >
                      {isUrgent && (
                        <span className="absolute -top-2 -right-1 px-2 py-0.5 bg-rose-500 text-black text-[8px] font-black uppercase tracking-wider rounded-full shadow font-mono animate-pulse">
                          Urgent ({daysLeft}d left)
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-extrabold text-white">{dl.company}</h4>
                            <p className="text-[10px] text-white/50 font-medium">{dl.role}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteDeadline(dl.id)}
                            className="text-white/30 hover:text-rose-400 p-1 rounded hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
                            title="Delete Tracker"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/30 uppercase tracking-widest font-mono block">Required Skill Gaps</span>
                          <div className="flex flex-wrap gap-1">
                            {dl.skillGaps.map((gap, idx) => (
                              <span key={idx} className="text-[9px] bg-white/5 border border-white/5 text-white/70 px-1.5 py-0.5 rounded font-mono">
                                {gap}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono font-bold">
                        <span className="text-white/40">CLOSES: {dl.date}</span>
                        <span className={isUrgent ? "text-rose-400 animate-pulse" : "text-emerald-400"}>
                          {daysLeft < 0 ? "PASSED" : daysLeft === 0 ? "TODAY" : `${daysLeft} DAYS REMAINING`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Control Toolbar */}
      <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 md:flex-none md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search schedule tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 border border-white/10 rounded-lg text-white bg-black/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/20 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-black/30 border border-white/10 rounded-lg p-1">
            {["All", "Study", "Application", "Outreach", "Portfolio"].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  filterCategory === cat 
                    ? "bg-white/10 text-white" 
                    : "text-white/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer font-bold font-mono"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed Only</option>
            <option value="Pending">Pending Only</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-black/30 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase font-mono tracking-wider transition-colors cursor-pointer ${
                viewMode === "list" ? "bg-emerald-500 text-black" : "text-white/60 hover:text-white"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View / List View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Day Map (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-[#111]/40 border border-white/5 py-16 text-center rounded-2xl">
              <Calendar className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white/80 font-mono">No Matching Scheduled Activities</h4>
              <p className="text-xs text-white/40 max-w-sm mx-auto mt-1">Try relaxing your search terms or selecting different filters.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {filteredTasks.map((task) => {
                const isDragOver = dragOverDay === task.day;
                const isStudyTask = task.category === "Study";
                
                return (
                  <div
                    key={task.day}
                    draggable={isStudyTask}
                    onDragStart={(e) => handleDragStart(e, task.day)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, task.day)}
                    onDrop={(e) => handleDrop(e, task.day)}
                    id={`schedule-day-${task.day}`}
                    onClick={() => setSelectedTask(task)}
                    className={`group relative p-3.5 bg-gradient-to-b text-left rounded-xl border transition-all duration-300 min-h-[110px] flex flex-col justify-between cursor-pointer ${
                      selectedTask?.day === task.day
                        ? "from-[#1b2a1e] to-black border-emerald-500/80 shadow-md shadow-emerald-500/10 scale-[1.03] z-10"
                        : "from-[#111] to-black border-white/5 hover:border-white/20 hover:scale-[1.02]"
                    } ${
                      isDragOver ? "border-dashed border-emerald-400 bg-emerald-500/15 scale-[1.05]" : ""
                    } ${
                      isStudyTask ? "hover:shadow-lg hover:shadow-blue-500/5 cursor-grab active:cursor-grabbing" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-[10px] font-black font-mono text-white/30">DAY {task.day}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(task.day);
                        }}
                        className="p-0.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/20 hover:text-white/40" />
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-2.5">
                      <p className={`text-[10px] font-black truncate text-white leading-normal ${task.isCompleted ? "line-through text-white/30" : ""}`}>
                        {task.title}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`inline-block text-[8px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                        {isStudyTask && (
                          <span className="text-[8px] text-white/30 font-mono font-bold uppercase tracking-widest hidden group-hover:inline">
                            Drag
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rich css hover tooltip for skill gaps */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black/95 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 text-left space-y-2 scale-95 group-hover:scale-100">
                      <div className="flex items-center gap-1">
                        <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Bridge Skill Gaps</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {task.skillGaps && task.skillGaps.length > 0 ? (
                          task.skillGaps.map((gap, gIdx) => (
                            <span key={gIdx} className="text-[10px] text-white/80 leading-snug">
                              • {gap}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-white/40 italic">No specific skill gaps</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isDragOver = dragOverDay === task.day;
                const isStudyTask = task.category === "Study";

                return (
                  <div
                    key={task.day}
                    draggable={isStudyTask}
                    onDragStart={(e) => handleDragStart(e, task.day)}
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, task.day)}
                    onDrop={(e) => handleDrop(e, task.day)}
                    id={`schedule-list-day-${task.day}`}
                    onClick={() => setSelectedTask(task)}
                    className={`group relative p-4 bg-gradient-to-r rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${
                      selectedTask?.day === task.day
                        ? "from-[#15251a] to-black border-emerald-500/60"
                        : "from-[#111] to-black border-white/5 hover:border-white/15"
                    } ${
                      isDragOver ? "border-dashed border-emerald-400 bg-emerald-500/10 scale-[1.02]" : ""
                    } ${
                      isStudyTask ? "cursor-grab active:cursor-grabbing" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleComplete(task.day);
                        }}
                        className="p-1 rounded-md hover:bg-white/5 shrink-0 bg-transparent border-none cursor-pointer animate-none"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-white/20" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold font-mono text-emerald-400">DAY {task.day}</span>
                          <span className={`text-[8px] font-black font-mono uppercase tracking-wider px-1.5 border rounded ${getCategoryColor(task.category)}`}>
                            {task.category}
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold text-white mt-0.5 truncate ${task.isCompleted ? "line-through text-white/30" : ""}`}>
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-mono text-white/40 block">{task.duration}</span>
                      <ChevronRight className="w-4 h-4 text-white/30" />
                    </div>

                    {/* Rich css hover tooltip for list items */}
                    <div className="absolute bottom-full right-4 mb-2 w-48 p-3 bg-black/95 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 text-left space-y-2 scale-95 group-hover:scale-100">
                      <div className="flex items-center gap-1">
                        <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest font-mono">Bridge Skill Gaps</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {task.skillGaps && task.skillGaps.length > 0 ? (
                          task.skillGaps.map((gap, gIdx) => (
                            <span key={gIdx} className="text-[10px] text-white/80 leading-snug">
                              • {gap}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-white/40 italic">No specific skill gaps</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel (Right column) */}
        <div className="lg:col-span-1">
          {selectedTask ? (
            <div id="schedule-detail-card" className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6 sticky top-4">
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono text-emerald-400">DAY {selectedTask.day} ACTIVITY</span>
                    <span className={`text-[9px] font-black font-mono uppercase tracking-wider px-2 py-0.5 border rounded ${getCategoryColor(selectedTask.category)}`}>
                      {selectedTask.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-1.5 leading-snug">{selectedTask.title}</h3>
                </div>
                <button
                  onClick={() => handleToggleComplete(selectedTask.day)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    selectedTask.isCompleted 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white/85"
                  }`}
                  title={selectedTask.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block font-mono">Tactical Objective</span>
                  <p className="text-xs text-white/80 leading-relaxed font-medium">
                    {selectedTask.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-white/5 py-4">
                  <div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-mono">Suggested Investment</span>
                    <div className="flex items-center gap-1.5 text-xs text-white/90 font-bold mt-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedTask.duration}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest block font-mono">Activity Focus</span>
                    <div className="flex items-center gap-1.5 text-xs text-white/90 font-bold mt-1">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{selectedTask.category} Track</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Required Deliverable</span>
                  </div>
                  <p className="text-xs text-white/90 font-medium leading-relaxed italic">
                    "{selectedTask.deliverable}"
                  </p>
                </div>

                {selectedTask.skillGaps && selectedTask.skillGaps.length > 0 && (
                  <div className="p-4 bg-black/20 border border-white/5 rounded-xl space-y-2.5">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Award className="w-4 h-4 shrink-0" />
                      <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Target Skill Gaps Addressed</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTask.skillGaps.map((gap, idx) => (
                        <span key={idx} className="text-[9px] bg-white/5 border border-white/10 text-white/80 px-2 py-1 rounded font-mono">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-[#1a1a1a]/40 p-4 border border-white/5 rounded-xl flex items-center justify-between text-[11px] font-medium text-white/50">
                <span className="font-mono">Day Status: {selectedTask.isCompleted ? "SUCCESSFUL" : "IN PROGRESS"}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${selectedTask.isCompleted ? "bg-emerald-500 animate-pulse" : "bg-white/25"}`} />
              </div>
            </div>
          ) : (
            <div className="bg-black/20 border border-dashed border-white/10 rounded-2xl p-8 text-center py-24 text-white/30 space-y-2">
              <Calendar className="w-10 h-10 text-white/10 mx-auto" />
              <h4 className="font-bold text-white/80 text-xs uppercase tracking-wider font-mono">No Selected Activity</h4>
              <p className="text-[11px] text-white/60 max-w-[200px] mx-auto leading-relaxed">
                Click on any calendar day or list item to load structural tactics, recommended timelines, and specific objectives.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ADD CUSTOM PLACEMENT DEADLINE MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form 
            onSubmit={handleAddDeadline}
            className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl relative"
          >
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all cursor-pointer bg-transparent border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-emerald-400" /> Add Application Deadline
              </h3>
              <p className="text-[11px] text-white/40">
                Register a new recruitment milestone to enable real-time warning alerts and targeted gap visualizations.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block font-mono">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google, Stripe, Meta"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block font-mono">Target Role / Position</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend SDE-1"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block font-mono">Application Deadline Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block font-mono">Required Skill Gaps (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Tree Algorithms, System Design"
                  value={newGaps}
                  onChange={(e) => setNewGaps(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-white/20"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-colors cursor-pointer border-none"
              >
                Add Deadline
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GOOGLE CALENDAR SYNC INSTRUCTIONS MODAL */}
      {showSyncInstructions && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setShowSyncInstructions(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all cursor-pointer bg-transparent border-none"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CalendarDays className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-lg font-black text-white">Google Calendar Synchronizer</h3>
              <p className="text-xs text-white/50 leading-relaxed max-w-sm mx-auto">
                Your tactical 30-day placement schedule and deadlines have been compiled and downloaded as an <strong>.ics</strong> file. Follow these steps to sync with Google Calendar:
              </p>
            </div>

            <div className="space-y-4 border-y border-white/5 py-4">
              {[
                "Open calendar.google.com in your web browser.",
                "In the top right, click the Gear Icon and select Settings.",
                "On the left navigation list, click Import & export.",
                "Click Select file from your computer and upload the downloaded .ics file.",
                "Select your target calendar, then click the Import button."
              ].map((step, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs text-white/80">
                  <span className="w-5 h-5 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-emerald-400 shrink-0">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed font-medium">{step}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowSyncInstructions(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer border-none"
              >
                Close Instructions
              </button>
              <a
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-lg transition-colors cursor-pointer"
              >
                Open Google Calendar <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
