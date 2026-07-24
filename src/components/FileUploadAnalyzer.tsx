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
  XCircle, 
  Eye, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  FileCode, 
  ExternalLink,
  Zap,
  Plus
} from "lucide-react";

interface FileUploadAnalyzerProps {
  profile: StudentProfile;
  callServerEndpoint: (endpoint: string, body: any) => Promise<any>;
  onUpdateProfile?: (updatedFields: Partial<StudentProfile>) => void;
  compactMode?: boolean;
}

export default function FileUploadAnalyzer({
  profile,
  callServerEndpoint,
  onUpdateProfile,
  compactMode = false,
}: FileUploadAnalyzerProps) {
  const [items, setItems] = useState<UploadedFileItem[]>([]);
  const [linkInput, setLinkInput] = useState<string>("");
  const [linkCategory, setLinkCategory] = useState<UploadedFileItem['category']>("portfolio_link");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<FileAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [showExtractedText, setShowExtractedText] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError(null);

    const filesArray = Array.from(e.target.files);
    const newItems: UploadedFileItem[] = [];

    for (const file of filesArray) {
      // Validate file size (< 15MB)
      if (file.size > 15 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 15MB limit. Please upload a smaller scan or image.`);
        continue;
      }

      let category: UploadedFileItem['category'] = "other";
      if (file.type.startsWith("image/")) {
        category = "resume_photo";
      } else if (file.type === "application/pdf") {
        category = "document_pdf";
      } else if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".doc") || file.name.endsWith(".docx")) {
        category = "document_pdf";
      }

      try {
        const base64Data = await readFileAsBase64(file);
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;

        newItems.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          base64Data,
          category,
          previewUrl,
        });
      } catch (err) {
        console.error("Failed to process file:", err);
        setError(`Failed to read "${file.name}". Please try uploading again.`);
      }
    }

    setItems((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkInput.trim()) return;

    let formattedUrl = linkInput.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
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
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAnalyzeItems = async () => {
    if (items.length === 0) {
      setError("Please attach at least one file (resume photo, document, transcript) or web link to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const data = await callServerEndpoint("/api/placement/analyze-file", {
        items,
        profile,
        targetRole: profile.targetRoles?.[0] || "Software Engineer",
      });

      setAnalysisResult(data);
    } catch (err: any) {
      console.error("Multimodal file analysis failed:", err);
      setError("Analysis failed. Please verify your files/links and network connection.");
    } finally {
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
    if (details.degree && !profile.degree) update.degree = details.degree;
    if (details.college && !profile.college) update.college = details.college;

    if (details.technicalSkills && details.technicalSkills.length > 0) {
      const mergedSkills = Array.from(new Set([...(profile.technicalSkills || []), ...details.technicalSkills]));
      update.technicalSkills = mergedSkills;
    }

    if (details.projects && details.projects.length > 0) {
      const projectStr = details.projects.join("; ");
      update.projects = profile.projects ? `${profile.projects}\n${projectStr}` : projectStr;
    }

    if (details.certifications && details.certifications.length > 0) {
      const certStr = details.certifications.join(", ");
      update.certifications = profile.certifications ? `${profile.certifications}, ${certStr}` : certStr;
    }

    onUpdateProfile(update);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
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
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" /> Multimodal File & Link Intelligence
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">Insert Files, Photographs & Links</h3>
            <p className="text-white/60 text-xs mt-1 max-w-xl leading-relaxed">
              Upload photographs of your resume, marksheets, certificates, or PDF/TXT files, or paste direct URLs (Portfolio, Drive, GitHub, LinkedIn). VORYNEXA AI performs deep OCR analysis to extract data and rate ATS readability.
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Link Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload File / Image Box */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <span className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" /> Upload File or Photo
              </span>
              <span className="text-[10px] text-white/40 font-mono">PDF, PNG, JPG, WEBP, TXT</span>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition-all bg-black/20 hover:bg-emerald-500/5 group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 text-white/60 group-hover:text-emerald-400 transition-colors">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                Click or Drag Photographs / Documents
              </p>
              <p className="text-[10px] text-white/40 mt-1">
                Upload scans of resume, marksheets, or certificates (Up to 15MB)
              </p>
              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                accept="image/*,application/pdf,.txt,.doc,.docx"
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
                <LinkIcon className="w-4 h-4 text-emerald-400" /> Insert Web Link
              </span>
              <span className="text-[10px] text-white/40 font-mono">PORTFOLIO / DRIVE / GITHUB</span>
            </div>

            <form onSubmit={handleAddLink} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono mb-1">
                  Link Type
                </label>
                <select
                  value={linkCategory}
                  onChange={(e) => setLinkCategory(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="portfolio_link">Personal Portfolio Website</option>
                  <option value="resume_photo">Google Drive / Hosted Resume PDF Link</option>
                  <option value="document_pdf">GitHub Repository / Code Link</option>
                  <option value="certificate_photo">LinkedIn Profile / Certificate Link</option>
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

      {/* Error Message */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* List of Attached Items */}
      {items.length > 0 && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Attached Items for Analysis ({items.length})
            </span>
            <button
              onClick={() => setItems([])}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-mono uppercase tracking-wider"
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
                  className="text-white/40 hover:text-rose-400 p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleAnalyzeItems}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Performing Multimodal OCR & AI Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Analyze Attached Files & Links with AI
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          
          {/* Header & Overall Scores */}
          <div className="border-b border-white/10 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-full font-mono mb-1">
                <CheckCircle2 className="w-3 h-3" /> Analysis Complete
              </div>
              <h4 className="text-base font-black text-white">{analysisResult.fileTypeDetected}</h4>
              <p className="text-xs text-white/50 font-mono mt-0.5">{analysisResult.overallVerdict}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.overallScore)}`}>
                <span className="text-[9px] uppercase tracking-widest block opacity-70">Overall Score</span>
                <span className="text-lg font-black">{analysisResult.overallScore}%</span>
              </div>
              <div className={`px-4 py-2 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.atsCompatibilityScore)}`}>
                <span className="text-[9px] uppercase tracking-widest block opacity-70">ATS Score</span>
                <span className="text-lg font-black">{analysisResult.atsCompatibilityScore}%</span>
              </div>
              <div className={`px-4 py-2 rounded-xl border font-mono text-center ${getScoreBadge(analysisResult.documentQualityScore)}`}>
                <span className="text-[9px] uppercase tracking-widest block opacity-70">Quality Score</span>
                <span className="text-lg font-black">{analysisResult.documentQualityScore}%</span>
              </div>
            </div>
          </div>

          {/* Extracted Details & Sync Button */}
          {analysisResult.extractedDetails && (
            <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs font-black text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Extracted Profile Information
                </span>
                {onUpdateProfile && (
                  <button
                    onClick={handleApplyExtractedToProfile}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {appliedSuccess ? (
                      <>
                        <Check className="w-3 h-3" /> Profile Synced!
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" /> Sync Data to Vorynexa Profile
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-white/80 font-mono">
                {analysisResult.extractedDetails.name && (
                  <div><span className="text-white/40">Name:</span> {analysisResult.extractedDetails.name}</div>
                )}
                {analysisResult.extractedDetails.degree && (
                  <div><span className="text-white/40">Degree:</span> {analysisResult.extractedDetails.degree}</div>
                )}
                {analysisResult.extractedDetails.college && (
                  <div><span className="text-white/40">College:</span> {analysisResult.extractedDetails.college}</div>
                )}
                {analysisResult.extractedDetails.technicalSkills && analysisResult.extractedDetails.technicalSkills.length > 0 && (
                  <div className="col-span-full">
                    <span className="text-white/40">Detected Skills:</span>{" "}
                    <span className="text-emerald-300 font-bold">{analysisResult.extractedDetails.technicalSkills.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Strengths vs Flaws */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Key Strengths */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-2">
              <h5 className="text-xs font-black text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Identified Strengths
              </h5>
              <ul className="space-y-1.5 text-xs text-white/80">
                {analysisResult.keyStrengths?.map((s, idx) => (
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
                <AlertTriangle className="w-4 h-4" /> Formatting Flaws & Red Flags
              </h5>
              <ul className="space-y-1.5 text-xs text-white/80">
                {analysisResult.criticalFlawsAndRisks?.map((f, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 shrink-0">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Keywords */}
          {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 && (
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
              <h5 className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileCode className="w-4 h-4" /> Critical Missing ATS Keywords
              </h5>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysisResult.missingKeywords.map((kw, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono rounded-lg">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ATS Bullet Improvements */}
          {analysisResult.atsBulletImprovements && analysisResult.atsBulletImprovements.length > 0 && (
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
              <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Recommended ATS Bullet Point Rewrites
              </h5>
              <div className="space-y-3">
                {analysisResult.atsBulletImprovements.map((bullet, idx) => (
                  <div key={idx} className="bg-[#181818] border border-white/5 rounded-xl p-3 space-y-2 text-xs">
                    <div className="text-rose-400/80 line-through">
                      <span className="font-mono text-[9px] uppercase text-rose-400 block font-bold">Original Draft</span>
                      "{bullet.before}"
                    </div>
                    <div className="text-emerald-300 font-bold">
                      <span className="font-mono text-[9px] uppercase text-emerald-400 block font-bold">ATS Optimized Rewrite</span>
                      "{bullet.after}"
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed font-mono italic">
                      Why: {bullet.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formatting & Action Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-2">
              <h5 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                Visual & Design Layout Recommendations
              </h5>
              <ul className="space-y-1.5 text-xs text-white/70 font-mono">
                {analysisResult.formattingSuggestions?.map((fs, idx) => (
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
                {analysisResult.recommendedActionableSteps?.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Toggle View OCR Extracted Text */}
          {analysisResult.extractedText && (
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="text-xs font-mono text-white/60 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> {showExtractedText ? "Hide Raw OCR Extracted Text" : "View Raw OCR Extracted Text"}
              </button>

              {showExtractedText && (
                <div className="mt-3 bg-black border border-white/10 rounded-xl p-4 space-y-2 relative">
                  <button
                    onClick={() => handleCopyText(analysisResult.extractedText)}
                    className="absolute top-3 right-3 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors"
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

        </div>
      )}

    </div>
  );
}
