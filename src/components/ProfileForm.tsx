import React, { useState, useEffect } from "react";
import { StudentProfile, HRProfileAnalysis } from "../types";
import { DEFAULT_STUDENT_PROFILE } from "../lib/defaultProfile";
import { User, GraduationCap, Code, Briefcase, HelpCircle, Save, RotateCcw, Plus, X, Shield, Eye, EyeOff, RefreshCw, CheckCircle, Clock } from "lucide-react";

const maskValue = (value: string, type: "name" | "email" | "phone" | "url") => {
  if (!value) return "";
  switch (type) {
    case "email": {
      const [local, domain] = value.split("@");
      if (!domain) return "*****";
      if (local.length <= 2) return `${local[0] || ""}***@${domain}`;
      return `${local.substring(0, 2)}***${local[local.length - 1]}@${domain}`;
    }
    case "phone": {
      if (value.length <= 4) return "****";
      return `${value.substring(0, value.length - 4).replace(/\d/g, "*")}${value.substring(value.length - 4)}`;
    }
    case "url": {
      try {
        const url = new URL(value);
        const paths = url.pathname.split("/");
        const maskedPath = paths.map((p, i) => {
          if (i === 0 || !p) return p;
          return p.substring(0, Math.min(2, p.length)) + "*".repeat(Math.max(3, p.length - 2));
        }).join("/");
        return `${url.origin}${maskedPath}`;
      } catch {
        if (value.length <= 15) return "****************";
        return `${value.substring(0, 15)}*******`;
      }
    }
    case "name": {
      const parts = value.split(" ");
      return parts.map(part => {
        if (part.length <= 2) return (part[0] || "") + "*";
        return (part[0] || "") + "*".repeat(part.length - 2) + (part[part.length - 1] || "");
      }).join(" ");
    }
    default:
      return value;
  }
};

interface ProfileFormProps {
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => void;
  onAutoSave?: (updated: StudentProfile) => Promise<void> | void;
  hrAnalysis?: HRProfileAnalysis | null;
}

