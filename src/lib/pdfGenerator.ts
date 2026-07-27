import { jsPDF } from "jspdf";

export interface ResumePdfData {
  candidateInfo: {
    name: string;
    targetRole: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    githubOrPortfolio?: string;
  };
  styleTemplate?: "Modern" | "Corporate" | "Minimal" | "Executive" | "Academic" | "Research" | "Creative";
  pageBudgetMode?: "1-Page Strict" | "2-Page Executive" | "Auto-Fit";
  professionalSummary?: string;
  skillsGrouped?: {
    languages?: string[];
    frameworksAndTools?: string[];
    coreEngineering?: string[];
    softSkills?: string[];
  };
  experienceAndProjects?: {
    title: string;
    roleOrCategory: string;
    period?: string;
    location?: string;
    bullets: string[];
  }[];
  educationDetails?: {
    institution: string;
    degree: string;
    graduationYear: string;
    highlights?: string[];
  }[];
  certifications?: {
    name: string;
    issuingBody: string;
    year?: string;
  }[];
}

interface RenderSettings {
  fontSizeTitle: number;
  fontSizeSubTitle: number;
  fontSizeSectionHeading: number;
  fontSizeBody: number;
  fontSizeSmall: number;
  lineHeightFactor: number;
  sectionMargin: number;
  itemMargin: number;
  fontFamily: "helvetica" | "times" | "courier";
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  bodyTextColor: [number, number, number];
}

/**
 * Enterprise Vector PDF Generator
 * Produces recruiter-ready, ATS-compliant, 100% selectable vector PDFs with zero layout shift.
 */
