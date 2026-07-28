import React, { useState, useRef } from "react";
import { StudentProfile, UploadedFileItem, FileAnalysisResult } from "../types";
import { 
  Upload, 
  Link as LinkIcon, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Copy, 
  Check, 
  Layers, 
  FileCode, 
  ExternalLink,
  Zap,
  Plus,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Target,
  CheckSquare,
  Award,
  Briefcase,
  GraduationCap,
  Download,
  XCircle,
  HelpCircle,
  Clock,
  Compass
} from "lucide-react";

interface FileUploadAnalyzerProps {
  profile: StudentProfile;
  callServerEndpoint: (endpoint: string, body: any) => Promise<any>;
  onUpdateProfile?: (updatedFields: Partial<StudentProfile>) => void;
  onTransferToBuilder?: (extractedDetails: any) => void;
  compactMode?: boolean;
}

export default function FileUploadAnalyzer({
  profile,
  callServerEndpoint,
  onUpdateProfile,
  onTransferToBuilder,
  compactMode = false,
}: FileUploadAnalyzerProps) {
  const [items, setItems] = useState<UploadedFileItem[]>([]);
  const [linkInput, setLinkInput] = useState<string>("");
  const [linkCategory, setLinkCategory] = useState<UploadedFileItem['category']>("portfolio_link");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [showExtractedText, setShowExtractedText] = useState<boolean>(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState<string>("Uploading Resume...");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelAnalysisRef = useRef<boolean>(false);

  // Convert File to Base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(",")[1] || result;
        resolve(base64Data);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Read File Text if TXT
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsText(file);
    });
  };

  const processFiles = async (filesArray: File[]) => {
    setError(null);
    const newItems: UploadedFileItem[] = [];

    for (const file of filesArray) {
      // 1. Validate File Size (< 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 20MB limit. Please upload a smaller resume document.`);
        continue;
      }

      // 2. Validate Empty Files (0 Bytes)
      if (file.size === 0) {
        setError(`File "${file.name}" is empty (0 bytes). Please upload a valid, non-empty resume document.`);
        continue;
      }

      // 3. Validate File Extension & MIME Type
      const fileName = file.name.toLowerCase();
      const validExtensions = [".pdf", ".docx", ".doc", ".txt", ".rtf", ".png", ".jpg", ".jpeg", ".webp"];
      const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));
      const isValidMime =
        file.type.startsWith("image/") ||
        file.type === "application/pdf" ||
        file.type.includes("word") ||
        file.type.includes("text") ||
        file.type.includes("rtf");

      if (!isValidExtension && !isValidMime) {
        setError(`Unsupported File Format: "${file.name}". Please upload a supported resume format (.pdf, .docx, .doc, .txt, or scan image).`);
        continue;
      }

      // 4. Validate Duplicate File Check
      const isDuplicate = items.some(
        (existing) => existing.name.toLowerCase() === file.name.toLowerCase() && existing.size === file.size
      );
      if (isDuplicate) {
        setError(`Duplicate file detected: "${file.name}" is already attached.`);
        continue;
      }

      let category: UploadedFileItem['category'] = "document_pdf";
      if (file.type.startsWith("image/")) {
        category = "resume_photo";
      }

      try {
        const base64Data = await readFileAsBase64(file);
        let textContent: string | undefined;
        if (fileName.endsWith(".txt") || file.type === "text/plain") {
          textContent = await readFileAsText(file);
        }
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

        newItems.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          base64Data,
          textContent,
          category,
          previewUrl,
        });
      } catch (err) {
        console.error("Failed to process file:", err);
        setError(`Failed to read "${file.name}". The file may be corrupt or password-protected. Please try again.`);
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    processFiles(Array.from(e.target.files));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    let formattedUrl = linkInput.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Duplicate link check
    const isDuplicate = items.some((item) => item.linkUrl === formattedUrl);
    if (isDuplicate) {
      setError(`Duplicate URL: "${formattedUrl}" is already added.`);
      return;
    }

    const newItem: UploadedFileItem = {
      id: `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: formattedUrl,
      mimeType: "text/html",
      linkUrl: formattedUrl,
      category: linkCategory,
    };

    setItems((prev) => [...prev, newItem]);
    setLinkInput("");
    setError(null);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCancelAnalysis = () => {
    cancelAnalysisRef.current = true;
    setIsAnalyzing(false);
    setError("Resume analysis cancelled by user.");
  };

  const handleAnalyzeItems = async () => {
    if (items.length === 0) {
      setError("Please attach at least one valid resume file (PDF, DOCX, TXT, or scan) to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    cancelAnalysisRef.current = false;

    const progressSteps = [
      "Uploading Resume...",
      "Validating File...",
      "Reading Resume...",
      "Extracting Information...",
      "Analysing Resume...",
      "Calculating ATS Score...",
      "Generating Recommendations...",
      "Preparing Final Report..."
    ];

    let stepIdx = 0;
    setAnalysisProgressStep(progressSteps[0]);

    const timer = setInterval(() => {
      if (cancelAnalysisRef.current) {
        clearInterval(timer);
        return;
      }
      stepIdx = (stepIdx + 1) % progressSteps.length;
      setAnalysisProgressStep(progressSteps[stepIdx]);
    }, 1800);

    try {
      const data = await callServerEndpoint("/api/placement/analyze-file", {
        items,
        profile,
        targetRole: profile.targetRoles?.[0] || "Software Engineer",
      });

      if (cancelAnalysisRef.current) return;

      const resultData = data?.analysis || data;
      setAnalysisResult(resultData);

      // Handle server returning non-resume result explicitly
      if (resultData && resultData.isResume === false) {
        setError(null); // The resultData component will display the non-resume alert clearly
      }
    } catch (err: any) {
      if (cancelAnalysisRef.current) return;
      console.error("Resume analysis failed:", err);
      setError(err?.message || "Analysis failed. Please check your document format and network connection.");
    } finally {
      clearInterval(timer);
      setIsAnalyzing(false);
    }
  };

  const handleApplyExtractedToProfile = () => {
    if (!analysisResult?.extractedDetails || !onUpdateProfile) return;

    const details = analysisResult.extractedDetails;
    const update: Partial<StudentProfile> = {};

    if (details.name && !profile.name) update.name = details.name;
    if (details.email && !profile.email) update.email = details.email;
    if (details.phone && !profile.phone) update.phone = details.phone;
    if (details.location && !profile.location) update.location = details.location;
    if (details.degree && !profile.degree) update.degree = details.degree;
    if (details.college && !profile.college) update.college = details.college;
    if (details.linkedin && !profile.linkedinUrl) update.linkedinUrl = details.linkedin;
    if (details.github && !profile.githubUrl) update.githubUrl = details.github;

    if (details.technicalSkills && details.technicalSkills.length > 0) {
      const mergedSkills = Array.from(new Set([...(profile.technicalSkills || []), ...details.technicalSkills]));
      update.technicalSkills = mergedSkills;
    }

    if (details.projects && details.projects.length > 0) {
      const projectStr = details.projects.map(p => typeof p === 'string' ? p : `${p.title}: ${p.description || ''}`).join("; ");
      update.projects = profile.projects ? `${profile.projects}\n${projectStr}` : projectStr;
    }

    if (details.certifications && details.certifications.length > 0) {
      const certStr = details.certifications.join(", ");
      update.certifications = profile.certifications ? `${profile.certifications}, ${certStr}` : certStr;
    }

    onUpdateProfile(update);
    setAppliedSuccess(true);

    if (onTransferToBuilder) {
      onTransferToBuilder(details);
    }

    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrintPDFReport = () => {
    window.print();
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    if (score >= 50) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
    return "bg-rose-500/10 border-rose-500/30 text-rose-400";
  };

  return (
    <div className="space-y-6">
      {/* Container Header */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono mb-2">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> Universal Enterprise Resume Engine
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">Enterprise Resume Upload & AI Analysis Engine</h3>
            <p className="text-white/60 text-xs mt-1 max-w-xl leading-relaxed">
              Upload your resume (PDF, DOCX, DOC, TXT, or scan). Vorynexa AI verifies document authenticity, extracts complete candidate parameters, assesses profession classification, audits ATS compliance, and generates actionable career guidance.
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Link Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Drag & Drop Upload File Box */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" /> Upload Resume File
              </span>
              <span className="text-[10px] text-white/40 font-mono">PDF, DOCX, DOC, TXT, SCAN</span>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging 
                  ? "border-emerald-400 bg-emerald-500/10" 
                  : "border-white/15 hover:border-emerald-500/50 bg-black/20 hover:bg-emerald-500/5"
              } group`}
            >
              <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 text-white/60 group-hover:text-emerald-400 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                {isDragging ? "Drop Resume Document Here" : "Click or Drag PDF, DOCX, DOC, TXT, or Scan Here"}
              </p>
              <p className="text-[10px] text-white/40 mt-1">
                Supports PDF (.pdf), Word (.docx, .doc), Plain Text (.txt), or Scans (Up to 20MB)
              </p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept=".pdf,application/pdf,.doc,.docx,.txt,.rtf,image/*,image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Link Insertion Box */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-400" /> Web Portfolio or Hosted Resume Link
              </span>
              <span className="text-[10px] text-white/40 font-mono">LINKEDIN / DRIVE / GITHUB</span>
            </div>

            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
                  Link Category
                </label>
                <select
                  value={linkCategory}
                  onChange={(e) => setLinkCategory(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="portfolio_link">Personal Portfolio Website</option>
                  <option value="resume_photo">Google Drive / Hosted Resume Link</option>
                  <option value="document_pdf">GitHub Profile / Repository Link</option>
                  <option value="certificate_photo">LinkedIn Profile / Certificate URL</option>
                  <option value="other">Other Professional Web Link</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
                  URL Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/... or https://github.com/..."
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-white/20 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Error Message Display */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start justify-between gap-2.5 text-xs text-rose-400">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-white text-[10px] uppercase font-mono cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* List of Attached Documents */}
      {items.length > 0 && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Attached Documents for Analysis ({items.length})
            </span>
            <button
              onClick={() => setItems([])}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-mono uppercase tracking-wider cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="bg-black/40 border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 group relative overflow-hidden"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.previewUrl ? (
                    <img 
                      src={item.previewUrl} 
                      alt={item.name} 
                      className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0" 
                    />
                  ) : item.linkUrl ? (
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.name}</p>
                    <span className="text-[9px] text-white/40 font-mono uppercase block">
                      {item.linkUrl ? "Web Link" : `${(item.size ? (item.size / 1024).toFixed(0) : 0)} KB`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-white/40 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            {isAnalyzing && (
              <button
                onClick={handleCancelAnalysis}
                className="px-3.5 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <XCircle className="w-4 h-4" /> Cancel Analysis
              </button>
            )}

            <div className="ml-auto">
              <button
                onClick={handleAnalyzeItems}
                disabled={isAnalyzing}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> {analysisProgressStep}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Enterprise Resume Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          
          {/* SECTION 2 REQUIREMENT: NON-RESUME DETECTED WARNING BANNER */}
          {analysisResult.isResume === false ? (
            <div className="p-6 bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl space-y-4 text-rose-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-extrabold uppercase font-mono tracking-wider text-rose-300">
                    Document Verification Failed
                  </h4>
                  <p className="text-sm font-bold text-white leading-relaxed">
                    This document does not appear to be a professional resume. Please upload a valid resume.
                  </p>
                  {analysisResult.nonResumeReason && (
                    <p className="text-xs font-mono text-rose-200/80 bg-black/50 p-3 rounded-xl border border-rose-500/20">
                      Reason: {analysisResult.nonResumeReason}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-rose-500/20 text-xs text-rose-200/70 font-mono space-y-1">
                <p className="font-bold text-rose-300">💡 Valid resume documents must contain candidate details such as:</p>
                <p>• Candidate Name & Contact Information</p>
                <p>• Education & Academic Background</p>
                <p>• Work Experience or Industry Projects</p>
                <p>• Domain Skills & Certifications</p>
              </div>
            </div>
          ) : (
            /* VALID RESUME - FULL ENTERPRISE ANALYSIS REPORT */
            <>
              {/* Header & Overall Scores */}
              <div className="border-b border-white/10 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono mb-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid Resume Verified
                  </div>
                  <h4 className="text-base font-black text-white">{analysisResult.fileTypeDetected || "Candidate Resume Document"}</h4>
                  <p className="text-xs text-white/60 font-medium mt-0.5 leading-relaxed max-w-xl">{analysisResult.overallVerdict}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintPDFReport}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" /> Export / Download Report
                  </button>
                </div>
              </div>

              {/* SECTION 4 REQUIREMENT: SCORE CARDS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className={`p-3 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.overallScore)}`}>
                  <span className="text-[9px] uppercase tracking-widest block opacity-70 font-bold">Resume Score</span>
                  <span className="text-xl font-black">{analysisResult.overallScore}%</span>
                </div>
                <div className={`p-3 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.atsScore ?? analysisResult.atsCompatibilityScore ?? 80)}`}>
                  <span className="text-[9px] uppercase tracking-widest block opacity-70 font-bold">ATS Score</span>
                  <span className="text-xl font-black">{analysisResult.atsScore ?? analysisResult.atsCompatibilityScore ?? 80}%</span>
                </div>
                <div className={`p-3 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.grammarScore ?? 85)}`}>
                  <span className="text-[9px] uppercase tracking-widest block opacity-70 font-bold">Grammar Score</span>
                  <span className="text-xl font-black">{analysisResult.grammarScore ?? 85}%</span>
                </div>
                <div className={`p-3 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.formattingScore ?? 82)}`}>
                  <span className="text-[9px] uppercase tracking-widest block opacity-70 font-bold">Formatting</span>
                  <span className="text-xl font-black">{analysisResult.formattingScore ?? 82}%</span>
                </div>
                <div className={`p-3 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.professionalismScore ?? analysisResult.documentQualityScore ?? 85)}`}>
                  <span className="text-[9px] uppercase tracking-widest block opacity-70 font-bold">Professionalism</span>
                  <span className="text-xl font-black">{analysisResult.professionalismScore ?? analysisResult.documentQualityScore ?? 85}%</span>
                </div>
                <div className={`p-3 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.careerReadinessScore ?? 80)}`}>
                  <span className="text-[9px] uppercase tracking-widest block opacity-70 font-bold">Readiness Score</span>
                  <span className="text-xl font-black">{analysisResult.careerReadinessScore ?? 80}%</span>
                </div>
              </div>

              {/* SECTION 6 REQUIREMENT: PROFESSION-SPECIFIC INTELLIGENCE BADGE */}
              {analysisResult.professionClassification && (
                <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-black border border-indigo-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black text-indigo-400 font-mono uppercase tracking-wider">
                      Profession & Domain Classification
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs font-mono">
                    {analysisResult.professionClassification.profession && (
                      <div className="bg-black/40 p-2 rounded-lg border border-indigo-500/20">
                        <span className="text-[9px] text-indigo-300/60 block uppercase">Profession</span>
                        <strong className="text-white text-[11px] truncate block">{analysisResult.professionClassification.profession}</strong>
                      </div>
                    )}
                    {analysisResult.professionClassification.industry && (
                      <div className="bg-black/40 p-2 rounded-lg border border-indigo-500/20">
                        <span className="text-[9px] text-indigo-300/60 block uppercase">Industry</span>
                        <strong className="text-white text-[11px] truncate block">{analysisResult.professionClassification.industry}</strong>
                      </div>
                    )}
                    {analysisResult.professionClassification.careerStage && (
                      <div className="bg-black/40 p-2 rounded-lg border border-indigo-500/20">
                        <span className="text-[9px] text-indigo-300/60 block uppercase">Career Stage</span>
                        <strong className="text-white text-[11px] truncate block">{analysisResult.professionClassification.careerStage}</strong>
                      </div>
                    )}
                    {analysisResult.professionClassification.experienceLevel && (
                      <div className="bg-black/40 p-2 rounded-lg border border-indigo-500/20">
                        <span className="text-[9px] text-indigo-300/60 block uppercase">Experience</span>
                        <strong className="text-white text-[11px] truncate block">{analysisResult.professionClassification.experienceLevel}</strong>
                      </div>
                    )}
                    {analysisResult.professionClassification.seniority && (
                      <div className="bg-black/40 p-2 rounded-lg border border-indigo-500/20">
                        <span className="text-[9px] text-indigo-300/60 block uppercase">Seniority</span>
                        <strong className="text-white text-[11px] truncate block">{analysisResult.professionClassification.seniority}</strong>
                      </div>
                    )}
                    {analysisResult.professionClassification.domain && (
                      <div className="bg-black/40 p-2 rounded-lg border border-indigo-500/20">
                        <span className="text-[9px] text-indigo-300/60 block uppercase">Domain</span>
                        <strong className="text-white text-[11px] truncate block">{analysisResult.professionClassification.domain}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 3 REQUIREMENT: PARSED CANDIDATE DETAILS GRID */}
              {analysisResult.extractedDetails && (
                <div className="bg-black/40 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <div>
                        <h5 className="text-xs font-black text-emerald-400 font-mono uppercase tracking-wider">
                          Extracted Candidate Profile Parameters
                        </h5>
                        <p className="text-[11px] text-white/50 font-medium">
                          Structured candidate data parsed automatically from document.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleApplyExtractedToProfile}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 shrink-0"
                    >
                      {appliedSuccess ? (
                        <>
                          <Check className="w-4 h-4" /> Data Synced to Profile!
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Improve Resume using AI / Transfer to Builder
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-white/80 font-mono">
                    {analysisResult.extractedDetails.name && (
                      <div><span className="text-white/40">Name:</span> <strong className="text-white">{analysisResult.extractedDetails.name}</strong></div>
                    )}
                    {analysisResult.extractedDetails.email && (
                      <div><span className="text-white/40">Email:</span> <span className="text-cyan-300">{analysisResult.extractedDetails.email}</span></div>
                    )}
                    {analysisResult.extractedDetails.phone && (
                      <div><span className="text-white/40">Phone:</span> {analysisResult.extractedDetails.phone}</div>
                    )}
                    {analysisResult.extractedDetails.location && (
                      <div><span className="text-white/40">Location:</span> {analysisResult.extractedDetails.location}</div>
                    )}
                    {analysisResult.extractedDetails.address && (
                      <div><span className="text-white/40">Address:</span> {analysisResult.extractedDetails.address}</div>
                    )}
                    {analysisResult.extractedDetails.degree && (
                      <div><span className="text-white/40">Degree:</span> {analysisResult.extractedDetails.degree}</div>
                    )}
                    {analysisResult.extractedDetails.college && (
                      <div><span className="text-white/40">College:</span> {analysisResult.extractedDetails.college}</div>
                    )}
                    {analysisResult.extractedDetails.linkedin && (
                      <div><span className="text-white/40">LinkedIn:</span> <a href={analysisResult.extractedDetails.linkedin} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{analysisResult.extractedDetails.linkedin}</a></div>
                    )}
                    {analysisResult.extractedDetails.github && (
                      <div><span className="text-white/40">GitHub:</span> <a href={analysisResult.extractedDetails.github} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{analysisResult.extractedDetails.github}</a></div>
                    )}
                    {analysisResult.extractedDetails.portfolio && (
                      <div><span className="text-white/40">Portfolio:</span> <a href={analysisResult.extractedDetails.portfolio} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{analysisResult.extractedDetails.portfolio}</a></div>
                    )}
                  </div>

                  {analysisResult.extractedDetails.technicalSkills && (analysisResult.extractedDetails.technicalSkills || []).length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-xs font-bold text-white/60 font-mono block">Extracted Core & Technical Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysisResult.extractedDetails.technicalSkills || []).map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded-md font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResult.extractedDetails.softSkills && (analysisResult.extractedDetails.softSkills || []).length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-xs font-bold text-white/60 font-mono block">Extracted Leadership & Soft Skills:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(analysisResult.extractedDetails.softSkills || []).map((sk, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-mono rounded-md font-bold">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResult.extractedDetails.careerSummary && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-xs font-bold text-white/60 font-mono block">Career Summary:</span>
                      <p className="text-xs text-white/80 leading-relaxed font-sans">{analysisResult.extractedDetails.careerSummary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Multi-Dimensional Audits: Grammar, Industry Fit, Role Suitability, Skill Gap */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.grammarAnalysis && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4" /> Grammar & Tone Analysis
                    </h5>
                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      {analysisResult.grammarAnalysis}
                    </p>
                  </div>
                )}

                {analysisResult.industryFitAnalysis && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Target className="w-4 h-4" /> Industry Fit & Market Alignment
                    </h5>
                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      {analysisResult.industryFitAnalysis}
                    </p>
                  </div>
                )}

                {analysisResult.roleSuitability && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4" /> Role Suitability Assessment
                    </h5>
                    <p className="text-xs text-white/80 leading-relaxed font-sans">
                      {analysisResult.roleSuitability}
                    </p>
                  </div>
                )}

                {analysisResult.skillGapAnalysis && (analysisResult.skillGapAnalysis || []).length > 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-purple-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Skill Gap & Competency Recommendations
                    </h5>
                    <ul className="space-y-1 text-xs text-white/80 font-mono">
                      {(analysisResult.skillGapAnalysis || []).map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-purple-400">→</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Strengths vs Flaws */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Strengths */}
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                  <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Resume Strengths & Competitive Edge
                  </h5>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {(analysisResult.keyStrengths || []).map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 shrink-0">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Critical Red Flags */}
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 space-y-2">
                  <h5 className="text-xs font-black text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Formatting Flaws & Red Flags
                  </h5>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {(analysisResult.criticalFlawsAndRisks || []).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 shrink-0">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing Keywords & Missing Sections Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.missingKeywords && (analysisResult.missingKeywords || []).length > 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <FileCode className="w-4 h-4" /> Critical Missing ATS Keywords
                    </h5>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(analysisResult.missingKeywords || []).map((kw, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono rounded-lg">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.missingSections && (analysisResult.missingSections || []).length > 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Recommended Missing Sections
                    </h5>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(analysisResult.missingSections || []).map((sec, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-mono rounded-lg">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 5 REQUIREMENT: ATS Bullet Improvements */}
              {analysisResult.atsBulletImprovements && (analysisResult.atsBulletImprovements || []).length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                  <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Recommended STAR Method Bullet Point Rewrites
                  </h5>
                  <div className="space-y-3">
                    {(analysisResult.atsBulletImprovements || []).map((bullet, idx) => (
                      <div key={idx} className="bg-[#181818] border border-white/5 rounded-xl p-3 space-y-2 text-xs relative">
                        <div className="text-rose-400/80 line-through pr-12">
                          <span className="font-mono text-[9px] uppercase text-rose-400 block font-bold">Original Draft</span>
                          "{bullet.before}"
                        </div>
                        <div className="text-emerald-300 font-bold space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9px] uppercase text-emerald-400 block font-bold">ATS Optimized STAR Rewrite</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(bullet.after);
                                setCopiedKey(`f-bullet-${idx}`);
                                setTimeout(() => setCopiedKey(null), 2000);
                              }}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 cursor-pointer bg-emerald-500/10 px-2 py-0.5 rounded-md"
                            >
                              {copiedKey === `f-bullet-${idx}` ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                              {copiedKey === `f-bullet-${idx}` ? "Copied!" : "Copy Bullet"}
                            </button>
                          </div>
                          <p className="font-mono text-emerald-200">"{bullet.after}"</p>
                        </div>
                        <p className="text-[10px] text-white/50 leading-relaxed font-mono italic">
                          Why: {bullet.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RECOMMENDED PROJECTS & CERTIFICATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.recommendedProjects && (analysisResult.recommendedProjects || []).length > 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-black text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> Recommended High-Impact Portfolio Projects
                    </h5>
                    <div className="space-y-2">
                      {(analysisResult.recommendedProjects || []).map((proj, idx) => (
                        <div key={idx} className="p-3 bg-black/60 rounded-lg border border-white/5 text-xs space-y-1">
                          <strong className="text-white block font-bold">{proj.title}</strong>
                          {proj.objective && <p className="text-white/70 text-[11px]">{proj.objective}</p>}
                          {proj.resumeImpact && <p className="text-emerald-400 text-[10px] font-mono">Impact: {proj.resumeImpact}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.recommendedCertifications && (analysisResult.recommendedCertifications || []).length > 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-black text-purple-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Award className="w-4 h-4" /> Recommended Industry Certifications
                    </h5>
                    <div className="space-y-2">
                      {(analysisResult.recommendedCertifications || []).map((cert, idx) => (
                        <div key={idx} className="p-3 bg-black/60 rounded-lg border border-white/5 text-xs space-y-1">
                          <strong className="text-white block font-bold">{cert.name}</strong>
                          {cert.issuer && <span className="text-white/50 text-[10px] font-mono block">Issuer: {cert.issuer}</span>}
                          {cert.relevance && <p className="text-purple-300 text-[11px]">{cert.relevance}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CAREER ROADMAP & INTERVIEW PREPARATION TIPS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.careerRoadmapSuggestions && (analysisResult.careerRoadmapSuggestions || []).length > 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> Career Roadmap Suggestions
                    </h5>
                    <ul className="space-y-1.5 text-xs text-white/80 font-mono">
                      {(analysisResult.careerRoadmapSuggestions || []).map((rm, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{rm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysisResult.interviewPreparationTips && (analysisResult.interviewPreparationTips || []).length > 0 && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                    <h5 className="text-xs font-black text-indigo-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4" /> Interview Preparation Guidance
                    </h5>
                    <ul className="space-y-1.5 text-xs text-white/80 font-mono">
                      {(analysisResult.interviewPreparationTips || []).map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Formatting & Action Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                  <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                    Visual & Formatting Recommendations
                  </h5>
                  <ul className="space-y-1.5 text-xs text-white/70 font-mono">
                    {(analysisResult.formattingSuggestions || []).map((fs, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">→</span>
                        <span>{fs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
                  <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                    Step-by-Step Action Plan
                  </h5>
                  <ul className="space-y-1.5 text-xs text-white/70 font-mono">
                    {(analysisResult.recommendedActionableSteps || []).map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* SECTION 7 REQUIREMENT: Toggle View OCR / Extracted Document Text */}
              {analysisResult.extractedText && (
                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => setShowExtractedText(!showExtractedText)}
                    className="text-xs font-mono text-white/60 hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> {showExtractedText ? "Hide Raw Document Extracted Text" : "View Raw Document Extracted Text"}
                  </button>

                  {showExtractedText && (
                    <div className="mt-3 bg-black border border-white/10 rounded-xl p-4 space-y-2 relative">
                      <button
                        onClick={() => handleCopyText(analysisResult.extractedText)}
                        className="absolute top-3 right-3 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedText ? "Copied" : "Copy Raw Text"}
                      </button>
                      <pre className="text-[11px] text-white/70 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {analysisResult.extractedText}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
}
