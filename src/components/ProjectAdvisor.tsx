import React, { useState } from "react";
import { ProjectIdea, StudentProfile } from "../types";
import { FolderGit, RefreshCw, Sparkles, AlertCircle, Terminal, FileText, Check } from "lucide-react";

interface ProjectAdvisorProps {
  profile: StudentProfile;
  projects: ProjectIdea[] | null;
  onGenerate: (targetRole: string) => Promise<void>;
  isGenerating: boolean;
}

export default function ProjectAdvisor({
  profile,
  projects,
  onGenerate,
  isGenerating,
}: ProjectAdvisorProps) {
  const [selectedRole, setSelectedRole] = useState(profile.targetRoles?.[0] || "");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFetchProjects = () => {
    onGenerate(selectedRole);
  };

  const isCodingLevelLow = profile.codingLevel === "None" || profile.codingLevel === "Beginner";

  const projectList = Array.isArray(projects)
    ? projects
    : (Array.isArray((projects as any)?.projects)
        ? (projects as any).projects
        : (Array.isArray((projects as any)?.data) ? (projects as any).data : []));

  return (
    <div className="space-y-8">
      {/* Role selector card */}
      <div className="bg-[#111] border border-white/10 p-6 rounded-xl shadow-lg space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/20">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <FolderGit className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Resume Project Advisor</h3>
        </div>
        <p className="text-white/60 text-xs leading-relaxed">
          Select your target role and click below. VORYNEXA will generate resume-worthy projects tailored directly to your coding capability.
          {isCodingLevelLow && (
            <span className="block mt-2 font-mono text-[11px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded">
              💡 Detected Non-Coding / Beginner profile: Generating business plans, analytic case studies, or process optimization blueprints.
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-white/40 font-mono uppercase tracking-wider mb-1">Target Placement Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full text-sm border border-white/10 rounded-lg px-3 py-2 text-white bg-black/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {(profile.targetRoles || []).map((role) => (
                <option key={role} value={role} className="bg-[#111] text-white">
                  {role}
                </option>
              ))}
              {!(profile.targetRoles || []).includes(selectedRole) && selectedRole && (
                <option value={selectedRole} className="bg-[#111] text-white">{selectedRole}</option>
              )}
              {(profile.targetRoles || []).length === 0 && <option value="" className="bg-[#111] text-white">Select a target role</option>}
            </select>
          </div>
          <button
            onClick={handleFetchProjects}
            disabled={isGenerating || !selectedRole}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Drafting Projects...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Recommend Custom Projects
              </>
            )}
          </button>
        </div>
      </div>

      {projectList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projectList.map((project, idx) => (
            <div key={idx} className="bg-[#111] border border-white/10 rounded-xl p-6 shadow-lg flex flex-col justify-between space-y-6 transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  {isCodingLevelLow ? (
                    <FileText className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Terminal className="w-4 h-4 text-emerald-400" />
                  )}
                  <h4 className="font-bold text-white text-sm">{project.title}</h4>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest font-mono">Project Objective</span>
                  <p className="text-xs text-white/70 leading-relaxed">{project.objective}</p>
                </div>

                {/* Tech/Tools stacks */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest font-mono">Suggested Tools & Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(project.tools) ? project.tools : []).map((tool, tIdx) => (
                      <span key={tIdx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-medium">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverables checklist */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest font-mono">Key Project Deliverables</span>
                  <ul className="space-y-1">
                    {(Array.isArray(project.deliverables) ? project.deliverables : []).map((item, dIdx) => (
                      <li key={dIdx} className="text-xs text-white/70 leading-snug flex items-start gap-1.5">
                        <span className="text-emerald-500/60 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Resume Impact Line */}
              <div className="border-t border-white/5 pt-4 mt-4 bg-black/30 p-4 rounded-lg border border-dashed border-white/10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[9px] font-bold text-white/40 uppercase font-mono">Verbatim Resume Bullet Line</span>
                  <button
                    onClick={() => handleCopy(project.resumeImpact, idx)}
                    className="text-[10px] text-white/60 hover:text-emerald-400 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : "Copy line"}
                  </button>
                </div>
                <p className="text-xs text-white/90 italic font-medium leading-relaxed">
                  "{project.resumeImpact}"
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-[#111] border border-white/10 rounded-xl shadow-lg">
          <AlertCircle className="w-10 h-10 text-emerald-400 mb-3 animate-pulse" />
          <h3 className="font-bold text-white text-sm">No Projects Formulated Yet</h3>
          <p className="text-xs text-white/60 max-w-sm text-center mt-1">
            Click "Recommend Custom Projects" to formulate a tailored portfolio based on your target role.
          </p>
        </div>
      )}
    </div>
  );
}
