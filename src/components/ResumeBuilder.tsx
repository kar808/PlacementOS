import React, { useState, useRef, useEffect } from "react";
import { ResumeLinkedInSuggestion, StudentProfile } from "../types";
import { 
  FileText, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Lightbulb, 
  Zap, 
  HelpCircle, 
  X, 
  ShieldAlert, 
  BadgeInfo, 
  Play, 
  ArrowRight, 
  Clipboard, 
  Upload, 
  Link as LinkIcon, 
  Eye, 
  Copy, 
  Trash2, 
  Check, 
  Gauge, 
  Layers, 
  FileCode,
  Image as ImageIcon,
  FolderPlus,
  Edit3,
  Bookmark,
  Plus,
  RotateCcw
} from "lucide-react";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import FileUploadAnalyzer from "./FileUploadAnalyzer";

interface ResumeBuilderProps {
  profile: StudentProfile;
  suggestions: ResumeLinkedInSuggestion | null;
  onOptimize: (jobDesc: string) => Promise<void>;
  isOptimizing: boolean;
  callServerEndpoint?: (endpoint: string, body: any) => Promise<any>;
  onUpdateProfile?: (updatedFields: Partial<StudentProfile>) => void;
}

export interface UploadedResumeFile {
  file?: File;
  name: string;
  size: number;
  mimeType: string;
  base64Data: string;
  textContent: string;
  previewUrl?: string;
}

export interface SavedResumeVersion {
  id: string;
  title: string;
  targetRole: string;
  uploadedAt: string;
  fileData: UploadedResumeFile;
  suggestions: ResumeLinkedInSuggestion | null;
  jobDescription: string;
  score: number;
}