export function generateProfessionalResumePdf(data: ResumePdfData): jsPDF {
  // Page Size: Standard A4 (210mm x 297mm) -> 595.28 x 841.89 points
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89
  const marginX = 36; // 0.5 inch margin
  const marginY = 36;
  const contentWidth = pageWidth - marginX * 2; // 523.28

  const templateStyle = data.styleTemplate || "Modern";
  const pageBudget = data.pageBudgetMode || "1-Page Strict";

  // Base font family and colors by template
  let fontFamily: "helvetica" | "times" | "courier" = "helvetica";
  let primaryColor: [number, number, number] = [15, 23, 42]; // Slate-900
  let secondaryColor: [number, number, number] = [30, 58, 138]; // Blue-900
  let bodyTextColor: [number, number, number] = [51, 65, 85]; // Slate-700

  if (templateStyle === "Corporate" || templateStyle === "Academic" || templateStyle === "Research") {
    fontFamily = "times";
    primaryColor = [17, 24, 39]; // Gray-900
    secondaryColor = [31, 41, 55]; // Gray-800
  } else if (templateStyle === "Executive") {
    fontFamily = "helvetica";
    primaryColor = [180, 83, 9]; // Amber-700
    secondaryColor = [15, 23, 42];
  } else if (templateStyle === "Creative") {
    fontFamily = "helvetica";
    primaryColor = [67, 56, 202]; // Indigo-700
    secondaryColor = [30, 27, 75];
  } else if (templateStyle === "Minimal") {
    fontFamily = "helvetica";
    primaryColor = [31, 41, 55];
    secondaryColor = [75, 85, 99];
  }

  // Initial sizing params
  let settings: RenderSettings = {
    fontSizeTitle: 20,
    fontSizeSubTitle: 11,
    fontSizeSectionHeading: 12,
    fontSizeBody: 9.5,
    fontSizeSmall: 8.5,
    lineHeightFactor: 1.3,
    sectionMargin: 12,
    itemMargin: 6,
    fontFamily,
    primaryColor,
    secondaryColor,
    bodyTextColor,
  };

  // Measure content height function to test fit
  const measureTotalHeight = (stg: RenderSettings): number => {
    let y = marginY;

    // Header height
    y += stg.fontSizeTitle + 4;
    y += stg.fontSizeSubTitle + 12;

    // Summary
    if (data.professionalSummary) {
      y += stg.fontSizeSectionHeading + stg.sectionMargin;
      doc.setFont(stg.fontFamily, "normal");
      doc.setFontSize(stg.fontSizeBody);
      const lines = doc.splitTextToSize(data.professionalSummary, contentWidth);
      y += lines.length * (stg.fontSizeBody * stg.lineHeightFactor) + 6;
    }

    // Skills
    if (data.skillsGrouped) {
      y += stg.fontSizeSectionHeading + stg.sectionMargin;
      const skillsArr = [
        ...(data.skillsGrouped.languages || []),
        ...(data.skillsGrouped.frameworksAndTools || []),
        ...(data.skillsGrouped.coreEngineering || []),
      ];
      if (skillsArr.length > 0) {
        doc.setFont(stg.fontFamily, "normal");
        doc.setFontSize(stg.fontSizeBody);
        const text = skillsArr.join(" • ");
        const lines = doc.splitTextToSize(text, contentWidth);
        y += lines.length * (stg.fontSizeBody * stg.lineHeightFactor) + 6;
      }
    }

    // Experience & Projects
    if (data.experienceAndProjects && data.experienceAndProjects.length > 0) {
      y += stg.fontSizeSectionHeading + stg.sectionMargin;
      for (const item of data.experienceAndProjects) {
        y += stg.fontSizeBody + stg.itemMargin;
        for (const bullet of item.bullets) {
          doc.setFont(stg.fontFamily, "normal");
          doc.setFontSize(stg.fontSizeBody);
          const bLines = doc.splitTextToSize(`•  ${bullet}`, contentWidth - 12);
          y += bLines.length * (stg.fontSizeBody * stg.lineHeightFactor) + 2;
        }
        y += 4;
      }
    }

    // Education
    if (data.educationDetails && data.educationDetails.length > 0) {
      y += stg.fontSizeSectionHeading + stg.sectionMargin;
      for (const edu of data.educationDetails) {
        y += stg.fontSizeBody + stg.itemMargin + 4;
      }
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
      y += stg.fontSizeSectionHeading + stg.sectionMargin;
      y += data.certifications.length * (stg.fontSizeBody + 4);
    }

    return y;
  };

  // If 1-Page Strict mode, compress font & margins if total height > 1 page (841.89 - marginY)
  const maxAllowedPage1Height = pageHeight - marginY - 20;

  if (pageBudget === "1-Page Strict") {
    let currentEstHeight = measureTotalHeight(settings);
    if (currentEstHeight > maxAllowedPage1Height) {
      // Step 1: Reduce margins
      settings.sectionMargin = 8;
      settings.itemMargin = 4;
      settings.fontSizeTitle = 18;
      currentEstHeight = measureTotalHeight(settings);
    }
    if (currentEstHeight > maxAllowedPage1Height) {
      // Step 2: Reduce body font size to 9pt
      settings.fontSizeBody = 9;
      settings.fontSizeSmall = 8;
      settings.lineHeightFactor = 1.25;
      currentEstHeight = measureTotalHeight(settings);
    }
    if (currentEstHeight > maxAllowedPage1Height) {
      // Step 3: Tighten to 8.5pt
      settings.fontSizeBody = 8.5;
      settings.fontSizeSectionHeading = 11;
      settings.sectionMargin = 6;
      settings.itemMargin = 3;
      settings.lineHeightFactor = 1.2;
    }
  }

  // --- ACTUAL RENDER PASS ---
  let yPos = marginY;
  let currentPage = 1;

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - marginY) {
      if (pageBudget === "1-Page Strict" && currentPage === 1) {
        // Force stay on page 1 if strict 1-page budget
        return;
      }
      doc.addPage();
      currentPage++;
      yPos = marginY + 15;
      // Running header for Page 2+
      doc.setFont(settings.fontFamily, "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${data.candidateInfo.name} — ${data.candidateInfo.targetRole} (Page ${currentPage})`, marginX, yPos);
      yPos += 15;
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, yPos, pageWidth - marginX, yPos);
      yPos += 12;
    }
  };

  // 1. HEADER SECTION
  if (templateStyle === "Executive") {
    // Top banner block
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 0, pageWidth, 70, "F");
    doc.setFont(settings.fontFamily, "bold");
    doc.setFontSize(settings.fontSizeTitle + 2);
    doc.setTextColor(251, 191, 36); // Amber-400
    doc.text(data.candidateInfo.name.toUpperCase(), marginX, 32);

    doc.setFont(settings.fontFamily, "normal");
    doc.setFontSize(settings.fontSizeSubTitle);
    doc.setTextColor(241, 245, 249);
    doc.text(data.candidateInfo.targetRole, marginX, 52);

    yPos = 85;

    // Contact info bar
    const contactParts = [
      data.candidateInfo.email,
      data.candidateInfo.phone,
      data.candidateInfo.location,
      data.candidateInfo.linkedIn,
    ].filter(Boolean);

    doc.setFont(settings.fontFamily, "normal");
    doc.setFontSize(settings.fontSizeSmall);
    doc.setTextColor(...settings.bodyTextColor);
    doc.text(contactParts.join("  |  "), marginX, yPos);
    yPos += 15;
  } else if (templateStyle === "Creative") {
    // Left border accent
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(marginX, marginY, 4, 45, "F");

    doc.setFont(settings.fontFamily, "bold");
    doc.setFontSize(settings.fontSizeTitle);
    doc.setTextColor(30, 27, 75);
    doc.text(data.candidateInfo.name, marginX + 12, yPos + 18);

    doc.setFont(settings.fontFamily, "bold");
    doc.setFontSize(settings.fontSizeSubTitle);
    doc.setTextColor(79, 70, 229);
    doc.text(data.candidateInfo.targetRole, marginX + 12, yPos + 34);

    const contactStr = [
      data.candidateInfo.email,
      data.candidateInfo.phone,
      data.candidateInfo.location,
    ].filter(Boolean).join(" • ");

    doc.setFont(settings.fontFamily, "normal");
    doc.setFontSize(settings.fontSizeSmall);
    doc.setTextColor(100, 116, 139);
    doc.text(contactStr, marginX + 12, yPos + 48);

    yPos += 60;
  } else {
    // Standard / Modern / Corporate
    doc.setFont(settings.fontFamily, "bold");
    doc.setFontSize(settings.fontSizeTitle);
    doc.setTextColor(...settings.primaryColor);
    doc.text(data.candidateInfo.name.toUpperCase(), marginX, yPos + 16);
    yPos += 22;

    doc.setFont(settings.fontFamily, "bold");
    doc.setFontSize(settings.fontSizeSubTitle);
    doc.setTextColor(...settings.secondaryColor);
    doc.text(data.candidateInfo.targetRole, marginX, yPos + 10);
    yPos += 16;

    const contactParts = [
      data.candidateInfo.email,
      data.candidateInfo.phone,
      data.candidateInfo.location,
      data.candidateInfo.linkedIn,
      data.candidateInfo.githubOrPortfolio,
    ].filter(Boolean);

    doc.setFont(settings.fontFamily, "normal");
    doc.setFontSize(settings.fontSizeSmall);
    doc.setTextColor(...settings.bodyTextColor);
    doc.text(contactParts.join("   |   "), marginX, yPos + 8);
    yPos += 18;

    // Divider Line
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.75);
    doc.line(marginX, yPos, pageWidth - marginX, yPos);
    yPos += 12;
  }

  // Section Heading Helper
  const renderSectionHeading = (title: string) => {
    checkPageBreak(settings.fontSizeSectionHeading + settings.sectionMargin + 10);
    doc.setFont(settings.fontFamily, "bold");
    doc.setFontSize(settings.fontSizeSectionHeading);
    doc.setTextColor(...settings.primaryColor);
    doc.text(title.toUpperCase(), marginX, yPos + 10);
    yPos += 14;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(marginX, yPos, pageWidth - marginX, yPos);
    yPos += settings.sectionMargin;
  };

  // 2. PROFESSIONAL SUMMARY
  if (data.professionalSummary) {
    renderSectionHeading("Professional Summary");
    doc.setFont(settings.fontFamily, "normal");
    doc.setFontSize(settings.fontSizeBody);
    doc.setTextColor(...settings.bodyTextColor);

    const summaryLines = doc.splitTextToSize(data.professionalSummary, contentWidth);
    for (const line of summaryLines) {
      checkPageBreak(settings.fontSizeBody * settings.lineHeightFactor);
      doc.text(line, marginX, yPos);
      yPos += settings.fontSizeBody * settings.lineHeightFactor;
    }
    yPos += 6;
  }

  // 3. CORE SKILLS MATRIX
  if (data.skillsGrouped) {
    renderSectionHeading("Core Skills & Technical Competencies");
    doc.setFont(settings.fontFamily, "normal");
    doc.setFontSize(settings.fontSizeBody);

    const renderSkillRow = (label: string, list?: string[]) => {
      if (!list || list.length === 0) return;
      checkPageBreak(settings.fontSizeBody * settings.lineHeightFactor + 4);
      doc.setFont(settings.fontFamily, "bold");
      doc.setTextColor(...settings.primaryColor);
      doc.text(`${label}: `, marginX, yPos);

      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.setFont(settings.fontFamily, "normal");
      doc.setTextColor(...settings.bodyTextColor);

      const valueText = list.join(", ");
      const valueLines = doc.splitTextToSize(valueText, contentWidth - labelWidth);

      if (valueLines.length > 0) {
        doc.text(valueLines[0], marginX + labelWidth, yPos);
        yPos += settings.fontSizeBody * settings.lineHeightFactor;
        for (let i = 1; i < valueLines.length; i++) {
          checkPageBreak(settings.fontSizeBody * settings.lineHeightFactor);
          doc.text(valueLines[i], marginX + 10, yPos);
          yPos += settings.fontSizeBody * settings.lineHeightFactor;
        }
      }
    };

    renderSkillRow("Core Competencies", data.skillsGrouped.languages);
    renderSkillRow("Tools & Software", data.skillsGrouped.frameworksAndTools);
    renderSkillRow("Domain Methodologies", data.skillsGrouped.coreEngineering);
    renderSkillRow("Key Soft Skills", data.skillsGrouped.softSkills);
    yPos += 6;
  }

  // 4. EXPERIENCE & PROJECTS
  if (data.experienceAndProjects && data.experienceAndProjects.length > 0) {
    renderSectionHeading("Professional Experience & High-Impact Projects");

    for (const proj of data.experienceAndProjects) {
      checkPageBreak(settings.fontSizeBody + 16);

      // Title & Category Header Line
      doc.setFont(settings.fontFamily, "bold");
      doc.setFontSize(settings.fontSizeBody + 0.5);
      doc.setTextColor(...settings.primaryColor);
      doc.text(proj.title, marginX, yPos);

      if (proj.roleOrCategory) {
        doc.setFont(settings.fontFamily, "italic");
        doc.setFontSize(settings.fontSizeSmall);
        doc.setTextColor(100, 116, 139);
        const catWidth = doc.getTextWidth(proj.roleOrCategory);
        doc.text(proj.roleOrCategory, pageWidth - marginX - catWidth, yPos);
      }
      yPos += settings.fontSizeBody + 3;

      // Bullets
      doc.setFont(settings.fontFamily, "normal");
      doc.setFontSize(settings.fontSizeBody);
      doc.setTextColor(...settings.bodyTextColor);

      for (const bullet of proj.bullets) {
        const bulletIndent = 12;
        const bulletLines = doc.splitTextToSize(bullet, contentWidth - bulletIndent);

        checkPageBreak(bulletLines.length * (settings.fontSizeBody * settings.lineHeightFactor));

        // Draw bullet point dot
        doc.setFillColor(...settings.secondaryColor);
        doc.circle(marginX + 4, yPos - 3, 1.5, "F");

        for (let i = 0; i < bulletLines.length; i++) {
          doc.text(bulletLines[i], marginX + bulletIndent, yPos);
          yPos += settings.fontSizeBody * settings.lineHeightFactor;
        }
      }
      yPos += settings.itemMargin;
    }
    yPos += 4;
  }

  // 5. EDUCATION
  if (data.educationDetails && data.educationDetails.length > 0) {
    renderSectionHeading("Education & Credentials");

    for (const edu of data.educationDetails) {
      checkPageBreak(settings.fontSizeBody + 10);
      doc.setFont(settings.fontFamily, "bold");
      doc.setFontSize(settings.fontSizeBody);
      doc.setTextColor(...settings.primaryColor);
      doc.text(`${edu.degree} — ${edu.institution}`, marginX, yPos);

      if (edu.graduationYear) {
        doc.setFont(settings.fontFamily, "normal");
        doc.setFontSize(settings.fontSizeSmall);
        doc.setTextColor(100, 116, 139);
        const yrWidth = doc.getTextWidth(edu.graduationYear);
        doc.text(edu.graduationYear, pageWidth - marginX - yrWidth, yPos);
      }
      yPos += settings.fontSizeBody + 4;
    }
  }

  // 6. CERTIFICATIONS
  if (data.certifications && data.certifications.length > 0) {
    yPos += 4;
    renderSectionHeading("Certifications & Accreditation");

    for (const cert of data.certifications) {
      checkPageBreak(settings.fontSizeBody + 8);
      doc.setFont(settings.fontFamily, "bold");
      doc.setFontSize(settings.fontSizeBody);
      doc.setTextColor(...settings.primaryColor);
      doc.text(`• ${cert.name}`, marginX, yPos);

      doc.setFont(settings.fontFamily, "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(` (${cert.issuingBody}${cert.year ? ` - ${cert.year}` : ""})`, marginX + doc.getTextWidth(`• ${cert.name}`), yPos);

      yPos += settings.fontSizeBody + 4;
    }
  }

  // PAGE FOOTER NUMBERING
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont(settings.fontFamily, "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `Vorynexa Universal Resume System  |  Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );
  }

  return doc;
}