export default function ProfileForm({ profile, onSave, onAutoSave, hrAnalysis }: ProfileFormProps) {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [techInput, setTechInput] = useState("");
  const [nonTechInput, setNonTechInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [companyInput] = useState("");
  const [isMasked, setIsMasked] = useState<boolean>(false);

  // Auto-Save Mechanism: triggers debounced save every 5 seconds when formData changes
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);
  const lastSavedRef = React.useRef<string>(JSON.stringify(profile));

  // Sync formData if initial profile prop updates externally
  useEffect(() => {
    const propJson = JSON.stringify(profile);
    if (propJson !== lastSavedRef.current && JSON.stringify(formData) === lastSavedRef.current) {
      setFormData(profile);
      lastSavedRef.current = propJson;
    }
  }, [profile, formData]);

  useEffect(() => {
    const currentJson = JSON.stringify(formData);
    if (currentJson === lastSavedRef.current) return;

    setAutoSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        if (onAutoSave) {
          await onAutoSave(formData);
        } else {
          await onSave(formData);
        }
        lastSavedRef.current = currentJson;
        setAutoSaveStatus("saved");
        setLastSaveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (err) {
        console.warn("Profile auto-save warning:", err);
        setAutoSaveStatus("idle");
      }
    }, 5000); // 5-second debounced auto-save to Supabase/database

    return () => clearTimeout(timer);
  }, [formData, onSave, onAutoSave]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTech = () => {
    if (techInput.trim() && !formData.technicalSkills.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const handleRemoveTech = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((s) => s !== skill),
    }));
  };

  const handleAddNonTech = () => {
    if (nonTechInput.trim() && !formData.nonTechnicalSkills.includes(nonTechInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        nonTechnicalSkills: [...prev.nonTechnicalSkills, nonTechInput.trim()],
      }));
      setNonTechInput("");
    }
  };

  const handleRemoveNonTech = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      nonTechnicalSkills: prev.nonTechnicalSkills.filter((s) => s !== skill),
    }));
  };

  const handleAddRole = () => {
    if (roleInput.trim() && !formData.targetRoles.includes(roleInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        targetRoles: [...prev.targetRoles, roleInput.trim()],
      }));
      setRoleInput("");
    }
  };

  const handleRemoveRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.filter((r) => r !== role),
    }));
  };

  const handleAddCompany = (companyName: string) => {
    if (companyName.trim() && !formData.targetCompanies.includes(companyName.trim())) {
      setFormData((prev) => ({
        ...prev,
        targetCompanies: [...prev.targetCompanies, companyName.trim()],
      }));
    }
  };

  const handleRemoveCompany = (company: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCompanies: prev.targetCompanies.filter((c) => c !== company),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleResetToDefault = () => {
    setFormData(DEFAULT_STUDENT_PROFILE);
  };

  return (
    <form id="profile-setup-form" onSubmit={handleSubmit} className="space-y-8 bg-[#111] p-6 md:p-8 rounded-xl border border-white/10 shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-5 gap-4">
        <div>
          <h2 id="profile-heading" className="text-xl font-black text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            Student Profile Blueprint
          </h2>
          <p className="text-xs text-white/60 mt-1">Configure your academic standing, career aspirations, and profile variables.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto-Save Status Badge (5s Debounced Supabase Sync) */}
          {autoSaveStatus === "saving" ? (
            <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-saving to Supabase...
            </span>
          ) : autoSaveStatus === "saved" ? (
            <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-xl flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Auto-saved {lastSaveTime ? `at ${lastSaveTime}` : ""}
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 text-xs font-mono font-medium rounded-xl flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400/80" /> Auto-save active (5s sync)
            </span>
          )}

          {/* Sensitive Data Masking Toggle */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-xl">
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={isMasked} 
                onChange={() => setIsMasked(!isMasked)} 
                className="sr-only peer" 
              />
              <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className="ml-2 text-[11px] font-bold text-white/95 font-mono flex items-center gap-1.5">
                {isMasked ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Confidential Mode (Masked)
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-white/40" /> Standard View
                  </>
                )}
              </span>
            </label>
          </div>

          <button
            type="button"
            id="btn-reset-profile"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            Clear Fields
          </button>
          <button
            type="submit"
            id="btn-save-profile"
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-black text-black bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-all shadow-md shadow-emerald-500/10"
          >
            <Save className="w-3.5 h-3.5" />
            Update Co-Pilot
          </button>
        </div>
      </div>

      {/* Profile Setup Prompt Banner */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">📋 Fill In Your Actual Profile Details</h4>
          <p className="text-xs text-white/80 leading-relaxed">
            Please enter your actual academic records, technical skills, project details, and professional URLs below. 
            VORYNEXA will analyze this specific data to generate custom roadmaps, resume feedback, and interview sessions.
          </p>
        </div>
      </div>

      {/* Basic Info & College */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Personal & College Identity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={isMasked ? maskValue(formData.name, "name") : formData.name}
              onChange={handleInputChange}
              readOnly={isMasked}
              className={`w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${isMasked ? "opacity-75 cursor-not-allowed select-none" : ""}`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Email Address</label>
            <input
              type="email"
              name="email"
              value={isMasked ? maskValue(formData.email || "", "email") : formData.email || ""}
              onChange={handleInputChange}
              readOnly={isMasked}
              placeholder="student@example.com"
              className={`w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${isMasked ? "opacity-75 cursor-not-allowed select-none" : ""}`}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={isMasked ? maskValue(formData.phone || "", "phone") : formData.phone || ""}
              onChange={handleInputChange}
              readOnly={isMasked}
              placeholder="+1-555-0199"
              className={`w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${isMasked ? "opacity-75 cursor-not-allowed select-none" : ""}`}
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">College / University Name</label>
            <input
              type="text"
              name="college"
              required
              value={formData.college}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Degree (e.g., B.Tech, MBA, B.Sc)</label>
            <input
              type="text"
              name="degree"
              required
              value={formData.degree}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Branch / Major Specialization</label>
            <input
              type="text"
              name="branch"
              required
              value={formData.branch}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Current College Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="w-full text-sm bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            >
              <option value="1st Year" className="bg-[#111]">1st Year</option>
              <option value="2nd Year" className="bg-[#111]">2nd Year</option>
              <option value="3rd Year" className="bg-[#111]">3rd Year</option>
              <option value="Final Year (7th Sem)" className="bg-[#111]">Final Year (7th Sem)</option>
              <option value="Final Year (8th Sem)" className="bg-[#111]">Final Year (8th Sem)</option>
              <option value="Postgraduate (1st Year)" className="bg-[#111]">Postgraduate (1st Year)</option>
              <option value="Postgraduate (2nd Year)" className="bg-[#111]">Postgraduate (2nd Year)</option>
              <option value="Graduated / Passed Out" className="bg-[#111]">Graduated / Passed Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Academic Status & Location */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Academic History & Location</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">GPA / Score (e.g., 6.8/10, 75%)</label>
            <input
              type="text"
              name="gpa"
              required
              value={formData.gpa}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Active Backlogs</label>
            <select
              name="backlogs"
              value={formData.backlogs}
              onChange={handleInputChange}
              className="w-full text-sm bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            >
              <option value="None" className="bg-[#111]">None</option>
              <option value="1 Active Backlog" className="bg-[#111]">1 Active Backlog</option>
              <option value="2 Active Backlogs" className="bg-[#111]">2 Active Backlogs</option>
              <option value="3+ Active Backlogs" className="bg-[#111]">3+ Active Backlogs</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Current City & Country</label>
            <input
              type="text"
              name="location"
              required
              value={formData.location}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Preferred Work Locations</label>
            <input
              type="text"
              name="preferredLocation"
              required
              value={formData.preferredLocation}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Skills & Strengths */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Skills & Portfolio Assets</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tech Skills */}
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Technical Skills (Languages, software, tools)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. JavaScript, SQL, Excel"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                className="flex-1 text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddTech}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-black flex items-center gap-1 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 bg-black/20 border border-dashed border-white/10 rounded-lg">
              {formData.technicalSkills.length === 0 && (
                <span className="text-xs text-white/40 p-1 font-mono">No skills added yet</span>
              )}
              {formData.technicalSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 text-white border border-white/10 shadow-sm">
                  {skill}
                  <button type="button" onClick={() => handleRemoveTech(skill)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Non-Tech Skills */}
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Non-Technical / Soft Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={nonTechInput}
                onChange={(e) => setNonTechInput(e.target.value)}
                placeholder="e.g. Communication, Agile, Presentation"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNonTech())}
                className="flex-1 text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddNonTech}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-black flex items-center gap-1 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 bg-black/20 border border-dashed border-white/10 rounded-lg">
              {formData.nonTechnicalSkills.length === 0 && (
                <span className="text-xs text-white/40 p-1 font-mono">No skills added yet</span>
              )}
              {formData.nonTechnicalSkills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 text-white border border-white/10 shadow-sm">
                  {skill}
                  <button type="button" onClick={() => handleRemoveNonTech(skill)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Assets Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Resume Status</label>
            <input
              type="text"
              name="resumeStatus"
              value={formData.resumeStatus}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">LinkedIn Profile Status</label>
            <input
              type="text"
              name="linkedInStatus"
              value={formData.linkedInStatus}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Portfolio / Github Status</label>
            <input
              type="text"
              name="portfolioStatus"
              value={formData.portfolioStatus}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Projects, Internships, Extracurriculars */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Projects, Internships & Experiences</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Academic or Personal Projects (Describe briefly)</label>
            <textarea
              name="projects"
              rows={2}
              value={formData.projects}
              onChange={handleInputChange}
              placeholder="List major projects, technologies used, and outcomes."
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Internships (If any)</label>
              <input
                type="text"
                name="internships"
                value={formData.internships}
                onChange={handleInputChange}
                className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Certifications (If any)</label>
              <input
                type="text"
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Extracurriculars & Clubs</label>
              <input
                type="text"
                name="extracurriculars"
                value={formData.extracurriculars}
                onChange={handleInputChange}
                className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Profiles & Verification Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Code className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Verified Professional Profiles</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LinkedIn URL Input & Status */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 backdrop-blur-md">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 font-mono">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedinUrl"
                value={isMasked ? maskValue(formData.linkedinUrl || "", "url") : formData.linkedinUrl || ""}
                onChange={handleInputChange}
                readOnly={isMasked}
                placeholder="https://linkedin.com/in/username"
                className={`w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${isMasked ? "opacity-75 cursor-not-allowed select-none" : ""}`}
              />
            </div>
            
            {/* LinkedIn Verification status indicator */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-white/40 font-mono">Verification status:</span>
              {formData.linkedinUrl ? (
                hrAnalysis?.ratings?.linkedinCompleteness ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ✓ Verified ({hrAnalysis.ratings.linkedinCompleteness}/100 Score)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Audit Pending
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/40 border border-white/10 font-mono">
                  Link Missing
                </span>
              )}
            </div>
          </div>

          {/* GitHub URL Input & Status */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 backdrop-blur-md">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5 font-mono">GitHub Profile URL</label>
              <input
                type="url"
                name="githubUrl"
                value={isMasked ? maskValue(formData.githubUrl || "", "url") : formData.githubUrl || ""}
                onChange={handleInputChange}
                readOnly={isMasked}
                placeholder="https://github.com/username"
                className={`w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono ${isMasked ? "opacity-75 cursor-not-allowed select-none" : ""}`}
              />
            </div>

            {/* GitHub Verification status indicator */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-white/40 font-mono">Verification status:</span>
              {formData.githubUrl ? (
                hrAnalysis?.ratings?.githubActivity ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    ✓ Verified ({hrAnalysis.ratings.githubActivity}/100 Score)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Audit Pending
                  </span>
                )
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-white/40 border border-white/10 font-mono">
                  Link Missing
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Target Aspirations & Constraints */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Targets, Aspirations & Personal Gaps</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Roles */}
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Target Job Roles</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="e.g. SDE-1, Digital Marketer, Consultant"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRole())}
                className="flex-1 text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={handleAddRole}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-black flex items-center gap-1 transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 bg-black/20 border border-dashed border-white/10 rounded-lg">
              {formData.targetRoles.length === 0 && (
                <span className="text-xs text-white/40 p-1 font-mono">No target roles specified</span>
              )}
              {formData.targetRoles.map((role) => (
                <span key={role} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 text-white border border-white/10 shadow-sm">
                  {role}
                  <button type="button" onClick={() => handleRemoveRole(role)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Target Companies */}
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Target Companies (Type and press enter)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. TCS, Wipro, Google, Stripe"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCompany((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
                className="flex-1 text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 bg-black/20 border border-dashed border-white/10 rounded-lg">
              {formData.targetCompanies.length === 0 && (
                <span className="text-xs text-white/40 p-1 font-mono">No target companies specified</span>
              )}
              {formData.targetCompanies.map((company) => (
                <span key={company} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-white/5 text-white border border-white/10 shadow-sm">
                  {company}
                  <button type="button" onClick={() => handleRemoveCompany(company)} className="text-white/40 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Expected Salary Package</label>
            <input
              type="text"
              name="salaryExpectation"
              value={formData.salaryExpectation}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Work Mode Preference</label>
            <select
              name="workMode"
              value={formData.workMode}
              onChange={handleInputChange}
              className="w-full text-sm bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            >
              <option value="On-site" className="bg-[#111]">On-site</option>
              <option value="Hybrid" className="bg-[#111]">Hybrid</option>
              <option value="Remote" className="bg-[#111]">Remote</option>
              <option value="Any" className="bg-[#111]">Any</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Time Available Daily for Prep</label>
            <input
              type="text"
              name="timeAvailable"
              value={formData.timeAvailable}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Placement Deadline</label>
            <input
              type="text"
              name="placementDeadline"
              value={formData.placementDeadline}
              onChange={handleInputChange}
              className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Coding Proficiency Level</label>
            <select
              name="codingLevel"
              value={formData.codingLevel}
              onChange={handleInputChange}
              className="w-full text-sm bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            >
              <option value="None" className="bg-[#111]">None (Non-coding background)</option>
              <option value="Beginner" className="bg-[#111]">Beginner (Basic syntaxes, no solid DSA)</option>
              <option value="Intermediate" className="bg-[#111]">Intermediate (Moderate problems, some OOPs)</option>
              <option value="Advanced" className="bg-[#111]">Advanced (Strong competitive coding, LeetCode, DSA)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Communication Level (English)</label>
            <select
              name="communicationLevel"
              value={formData.communicationLevel}
              onChange={handleInputChange}
              className="w-full text-sm bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            >
              <option value="Beginner" className="bg-[#111]">Beginner (Heavy hesitation / shyness)</option>
              <option value="Intermediate" className="bg-[#111]">Intermediate (Can explain, gets interview anxiety)</option>
              <option value="Advanced" className="bg-[#111]">Advanced (Confident, highly fluent & professional)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Confidence Level</label>
            <select
              name="confidenceLevel"
              value={formData.confidenceLevel}
              onChange={handleInputChange}
              className="w-full text-sm bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            >
              <option value="Low" className="bg-[#111]">Low</option>
              <option value="Medium" className="bg-[#111]">Medium</option>
              <option value="High" className="bg-[#111]">High</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 font-mono">Special Constraints, Backlogs, or Gaps (Crucial for honest roadmap mapping)</label>
          <textarea
            name="constraints"
            rows={2}
            value={formData.constraints}
            onChange={handleInputChange}
            placeholder="e.g., GAP year, Active backlogs in specific papers, speaking anxiety, no PC access at hostel, etc."
            className="w-full text-sm bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10">
        <button
          type="submit"
          id="btn-save-profile-bottom"
          className="px-6 py-3 text-sm font-black text-black bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          Generate Personalized Placement Strategy
        </button>
      </div>
    </form>
  );
}