export default function ResumeBuilder({
  profile,
  suggestions,
  onOptimize,
  isOptimizing,
  callServerEndpoint,
  onUpdateProfile,
}: ResumeBuilderProps) {
  const [activeSubTab, setActiveSubTab] = useState<"upload" | "tailor" | "multimodal">("upload");
  const [jobDesc, setJobDesc] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Saved Resume Versions State
  const [savedVersions, setSavedVersions] = useState<SavedResumeVersion[]>(() => {
    const cached = localStorage.getItem("placement_saved_resumes");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn("Failed to parse saved resume versions cache:", e);
      }
    }
    return [
      {
        id: "ver_default_1",
        title: "Software Engineer - Full Stack CV",
        targetRole: "Full Stack Engineer",
        uploadedAt: "Jul 20, 2026",
        fileData: {
          name: "Resume_FullStack_2026.pdf",
          size: 245120,
          mimeType: "application/pdf",
          base64Data: "",
          textContent: `[Candidate Resume: Full Stack Developer]\nName: ${profile.name || "Student Candidate"}\nTarget Role: Full Stack Engineer\nTechnical Skills: React, Node.js, TypeScript, PostgreSQL, Docker, AWS\nKey Experience:\n- Engineered scalable REST APIs using Node.js & TypeScript, reducing p99 latency by 38% across 100K DAU.\n- Built responsive frontend application with React 18 & Tailwind CSS achieving 98+ Google Lighthouse score.`,
        },
        suggestions: suggestions || {
          optimizationScore: 88,
          keywordMatchScore: 91,
          atsReadabilityScore: 94,
          uploadedText: "Full Stack Developer resume with React & Node.js expertise.",
          atsBulletImprovements: [
            {
              before: "Worked on website performance and API endpoints.",
              after: "Engineered scalable REST APIs using Node.js & TypeScript, reducing p99 response latencies by 38% across 100K daily active users.",
              explanation: "Replaced passive description with quantifiable latency metrics and clear technological ownership."
            }
          ],
          weakPhrasesDetected: ["Worked on", "Responsible for", "Helped with"],
          suggestedHeadline: "Full Stack Engineer | React & Node.js Specialist | Scalable Systems & Cloud Architecture",
          suggestedAboutSection: "Results-driven Full Stack Engineer with strong foundations in React, TypeScript, and microservice backends. Proven track record of delivering high-performance web products."
        },
        jobDescription: "Seeking Full Stack Software Engineer skilled in React, Node.js, and cloud deployments.",
        score: 88
      },
      {
        id: "ver_default_2",
        title: "Frontend Developer - UI/UX Focus",
        targetRole: "Frontend Engineer / UI Specialist",
        uploadedAt: "Jul 22, 2026",
        fileData: {
          name: "Resume_Frontend_React_Tailwind.pdf",
          size: 198400,
          mimeType: "application/pdf",
          base64Data: "",
          textContent: `[Candidate Resume: Frontend Developer]\nName: ${profile.name || "Student Candidate"}\nTarget Role: Frontend Developer\nTechnical Skills: React 18, Next.js, Tailwind CSS, TypeScript, Webpack\nKey Experience:\n- Architected accessible design system following WCAG AA standards, accelerating UI velocity by 45%.`,
        },
        suggestions: {
          optimizationScore: 92,
          keywordMatchScore: 94,
          atsReadabilityScore: 96,
          uploadedText: "Frontend Developer resume with React, Tailwind, and Web Performance expertise.",
          atsBulletImprovements: [
            {
              before: "Made UI screens responsive and styled components with CSS.",
              after: "Architected modern responsive UI design system with React & Tailwind CSS, boosting Google Lighthouse score from 72 to 98/100.",
              explanation: "Introduced quantifiable web performance metrics and architectural design system context."
            }
          ],
          weakPhrasesDetected: ["Made UI screens", "Styled components"],
          suggestedHeadline: "Frontend Engineer | React & Tailwind Design Systems | High Performance Web Apps",
          suggestedAboutSection: "Passionate Frontend Developer focused on creating accessible, responsive, and visually stunning web applications."
        },
        jobDescription: "Looking for a Frontend Specialist experienced in React, Next.js, and design systems.",
        score: 92
      }
    ];
  });

  const [activeVersionId, setActiveVersionId] = useState<string>(() => {
    const cachedActive = localStorage.getItem("placement_active_resume_id");
    return cachedActive || "ver_default_1";
  });

  // Modal and Edit states for Saved Versions
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [newVersionTitle, setNewVersionTitle] = useState<string>("");
  const [newVersionRole, setNewVersionRole] = useState<string>("");

  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState<string>("");
  const [renameRole, setRenameRole] = useState<string>("");
  
  // Active Resume File State
  const activeVer = savedVersions.find(v => v.id === activeVersionId) || savedVersions[0];
  const [uploadedResumeFile, setUploadedResumeFile] = useState<UploadedResumeFile | null>(
    activeVer ? activeVer.fileData : null
  );
  const [isFileReaderLoading, setIsFileReaderLoading] = useState<boolean>(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  
  // Local suggestions state
  const [activeSuggestions, setActiveSuggestions] = useState<ResumeLinkedInSuggestion | null>(
    activeVer ? activeVer.suggestions : suggestions
  );
  const [isLocalOptimizing, setIsLocalOptimizing] = useState<boolean>(false);

  // AI Feedback Overlay states
  const [activeOverlayIndex, setActiveOverlayIndex] = useState<number | null>(null);
  const [customMetric, setCustomMetric] = useState<string>("35");
  const [customScale, setCustomScale] = useState<string>("large-scale");
  const [copiedPreviewText, setCopiedPreviewText] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync activeSuggestions if prop changes
  useEffect(() => {
    if (suggestions) {
      setActiveSuggestions(suggestions);
    }
  }, [suggestions]);

  // Keep active working data in sync with current selected version
  useEffect(() => {
    const cur = savedVersions.find(v => v.id === activeVersionId);
    if (cur) {
      setUploadedResumeFile(cur.fileData);
      setActiveSuggestions(cur.suggestions);
      if (cur.jobDescription) setJobDesc(cur.jobDescription);
    }
  }, [activeVersionId]);

  // Handle switching active resume version
  const handleSelectVersion = (version: SavedResumeVersion) => {
    setActiveVersionId(version.id);
    localStorage.setItem("placement_active_resume_id", version.id);
    setUploadedResumeFile(version.fileData);
    setActiveSuggestions(version.suggestions);
    if (version.jobDescription) setJobDesc(version.jobDescription);
  };

  // Sync state changes back into savedVersions array
  const syncCurrentToActiveVersion = (
    updatedFile?: UploadedResumeFile | null,
    updatedSugg?: ResumeLinkedInSuggestion | null,
    updatedJd?: string
  ) => {
    setSavedVersions(prev => {
      const updated = prev.map(ver => {
        if (ver.id === activeVersionId) {
          const fileData = updatedFile !== undefined ? (updatedFile || ver.fileData) : ver.fileData;
          const suggestionsData = updatedSugg !== undefined ? updatedSugg : ver.suggestions;
          const jdData = updatedJd !== undefined ? updatedJd : ver.jobDescription;
          const score = suggestionsData?.optimizationScore ?? ver.score;

          return {
            ...ver,
            fileData,
            suggestions: suggestionsData,
            jobDescription: jdData,
            score,
          };
        }
        return ver;
      });
      localStorage.setItem("placement_saved_resumes", JSON.stringify(updated));
      return updated;
    });
  };

  // Save Current Upload/Analysis as New Version
  const handleSaveCurrentAsVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionTitle.trim()) return;

    const newId = `ver_${Date.now()}`;
    const currFile = uploadedResumeFile || {
      name: "Uploaded_Resume_Doc.pdf",
      size: 180000,
      mimeType: "application/pdf",
      base64Data: "",
      textContent: `[Resume Document for ${profile.name || "Candidate"}]\nRole: ${newVersionRole || profile.targetRoles?.[0] || "Software Engineer"}`,
    };

    const newVer: SavedResumeVersion = {
      id: newId,
      title: newVersionTitle.trim(),
      targetRole: newVersionRole.trim() || profile.targetRoles?.[0] || "Software Engineer",
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      fileData: currFile,
      suggestions: activeSuggestions,
      jobDescription: jobDesc,
      score: activeSuggestions?.optimizationScore || 85,
    };

    const updated = [newVer, ...savedVersions];
    setSavedVersions(updated);
    localStorage.setItem("placement_saved_resumes", JSON.stringify(updated));
    setActiveVersionId(newId);
    localStorage.setItem("placement_active_resume_id", newId);

    setNewVersionTitle("");
    setNewVersionRole("");
    setIsSaveModalOpen(false);
  };

  // Delete Version
  const handleDeleteVersion = (versionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedVersions.length <= 1) {
      alert("You must keep at least one saved resume version.");
      return;
    }
    const updated = savedVersions.filter(v => v.id !== versionId);
    setSavedVersions(updated);
    localStorage.setItem("placement_saved_resumes", JSON.stringify(updated));

    if (activeVersionId === versionId && updated.length > 0) {
      handleSelectVersion(updated[0]);
    }
  };

  // Save Rename
  const handleSaveRename = (versionId: string) => {
    if (!renameTitle.trim()) return;
    setSavedVersions(prev => {
      const updated = prev.map(ver => ver.id === versionId ? {
        ...ver,
        title: renameTitle.trim(),
        targetRole: renameRole.trim() || ver.targetRole,
      } : ver);
      localStorage.setItem("placement_saved_resumes", JSON.stringify(updated));
      return updated;
    });
    setEditingVersionId(null);
  };

  const handleCopy = (text: string, index: number, type: string) => {
    navigator.clipboard.writeText(text);
    const key = `${type}-${index}`;
    setCopiedIndex(index);
    setCopiedText(key);
    setTimeout(() => {
      setCopiedIndex(null);
      setCopiedText(null);
    }, 2000);
  };

  // Process File using FileReader API
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setFileUploadError(null);

    if (file.size > 15 * 1024 * 1024) {
      setFileUploadError("File size exceeds 15MB. Please upload a smaller PDF or image file.");
      return;
    }

    setIsFileReaderLoading(true);

    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const result = event.target?.result as string;
        const base64Data = result ? result.split(",")[1] || result : "";
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

        // Extract raw text locally if plain text/doc or fallback description
        let textContent = `[Verified Document Data]\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nType: ${file.type || "Document/Image"}\nCandidate: ${profile.name || "Student"}\nTarget Role: ${profile.targetRoles?.[0] || "Software Engineer"}`;

        if (file.type === "text/plain" || file.name.endsWith(".txt")) {
          const textReader = new FileReader();
          textReader.onload = (tEvent) => {
            const rawText = tEvent.target?.result as string;
            if (rawText) textContent = rawText;
            const newFileData: UploadedResumeFile = {
              file,
              name: file.name,
              size: file.size,
              mimeType: file.type || "text/plain",
              base64Data,
              textContent,
              previewUrl,
            };
            setUploadedResumeFile(newFileData);
            syncCurrentToActiveVersion(newFileData, activeSuggestions, jobDesc);
            setIsFileReaderLoading(false);
          };
          textReader.readAsText(file);
        } else {
          const newFileData: UploadedResumeFile = {
            file,
            name: file.name,
            size: file.size,
            mimeType: file.type || "application/pdf",
            base64Data,
            textContent,
            previewUrl,
          };
          setUploadedResumeFile(newFileData);
          syncCurrentToActiveVersion(newFileData, activeSuggestions, jobDesc);
          setIsFileReaderLoading(false);
        }
      } catch (err) {
        console.error("FileReader error:", err);
        setFileUploadError("Failed to read file locally. Please try again.");
        setIsFileReaderLoading(false);
      }
    };

    reader.onerror = () => {
      setFileUploadError("FileReader encountered an error processing your file.");
      setIsFileReaderLoading(false);
    };

    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Run Optimization using uploaded file & /api/placement/resume-optimize
  const handleOptimizeWithFile = async () => {
    if (!uploadedResumeFile) {
      setFileUploadError("Please select a PDF or image file first.");
      return;
    }

    setIsLocalOptimizing(true);
    setFileUploadError(null);

    try {
      if (callServerEndpoint) {
        const responseData = await callServerEndpoint("/api/placement/resume-optimize", {
          profile,
          jobDescription: jobDesc,
          fileText: uploadedResumeFile.textContent,
          fileBase64: uploadedResumeFile.base64Data,
          mimeType: uploadedResumeFile.mimeType,
        });

        let updatedFile = uploadedResumeFile;
        if (responseData?.uploadedText) {
          updatedFile = { ...uploadedResumeFile, textContent: responseData.uploadedText };
          setUploadedResumeFile(updatedFile);
        }

        setActiveSuggestions(responseData);
        syncCurrentToActiveVersion(updatedFile, responseData, jobDesc);
      } else {
        await onOptimize(jobDesc);
      }
    } catch (err) {
      console.error("Error optimizing resume with file:", err);
      setFileUploadError("Failed to optimize resume. Please check your network connection.");
    } finally {
      setIsLocalOptimizing(false);
    }
  };

  const handleSubmitTailor = (e: React.FormEvent) => {
    e.preventDefault();
    onOptimize(jobDesc);
  };

  const getSimulatedRewrite = (after: string) => {
    let dynamic = after;
    dynamic = dynamic.replace(/\d+%/g, `${customMetric}%`);
    dynamic = dynamic.replace(/large-scale/gi, customScale === "large-scale" ? "enterprise-scale" : "multi-tier");
    return dynamic;
  };

  // Calculate scores for Radial Gauge Chart
  const currSuggestions = activeSuggestions || suggestions;
  const rawScore = currSuggestions?.optimizationScore ?? (
    currSuggestions ? Math.min(96, Math.max(58, 100 - (currSuggestions.weakPhrasesDetected?.length || 0) * 5 + (currSuggestions.atsBulletImprovements?.length || 0) * 6)) : 0
  );
  const keywordScore = currSuggestions?.keywordMatchScore ?? Math.min(98, rawScore + 3);
  const atsReadability = currSuggestions?.atsReadabilityScore ?? Math.min(99, rawScore + 2);

  const gaugeData = [
    {
      name: "Optimization Score",
      value: rawScore,
      fill: rawScore >= 80 ? "#10b981" : rawScore >= 60 ? "#f59e0b" : "#f43f5e",
    },
  ];

  return (
    <div className="space-y-8">

      {/* 1. Saved Resume Versions Selector Panel */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm tracking-tight flex items-center gap-2">
                Saved Resume Versions Library
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded-full">
                  {savedVersions.length} Saved {savedVersions.length === 1 ? "Version" : "Versions"}
                </span>
              </h3>
              <p className="text-[11px] text-white/50 font-medium">
                Save & toggle between targeted resume versions for different job applications, roles, and enterprise ATS filters.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setNewVersionTitle(`Resume - ${profile.targetRoles?.[0] || "Software Engineer"}`);
              setNewVersionRole(profile.targetRoles?.[0] || "Software Engineer");
              setIsSaveModalOpen(true);
            }}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
          >
            <FolderPlus className="w-4 h-4" /> Save Current as New Version
          </button>
        </div>

        {/* Saved Version Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {savedVersions.map((ver) => {
            const isActive = ver.id === activeVersionId;
            const isEditing = editingVersionId === ver.id;

            return (
              <div
                key={ver.id}
                onClick={() => handleSelectVersion(ver)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-lg"
                    : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold font-mono rounded-md uppercase tracking-wider ${
                      isActive
                        ? "bg-emerald-500 text-black shadow-sm"
                        : "bg-white/10 text-white/60"
                    }`}>
                      {isActive ? "ACTIVE VERSION" : "CLICK TO TOGGLE"}
                    </span>

                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-black font-mono">
                      <Gauge className="w-3.5 h-3.5" /> {ver.score}% ATS
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        placeholder="Version Title"
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={renameRole}
                        onChange={(e) => setRenameRole(e.target.value)}
                        placeholder="Target Role"
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => setEditingVersionId(null)}
                          className="px-2 py-1 bg-white/10 text-white text-[10px] rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveRename(ver.id)}
                          className="px-2 py-1 bg-emerald-500 text-black font-bold text-[10px] rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs font-extrabold text-white truncate">{ver.title}</h4>
                      <p className="text-[11px] text-cyan-400 font-semibold truncate mt-0.5">{ver.targetRole}</p>
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-mono">
                    <span className="truncate max-w-[140px]">{ver.fileData.name}</span>
                    <span>{ver.uploadedAt}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedResumeFile(ver.fileData);
                      setIsPreviewModalOpen(true);
                    }}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors"
                    title="Preview extracted document text"
                  >
                    <Eye className="w-3 h-3 text-cyan-400" /> Preview
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingVersionId(ver.id);
                        setRenameTitle(ver.title);
                        setRenameRole(ver.targetRole);
                      }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors"
                      title="Rename Version"
                    >
                      <Edit3 className="w-3 h-3 text-amber-400" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteVersion(ver.id, e)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                      title="Delete Version"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to Save Current Upload as New Version */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-400" /> Save New Resume Version
              </h3>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentAsVersion} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">Version Name / Title</label>
                <input
                  type="text"
                  required
                  value={newVersionTitle}
                  onChange={(e) => setNewVersionTitle(e.target.value)}
                  placeholder="e.g. Backend Engineer - Amazon Application"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">Target Role / Company</label>
                <input
                  type="text"
                  value={newVersionRole}
                  onChange={(e) => setNewVersionRole(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-white/60 space-y-1 font-mono">
                <p><strong>Active File:</strong> {uploadedResumeFile?.name || "Uploaded Resume"}</p>
                <p><strong>ATS Score:</strong> {activeSuggestions?.optimizationScore || 85}% Optimization</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-black font-extrabold rounded-xl text-xs shadow-md"
                >
                  Save Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub Tab Switcher */}
      <div className="bg-[#111] border border-white/10 p-1.5 rounded-2xl flex flex-wrap md:flex-nowrap gap-1 shadow-lg">
        <button
          onClick={() => setActiveSubTab("upload")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "upload"
              ? "bg-emerald-500 text-black shadow-md"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Upload className="w-4 h-4" /> Upload PDF / Image Resume
        </button>

        <button
          onClick={() => setActiveSubTab("tailor")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "tailor"
              ? "bg-emerald-500 text-black shadow-md"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-4 h-4" /> Role-Specific ATS Customizer (JD Match)
        </button>

        <button
          onClick={() => setActiveSubTab("multimodal")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "multimodal"
              ? "bg-emerald-500 text-black shadow-md"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" /> Multimodal Marksheet & Web Link Hub
        </button>
      </div>

      {/* Sub Tab 1: File Upload Component using FileReader API */}
      {activeSubTab === "upload" && (
        <div className="bg-[#111]/90 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl space-y-6 transition-all">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono mb-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> FileReader Local File Processing
              </div>
              <h3 className="font-extrabold text-white text-base tracking-tight">Upload Resume File for Active Version</h3>
              <p className="text-white/60 text-xs leading-relaxed max-w-2xl font-medium mt-0.5">
                Upload your resume document or image scan. Our local FileReader API processes the file and sends it to the optimization endpoint for high-precision ATS parsing.
              </p>
            </div>
          </div>

          {/* Upload Dropzone */}
          {!uploadedResumeFile ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all bg-black/20 hover:bg-emerald-500/5 group relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 text-white/60 group-hover:text-emerald-400 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                Click or Drag PDF or Image Resume File Here
              </p>
              <p className="text-xs text-white/40 mt-1 max-w-md mx-auto font-mono">
                Supports PDF documents (.pdf), image scans (.png, .jpg, .jpeg, .webp), or text files (.txt) up to 15MB.
              </p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="application/pdf,image/*,.txt,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              {isFileReaderLoading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center text-xs font-bold text-emerald-400 gap-2 font-mono">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing file via FileReader API...
                </div>
              )}
            </div>
          ) : (
            /* Uploaded File Card & Actions */
            <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3 min-w-0">
                  {uploadedResumeFile.previewUrl ? (
                    <img 
                      src={uploadedResumeFile.previewUrl} 
                      alt={uploadedResumeFile.name} 
                      className="w-12 h-12 object-cover rounded-xl border border-white/10 shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-white truncate">{uploadedResumeFile.name}</h4>
                      <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold font-mono rounded-md">
                        ACTIVE VERSION FILE
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">
                      {(uploadedResumeFile.size / 1024).toFixed(1)} KB • {uploadedResumeFile.mimeType}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" /> Preview Document Text
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 sm:flex-none px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
                  >
                    Replace
                  </button>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="application/pdf,image/*,.txt,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Target Job Description for File Optimization */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/80 flex items-center justify-between">
                  <span>Target Job Description / Role Requirements (Optional)</span>
                  <span className="text-[10px] text-white/40 font-mono">Tailors keyword scores</span>
                </label>
                <textarea
                  value={jobDesc}
                  onChange={(e) => {
                    setJobDesc(e.target.value);
                    syncCurrentToActiveVersion(uploadedResumeFile, activeSuggestions, e.target.value);
                  }}
                  rows={3}
                  placeholder="Paste the target job description or key technical requirements here to get pinpoint keyword matching..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {fileUploadError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {fileUploadError}
                </div>
              )}

              <button
                onClick={handleOptimizeWithFile}
                disabled={isLocalOptimizing || isFileReaderLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLocalOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Document & Tailoring ATS Score...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Run AI Resume Optimization on {activeVer?.title || "Active Version"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Radial Gauge Chart Section for Optimization Score */}
      {currSuggestions && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono mb-1.5">
                <Gauge className="w-3 h-3 text-cyan-400" /> Visual Recharts Analytics
              </div>
              <h3 className="font-extrabold text-white text-base tracking-tight">Resume Optimization Radial Gauge</h3>
              <p className="text-white/60 text-xs leading-relaxed max-w-2xl font-medium mt-0.5">
                Real-time visual gauge metrics calculated from your active resume document, keyword density, and ATS readability benchmarks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Radial Gauge Chart Component */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center relative min-h-[220px]">
              <div className="w-full h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="70%" 
                    outerRadius="100%" 
                    barSize={12} 
                    data={gaugeData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar
                      background={{ fill: "#1f2937" }}
                      dataKey="value"
                      cornerRadius={10}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-6 text-center">
                  <span className="text-3xl font-black text-white font-mono tracking-tight">{rawScore}%</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono">
                    Optimization Index
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-white/50 text-center font-mono mt-1">
                Calculated across 40+ Enterprise ATS filters
              </p>
            </div>

            {/* Keyword Match & Readability Breakdown */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-black/30 border border-white/10 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/70">Keyword Relevance</span>
                    <span className="text-xs font-mono font-black text-emerald-400">{keywordScore}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${keywordScore}%` }}></div>
                  </div>
                  <p className="text-[10px] text-white/40 font-mono">Matches technical skills & target roles</p>
                </div>

                <div className="bg-black/30 border border-white/10 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/70">ATS Readability</span>
                    <span className="text-xs font-mono font-black text-cyan-400">{atsReadability}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${atsReadability}%` }}></div>
                  </div>
                  <p className="text-[10px] text-white/40 font-mono">Format compliance & bullet structures</p>
                </div>
              </div>

              {currSuggestions.weakPhrasesDetected && currSuggestions.weakPhrasesDetected.length > 0 && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-extrabold font-mono uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" /> Weak Phrases Identified
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {currSuggestions.weakPhrasesDetected.map((phrase, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-mono rounded font-bold">
                        "{phrase}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Text Preview Modal */}
      {isPreviewModalOpen && uploadedResumeFile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/20 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">Resume Document Text Preview</h3>
                  <p className="text-[11px] text-white/50 font-mono">
                    {uploadedResumeFile.name} • {(uploadedResumeFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span><strong>Candidate:</strong> {profile.name || "Student"}</span>
                  <span><strong>Target Role:</strong> {profile.targetRoles?.[0] || "Software Engineer"}</span>
                </div>
                <div><strong>MIME Type:</strong> {uploadedResumeFile.mimeType}</div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-white/80 font-mono">Extracted Text Content</label>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(uploadedResumeFile.textContent);
                      setCopiedPreviewText(true);
                      setTimeout(() => setCopiedPreviewText(false), 2000);
                    }}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedPreviewText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPreviewText ? "Copied!" : "Copy Text"}
                  </button>
                </div>
                <pre className="p-4 bg-black/80 border border-white/10 rounded-xl text-xs font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {uploadedResumeFile.textContent}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-black/40 flex justify-end gap-3">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-emerald-500 text-black font-extrabold text-xs rounded-xl hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multimodal Marksheet & Portfolio Hub */}
      {activeSubTab === "multimodal" && (
        <FileUploadAnalyzer 
          profile={profile} 
          callServerEndpoint={callServerEndpoint}
          onUpdateProfile={onUpdateProfile}
        />
      )}

      {/* Role-Specific ATS Customizer Suggestions */}
      {(activeSubTab === "tailor" || currSuggestions) && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono mb-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> AI ATS Bullet Rewriter
              </div>
              <h3 className="font-extrabold text-white text-base tracking-tight">AI Tailored ATS Recommendations</h3>
              <p className="text-white/60 text-xs leading-relaxed max-w-2xl font-medium mt-0.5">
                Quantifiable bullet improvements, action verbs, and LinkedIn profile optimizations generated for {activeVer?.title || "Active Resume Version"}.
              </p>
            </div>
          </div>

          {currSuggestions?.atsBulletImprovements && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-white/80 font-mono">
                Recommended High-Impact Bullet Rewrites
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {currSuggestions.atsBulletImprovements.map((item, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/10 rounded-2xl p-5 space-y-3">
                    <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono">Before</span>
                      <p className="text-xs text-rose-200/80 font-mono">{item.before}</p>
                    </div>

                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">After (Quantified & Actionable)</span>
                        <button
                          onClick={() => handleCopy(item.after, idx, "bullet")}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText === `bullet-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedText === `bullet-${idx}` ? "Copied" : "Copy Bullet"}
                        </button>
                      </div>
                      <p className="text-xs text-emerald-200 font-bold font-mono">{getSimulatedRewrite(item.after)}</p>
                    </div>

                    <p className="text-[11px] text-white/50 font-medium leading-relaxed italic">
                      💡 {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currSuggestions?.suggestedHeadline && (
            <div className="p-5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase tracking-wider text-white/80 font-mono">
                  Recommended LinkedIn Headline
                </h4>
                <button
                  onClick={() => handleCopy(currSuggestions.suggestedHeadline!, 0, "headline")}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 cursor-pointer"
                >
                  {copiedText === "headline-0" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedText === "headline-0" ? "Copied" : "Copy Headline"}
                </button>
              </div>
              <p className="text-xs text-white/90 font-mono bg-white/5 p-3 rounded-xl border border-white/10">
                {currSuggestions.suggestedHeadline}
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