export interface ResumeSuggestionsPdfData {
  candidateName: string;
  targetRole: string;
  atsScore?: number;
  atsBreakdown?: {
    keywordMatchScore?: number;
    readabilityScore?: number;
    impactQuantification?: number;
    sectionsCompleteness?: number;
  };
  suggestedHeadline?: string;
  suggestedAboutSection?: string;
  bulletRewrites?: {
    before: string;
    after: string;
    explanation?: string;
  }[];
  topExtractedKeywords?: string[];
  missingKeywords?: string[];
  actionableSteps?: string[];
}

export function generateResumeSuggestionsPdf(data: ResumeSuggestionsPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 36;
  const marginY = 36;
  const contentWidth = pageWidth - marginX * 2;
  let yPos = marginY;

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - marginY - 20) {
      doc.addPage();
      yPos = marginY;
    }
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate banner
  doc.rect(marginX, yPos, contentWidth, 54, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("VORYNEXA CAREER AI - RESUME OPTIMIZATION REPORT", marginX + 16, yPos + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(`Candidate: ${data.candidateName}  |  Target Role: ${data.targetRole}`, marginX + 16, yPos + 42);

  yPos += 70;

  // ATS Score Overview Box
  if (data.atsScore !== undefined) {
    checkPageBreak(50);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginX, yPos, contentWidth, 44, 4, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`Overall ATS Readiness Grade: ${data.atsScore}%`, marginX + 14, yPos + 18);

    if (data.atsBreakdown) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const subScores = [
        `Keywords: ${data.atsBreakdown.keywordMatchScore ?? 80}%`,
        `Readability: ${data.atsBreakdown.readabilityScore ?? 85}%`,
        `Impact Quantification: ${data.atsBreakdown.impactQuantification ?? 78}%`,
      ].join("  •  ");
      doc.text(subScores, marginX + 14, yPos + 33);
    }

    yPos += 56;
  }

  // Recommended Headline
  if (data.suggestedHeadline) {
    checkPageBreak(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("RECOMMENDED LINKEDIN & RESUME HEADLINE", marginX, yPos);
    yPos += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const splitHeadline = doc.splitTextToSize(data.suggestedHeadline, contentWidth - 10);
    doc.text(splitHeadline, marginX, yPos);
    yPos += splitHeadline.length * 13 + 12;
  }

  // Bullet Rewrites
  if (data.bulletRewrites && data.bulletRewrites.length > 0) {
    checkPageBreak(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("HIGH-IMPACT ATS BULLET POINT REWRITES", marginX, yPos);
    yPos += 16;

    for (const [idx, item] of data.bulletRewrites.entries()) {
      checkPageBreak(80);

      // Original line
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(225, 29, 72); // Rose
      doc.text(`Original (${idx + 1}):`, marginX, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      const originalLines = doc.splitTextToSize(item.before, contentWidth - 70);
      doc.text(originalLines, marginX + 65, yPos);
      yPos += originalLines.length * 12 + 4;

      // Optimized line
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129); // Emerald
      doc.text(`Optimized (${idx + 1}):`, marginX, yPos);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      const optimizedLines = doc.splitTextToSize(item.after, contentWidth - 70);
      doc.text(optimizedLines, marginX + 65, yPos);
      yPos += optimizedLines.length * 12 + 4;

      if (item.explanation) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const expLines = doc.splitTextToSize(`Why: ${item.explanation}`, contentWidth - 65);
        doc.text(expLines, marginX + 65, yPos);
        yPos += expLines.length * 10 + 6;
      }

      yPos += 8;
    }
  }

  // Keywords Section
  if ((data.topExtractedKeywords && data.topExtractedKeywords.length > 0) || (data.missingKeywords && data.missingKeywords.length > 0)) {
    checkPageBreak(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("KEYWORD ANALYSIS & TARGETING", marginX, yPos);
    yPos += 14;

    if (data.topExtractedKeywords && data.topExtractedKeywords.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129);
      doc.text("Matched Keywords: ", marginX, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const kwText = doc.splitTextToSize(data.topExtractedKeywords.join(", "), contentWidth - 110);
      doc.text(kwText, marginX + 105, yPos);
      yPos += kwText.length * 12 + 6;
    }

    if (data.missingKeywords && data.missingKeywords.length > 0) {
      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(225, 29, 72);
      doc.text("Missing Keywords: ", marginX, yPos);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const mkwText = doc.splitTextToSize(data.missingKeywords.join(", "), contentWidth - 110);
      doc.text(mkwText, marginX + 105, yPos);
      yPos += mkwText.length * 12 + 6;
    }
  }

  // Actionable Steps
  if (data.actionableSteps && data.actionableSteps.length > 0) {
    checkPageBreak(40);
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("ACTIONABLE NEXT STEPS", marginX, yPos);
    yPos += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    for (const step of data.actionableSteps) {
      checkPageBreak(20);
      const stepLines = doc.splitTextToSize(`• ${step}`, contentWidth - 10);
      doc.text(stepLines, marginX, yPos);
      yPos += stepLines.length * 12 + 4;
    }
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Vorynexa Career Intelligence  |  Resume Optimization Report  |  Page ${p} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: "center" }
    );
  }

  return doc;
}

