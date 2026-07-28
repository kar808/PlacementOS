import React, { useState } from "react";
import { StudentProfile } from "../types";
import { 
  User, GraduationCap, Code, Briefcase, HelpCircle, 
  ArrowLeft, ArrowRight, Sparkles, Plus, X, ListTodo, ShieldAlert, CheckCircle 
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (profile: StudentProfile) => void;
}

const INITIAL_FORM_STATE: StudentProfile = {
  name: "",
  college: "",
  degree: "",
  branch: "",
  year: "",
  gpa: "",
  backlogs: "",
  location: "",
  preferredLocation: "",
  technicalSkills: [],
  nonTechnicalSkills: [],
  projects: "",
  internships: "",
  certifications: "",
  extracurriculars: "",
  communicationLevel: "",
  careerGoals: "",
  targetRoles: [],
  targetCompanies: [],
  salaryExpectation: "",
  workMode: "",
  timeAvailable: "",
  placementDeadline: "",
  resumeStatus: "",
  linkedInStatus: "",
  portfolioStatus: "",
  codingLevel: "",
  confidenceLevel: "",
  constraints: "",
  linkedinUrl: "",
  githubUrl: ""
};

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_FORM_STATE);
  
  // Tag Inputs
  const [techInput, setTechInput] = useState("");
  const [nonTechInput, setNonTechInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");

  const totalSteps = 5;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTech = () => {
    if (techInput.trim() && !profile.technicalSkills.includes(techInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, techInput.trim()],
      }));
      setTechInput("");
    }
  };

  const handleRemoveTech = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((s) => s !== skill),
    }));
  };

  const handleAddNonTech = () => {
    if (nonTechInput.trim() && !profile.nonTechnicalSkills.includes(nonTechInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        nonTechnicalSkills: [...prev.nonTechnicalSkills, nonTechInput.trim()],
      }));
      setNonTechInput("");
    }
  };

  const handleRemoveNonTech = (skill: string) => {
    setProfile((prev) => ({
      ...prev,
      nonTechnicalSkills: prev.nonTechnicalSkills.filter((s) => s !== skill),
    }));
  };

  const handleAddRole = () => {
    if (roleInput.trim() && !profile.targetRoles.includes(roleInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        targetRoles: [...prev.targetRoles, roleInput.trim()],
      }));
      setRoleInput("");
    }
  };

  const handleRemoveRole = (role: string) => {
    setProfile((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.filter((r) => r !== role),
    }));
  };

  const handleAddCompany = () => {
    if (companyInput.trim() && !profile.targetCompanies.includes(companyInput.trim())) {
      setProfile((prev) => ({
        ...prev,
        targetCompanies: [...prev.targetCompanies, companyInput.trim()],
      }));
      setCompanyInput("");
    }
  };

  const handleRemoveCompany = (company: string) => {
    setProfile((prev) => ({
      ...prev,
      targetCompanies: prev.targetCompanies.filter((c) => c !== company),
    }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e7eb] flex flex-col items-center justify-center p-4">
      {/* Visual glowing backgrounds */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 space-y-8 backdrop-blur-md">
        
        {/* Header Stepper Progress */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 text-black px-2.5 py-1 font-black text-xs rounded uppercase tracking-wider">
                Step {step} of {totalSteps}
              </div>
              <span className="text-white/60 text-xs font-mono">Employability Profile Builder</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Premium Analytics
            </span>
          </div>

          {/* Graphical Progress Bar */}
          <div className="flex gap-1.5 h-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Form View */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Academic standing and Identity */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-white/10 pb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Academic Identity</h3>
                  <p className="text-xs text-white/50">Tell us who you are and where you are studying.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={profile.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe"
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">College / University</label>
                  <input
                    type="text"
                    name="college"
                    required
                    value={profile.college}
                    onChange={handleInputChange}
                    placeholder="e.g. Stanford University"
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Degree Name</label>
                  <input
                    type="text"
                    name="degree"
                    required
                    value={profile.degree}
                    onChange={handleInputChange}
                    placeholder="e.g. B.Tech / MBA / BS"
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Branch / Specialization</label>
                  <input
                    type="text"
                    name="branch"
                    required
                    value={profile.branch}
                    onChange={handleInputChange}
                    placeholder="e.g. Computer Science"
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Current Year / Sem</label>
                  <select
                    name="year"
                    value={profile.year}
                    onChange={handleInputChange}
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year (7th Sem)">Final Year (7th Sem)</option>
                    <option value="Final Year (8th Sem)">Final Year (8th Sem)</option>
                    <option value="Postgraduate (1st Year)">Postgraduate (1st Year)</option>
                    <option value="Postgraduate (2nd Year)">Postgraduate (2nd Year)</option>
                    <option value="Graduated">Graduated / Passed Out</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Current GPA / Grade Scale</label>
                  <input
                    type="text"
                    name="gpa"
                    required
                    value={profile.gpa}
                    onChange={handleInputChange}
                    placeholder="e.g. 7.8 / 10 or 3.6 / 4.0"
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Technical Skills & Coding Level */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-white/10 pb-3 flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Skills & Programming Mastery</h3>
                  <p className="text-xs text-white/50">Specify the technical and non-technical skills you possess.</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Tech Skills Tag Adder */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Technical Skills / Tools</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      placeholder="e.g. JavaScript, Python, SQL, Excel, Figma (Press Enter)"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTech())}
                      className="flex-1 text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddTech}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 bg-black/40 border border-white/5 rounded-xl mt-1.5">
                    {(profile.technicalSkills || []).length === 0 && (
                      <span className="text-xs text-white/25 p-1 font-mono italic">No technical skills added yet.</span>
                    )}
                    {(profile.technicalSkills || []).map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-white border border-white/10">
                        {skill}
                        <button type="button" onClick={() => handleRemoveTech(skill)} className="text-white/40 hover:text-rose-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Soft Skills Tag Adder */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Soft Skills / Core Strengths</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nonTechInput}
                      onChange={(e) => setNonTechInput(e.target.value)}
                      placeholder="e.g. Problem Solving, Presentation, Adaptability"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNonTech())}
                      className="flex-1 text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddNonTech}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 bg-black/40 border border-white/5 rounded-xl mt-1.5">
                    {(profile.nonTechnicalSkills || []).length === 0 && (
                      <span className="text-xs text-white/25 p-1 font-mono italic">No soft skills added yet.</span>
                    )}
                    {(profile.nonTechnicalSkills || []).map((skill) => (
                      <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-white/5 text-white border border-white/10">
                        {skill}
                        <button type="button" onClick={() => handleRemoveNonTech(skill)} className="text-white/40 hover:text-rose-400 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Coding Level Selection */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Coding Proficiency level</label>
                  <select
                    name="codingLevel"
                    value={profile.codingLevel}
                    onChange={handleInputChange}
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  >
                    <option value="None">None (Non-coding background)</option>
                    <option value="Beginner">Beginner (Basic syntaxes, no solid DSA/LeetCode)</option>
                    <option value="Intermediate">Intermediate (Can solve easy/medium LeetCode, some OOPs)</option>
                    <option value="Advanced">Advanced (Strong competitive coder, solid DSA mastery)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Projects, Internships & Achievements */}
          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-white/10 pb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Projects, Internships & Highlights</h3>
                  <p className="text-xs text-white/50">Enter the concrete projects and internships you have completed.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Personal or Academic Projects</label>
                  <textarea
                    name="projects"
                    rows={3}
                    required
                    value={profile.projects}
                    onChange={handleInputChange}
                    placeholder="Describe 1-2 major projects you built. E.g. Created a full-stack e-commerce store with Node.js and MongoDB; or a simple landing page with HTML/CSS."
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Prior Internships (Optional)</label>
                  <input
                    type="text"
                    name="internships"
                    value={profile.internships}
                    onChange={handleInputChange}
                    placeholder="e.g. None; or 3-month Software Intern at TechCorp"
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Certifications (Optional)</label>
                    <input
                      type="text"
                      name="certifications"
                      value={profile.certifications}
                      onChange={handleInputChange}
                      placeholder="e.g. AWS Cloud Practitioner"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Extracurricular Clubs / Leadership</label>
                    <input
                      type="text"
                      name="extracurriculars"
                      value={profile.extracurriculars}
                      onChange={handleInputChange}
                      placeholder="e.g. Cultural Fest Coordinator"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Career Goals, Expectations & Job Details */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-white/10 pb-3 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Career Aspirations</h3>
                  <p className="text-xs text-white/50">Define your target roles, target companies, and expectations.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Target Roles */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Target Roles</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value)}
                        placeholder="e.g. Software Engineer, Data Analyst"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddRole())}
                        className="flex-1 text-sm bg-black border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddRole}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5 p-1.5 bg-black/40 border border-white/5 rounded-xl">
                      {(profile.targetRoles || []).length === 0 && (
                        <span className="text-[10px] text-white/25 italic p-1 font-mono">No target roles specified.</span>
                      )}
                      {(profile.targetRoles || []).map((role) => (
                        <span key={role} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/5 text-white border border-white/10">
                          {role}
                          <button type="button" onClick={() => handleRemoveRole(role)} className="text-white/40 hover:text-rose-400">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Target Companies */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Target Companies</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={companyInput}
                        onChange={(e) => setCompanyInput(e.target.value)}
                        placeholder="e.g. Google, McKinsey, Tech Startups"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCompany())}
                        className="flex-1 text-sm bg-black border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddCompany}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-bold text-xs"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5 p-1.5 bg-black/40 border border-white/5 rounded-xl">
                      {(profile.targetCompanies || []).length === 0 && (
                        <span className="text-[10px] text-white/25 italic p-1 font-mono">No target companies specified.</span>
                      )}
                      {(profile.targetCompanies || []).map((c) => (
                        <span key={c} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/5 text-white border border-white/10">
                          {c}
                          <button type="button" onClick={() => handleRemoveCompany(c)} className="text-white/40 hover:text-rose-400">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Salary Expectations</label>
                    <input
                      type="text"
                      name="salaryExpectation"
                      required
                      value={profile.salaryExpectation}
                      onChange={handleInputChange}
                      placeholder="e.g. $80k - $100k or ₹6 - ₹8 LPA"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Work Location Preference</label>
                    <input
                      type="text"
                      name="preferredLocation"
                      required
                      value={profile.preferredLocation}
                      onChange={handleInputChange}
                      placeholder="e.g. New York, Remote, SF"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Placement Deadline</label>
                    <input
                      type="text"
                      name="placementDeadline"
                      required
                      value={profile.placementDeadline}
                      onChange={handleInputChange}
                      placeholder="e.g. 3 Months, 6 Months"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Overall Career Objectives</label>
                  <textarea
                    name="careerGoals"
                    rows={2}
                    required
                    value={profile.careerGoals}
                    onChange={handleInputChange}
                    placeholder="Wants to secure a highly promising entry-level backend role at a product tech startup..."
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Profiles Status & Gaps */}
          {step === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="border-b border-white/10 pb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-white text-base">Communication, Confidence & Constraints</h3>
                  <p className="text-xs text-white/50">Be completely honest. This will yield highly precise roadmaps.</p>
                </div>
              </div>

              <div className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Active Backlogs / Papers</label>
                    <select
                      name="backlogs"
                      value={profile.backlogs}
                      onChange={handleInputChange}
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    >
                      <option value="None">None</option>
                      <option value="1 Active Backlog">1 Active Backlog</option>
                      <option value="2 Active Backlogs">2 Active Backlogs</option>
                      <option value="3+ Active Backlogs">3+ Active Backlogs</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Current City & Country</label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={profile.location}
                      onChange={handleInputChange}
                      placeholder="e.g. San Jose, CA"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">English Communication Level</label>
                    <select
                      name="communicationLevel"
                      value={profile.communicationLevel}
                      onChange={handleInputChange}
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    >
                      <option value="Beginner">Beginner (Heavy hesitation / shyness)</option>
                      <option value="Intermediate">Intermediate (Can explain, gets interview anxiety)</option>
                      <option value="Advanced">Advanced (Confident, highly fluent & professional)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Interview Confidence level</label>
                    <select
                      name="confidenceLevel"
                      value={profile.confidenceLevel}
                      onChange={handleInputChange}
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Daily Prep Time Committed</label>
                    <input
                      type="text"
                      name="timeAvailable"
                      required
                      value={profile.timeAvailable}
                      onChange={handleInputChange}
                      placeholder="e.g. 3 Hours / Day"
                      className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono">Special Gaps, Anxiety, constraints, or GAP Years</label>
                  <textarea
                    name="constraints"
                    rows={2}
                    value={profile.constraints}
                    onChange={handleInputChange}
                    placeholder="e.g. 1 year academic GAP after high school; gets highly nervous speaking in English under pressure; no internship referrals yet."
                    className="w-full text-sm bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Wizard Action Footer Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer animate-pulse"
              >
                Launch Custom AI Co-Pilot <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
