import React, { useState } from "react";
import { RoadmapPlan, RoadmapTask, StudentProfile } from "../types";
import { 
  Calendar, CheckSquare, Clock, Award, Star, ListChecks, Play, 
  TrendingUp, Compass, ShieldCheck, Zap 
} from "lucide-react";

interface RoadmapViewProps {
  profile: StudentProfile;
  roadmap: RoadmapPlan | null;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

export default function RoadmapView({
  profile,
  roadmap,
  onGenerate,
  isGenerating,
}: RoadmapViewProps) {
  const [activeTab, setActiveTab] = useState<"7day" | "30day" | "90day">("7day");
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const toggleTask = (key: string) => {
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-white/5 text-white/60 border-white/10";
    }
  };

  const getActiveTasks = (): RoadmapTask[] => {
    if (!roadmap) return [];
    if (activeTab === "7day") return roadmap.plan7Day;
    if (activeTab === "30day") return roadmap.plan30Day;
    return roadmap.plan90Day;
  };

  const activeTasks = getActiveTasks();
  const totalTasksCount = activeTasks.length;
  const completedTasksCount = activeTasks.filter((_, idx) => completedTasks[`${activeTab}-${idx}`]).length;
  const completionPercentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-8">
      
      {/* Bento Main Layout Wrapper (Asymmetrical layout: 3cols lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Bento: Stats & Constraints Trackers */}
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          
          {/* Target constraints card */}
          <div className="bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex-1 flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300 hover:scale-[1.02]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-sm">Campaign Parameters</h3>
              </div>
              
              <div className="space-y-3.5">
                <div>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest font-mono block">Availability Rate</span>
                  <span className="text-sm font-black text-white mt-1 block">{profile.timeAvailable || "No value"} daily</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest font-mono block">Placement Deadline</span>
                  <span className="text-sm font-black text-emerald-400 mt-1 block">{profile.placementDeadline || "No deadline"}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest font-mono block">Placement Target Role</span>
                  <span className="text-sm font-black text-white/80 mt-1 block truncate">{profile.targetRoles?.[0] || "Target Role Needed"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/5 hover:shadow-emerald-500/20"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" /> Compiling Roadmap...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" /> Re-Calculate Roadmap
                </>
              )}
            </button>
          </div>

          {/* Dynamic Sprint Progress card */}
          {roadmap && (
            <div className="bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center hover:border-emerald-500/20 transition-all duration-300 hover:scale-[1.02]">
              <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-wider font-mono">Stage Progress index</span>
              
              {/* Circular percentage progress widget */}
              <div className="relative flex items-center justify-center my-5">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-white/5"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - completionPercentage / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white font-mono">{completionPercentage}%</span>
                  <span className="text-[9px] text-white/30 font-bold block uppercase font-mono">DONE</span>
                </div>
              </div>

              <div className="text-xs text-white/60 font-semibold">
                Completed <strong className="text-white">{completedTasksCount}</strong> out of <strong className="text-white">{totalTasksCount}</strong> tasks
              </div>
            </div>
          )}
        </div>

        {/* Right Bento: Tasks matrix */}
        <div className="lg:col-span-2 bg-[#111]/70 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl space-y-6 hover:border-emerald-500/20 transition-all duration-300 hover:scale-[1.01]">
          
          {/* Header & nav */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
              <ListChecks className="w-5 h-5 text-emerald-400" />
              <h3 className="font-extrabold text-white text-base tracking-tight">Timeline Task Checklist</h3>
            </div>

            {/* Timings Tab Controls */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 gap-1">
              <button
                onClick={() => setActiveTab("7day")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === "7day" ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white/80"
                }`}
              >
                7-Day Sprint
              </button>
              <button
                onClick={() => setActiveTab("30day")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === "30day" ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white/80"
                }`}
              >
                30-Day Deep-Dive
              </button>
              <button
                onClick={() => setActiveTab("90day")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === "90day" ? "bg-emerald-500 text-black" : "text-white/40 hover:text-white/80"
                }`}
              >
                90-Day Conversion
              </button>
            </div>
          </div>

          {/* Tasks Container */}
          {roadmap ? (
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {activeTasks.map((task, idx) => {
                const taskKey = `${activeTab}-${idx}`;
                const isDone = !!completedTasks[taskKey];

                return (
                  <div
                    key={idx}
                    className={`border rounded-xl p-4.5 flex items-start gap-4 transition-all duration-200 bg-black/35 hover:bg-black/50 ${
                      isDone ? "border-emerald-500/20 opacity-55" : "border-white/5"
                    }`}
                  >
                    <button
                      onClick={() => toggleTask(taskKey)}
                      className={`mt-0.5 flex items-center justify-center w-5.5 h-5.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-black"
                          : "border-white/20 bg-black/40 hover:border-emerald-500"
                      }`}
                    >
                      {isDone && <CheckSquare className="w-3.5 h-3.5 text-black stroke-[3px]" />}
                    </button>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">{task.dayOrWeek}</span>
                          <h4 className={`font-black text-white text-xs ${isDone ? "line-through text-white/30" : ""}`}>
                            {task.taskName}
                          </h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>

                      <p className="text-xs text-white/50 leading-relaxed font-semibold">{task.description}</p>
                    </div>
                  </div>
                );
              })}

              {activeTasks.length === 0 && (
                <div className="text-center py-10 text-white/40 text-xs font-mono">No tasks in this pipeline stage yet.</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-black/30 border border-dashed border-white/10 rounded-xl">
              <Clock className="w-10 h-10 text-emerald-400 mb-3 animate-pulse" />
              <h3 className="font-extrabold text-white text-sm font-mono">Generating Skill Diagnostics</h3>
              <p className="text-xs text-white/50 max-w-sm text-center mt-1 font-semibold leading-relaxed px-4">
                Click "Re-Calculate Roadmap" to compute the customized sprint goals and conversion matrices for your profile.
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
