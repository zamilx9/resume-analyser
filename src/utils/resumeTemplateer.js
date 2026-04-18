/**
 * Professional Resume Template Generator
 * Generates ATS-optimized resumes following Indian market standards
 */

/**
 * Generate professional career objective for freshers
 */
export function generateCareerObjective(userDetails, skills, education) {
  const { fullName, currentRole } = userDetails || {};
  
  if (!skills || skills.length === 0) {
    return "Seeking a challenging role to leverage my technical skills and contribute to organizational growth while continuous learning.";
  }

  // Extract degree from education
  let degreeType = "Graduate";
  if (education && education.length > 0) {
    const eduText = Array.isArray(education) ? education[0] : education;
    if (eduText.toLowerCase().includes("master")) degreeType = "Master's degree holder";
    else if (eduText.toLowerCase().includes("btechoral")) degreeType = "B.Tech graduate";
    else if (eduText.toLowerCase().includes("bca")) degreeType = "BCA graduate";
  }

  // Get top 3 skills
  const topSkills = Array.isArray(skills) 
    ? skills.filter(s => s && s.trim()).slice(0, 3).join(", ")
    : skills;

  const objectives = [
    `${degreeType} with hands-on experience in ${topSkills}. Proficient in building scalable solutions. Seeking a ${currentRole || "Full Stack"} role to deliver innovative solutions and drive technical excellence.`,
    
    `Motivated professional with expertise in ${topSkills}. Seeking to leverage technical prowess and problem-solving abilities to architect robust solutions and contribute to team success.`,
    
    `Passionate developer with strong foundation in ${topSkills}. Looking for challenging ${currentRole || "development"} position to apply skills in building high-performance applications.`,
    
    `Result-driven engineer with proficiency in ${topSkills}. Seeking opportunity to contribute to innovative projects while advancing technical expertise and delivering business value.`,
  ];

  return objectives[0];
}

/**
 * Format education section professionally
 */
function formatEducationSection(education, userDetails = {}) {
  if (!education || education.length === 0) return "";

  const eduArray = Array.isArray(education) ? education : [education];
  const formatted = eduArray
    .filter(e => e && e.trim())
    .map(edu => {
      // Try to enhance education entry with standard format
      const hasYear = /20\d{2}/.test(edu);
      const hasDegree = /bachelor|master|btech|bca|mca|phd|diploma|degree|engineering|commerce|science/i.test(edu);
      
      if (!hasYear && !edu.includes("–") && !edu.includes("-")) {
        return `• ${edu}`;
      }
      return `• ${edu}`;
    })
    .join("\n");

  return `EDUCATION:\n${formatted}`;
}

/**
 * Format skills section with categorization
 */
function formatSkillsSection(skills, jobDescription = "") {
  if (!skills || skills.length === 0) return "";

  const skillsArray = Array.isArray(skills) ? skills : skills.split("\n").filter(s => s.trim());
  
  // Categorize skills if possible
  const techSkills = [];
  const toolsSkills = [];
  const softSkills = [];

  const techKeywords = ["javascript", "python", "java", "react", "nodejs", "sql", "api", "aws", "docker", "kubernetes", "c++", "typescript", "angular", "vue"];
  const toolsKeywords = ["git", "jira", "linux", "jenkins", "docker", "aws", "azure", "mongodb", "postgresql", "mysql"];
  const softKeywords = ["communication", "leadership", "teamwork", "problem solving", "agile", "project management", "analytical"];

  skillsArray.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (techKeywords.some(kw => skillLower.includes(kw))) {
      techSkills.push(skill);
    } else if (toolsKeywords.some(kw => skillLower.includes(kw))) {
      toolsSkills.push(skill);
    } else if (softKeywords.some(kw => skillLower.includes(kw))) {
      softSkills.push(skill);
    } else {
      techSkills.push(skill);
    }
  });

  let skillsText = "TECHNICAL SKILLS:\n";
  
  if (techSkills.length > 0) {
    skillsText += `Languages & Frameworks: ${techSkills.join(", ")}\n`;
  }
  
  if (toolsSkills.length > 0) {
    skillsText += `Tools & Platforms: ${toolsSkills.join(", ")}\n`;
  }
  
  if (softSkills.length > 0) {
    skillsText += `Core Competencies: ${softSkills.join(", ")}\n`;
  }

  return skillsText;
}

/**
 * Format certifications section
 */
function formatCertificationsSection(certifications) {
  if (!certifications || certifications.length === 0) return "";

  const certArray = Array.isArray(certifications) ? certifications : [certifications];
  const formatted = certArray
    .filter(c => c && c.trim())
    .map(cert => `• ${cert}`)
    .join("\n");

  return formatted.length > 0 ? `CERTIFICATIONS:\n${formatted}` : "";
}

/**
 * Generate professional ATS-optimized resume
 */
export function generateProfessionalResume(userDetails, education, skills, certifications = []) {
  const {
    fullName = "",
    email = "",
    phone = "",
    location = "",
    linkedIn = "",
    github = "",
    careerObjective = "",
  } = userDetails || {};

  if (!fullName || !email || !phone) {
    return "Error: Full Name, Email, and Phone are required to generate resume.";
  }

  // Build header with centered alignment
  let resume = "";
  
  // Calculate max width for centering (80 characters typical resume width)
  const maxWidth = 80;
  
  // Add metadata for styling (will be processed by UI component)
  resume += "<<<HEADER_START>>>\n";
  
  // Centered Name (bold marker added for UI styling)
  const nameUpperCase = fullName.toUpperCase();
  const nameSpaces = Math.max(0, Math.floor((maxWidth - nameUpperCase.length) / 2));
  resume += " ".repeat(nameSpaces) + "***" + nameUpperCase + "***\n";
  
  // City and Country centered (directly below name)
  if (location) {
    const locationSpaces = Math.max(0, Math.floor((maxWidth - location.length) / 2));
    resume += " ".repeat(locationSpaces) + "___" + location + "___\n";
  }

  resume += "\n";
  
  // Contact Information (formatted nicely)
  const contactParts = [];
  if (email) contactParts.push(`E-mail: ${email}`);
  if (phone) contactParts.push(`Mobile number: ${phone}`);
  if (linkedIn) contactParts.push(`LinkedIn: ${linkedIn}`);
  if (github) contactParts.push(`GitHub: ${github}`);

  if (contactParts.length > 0) {
    const contactStr = contactParts.join(" | ");
    const contactSpaces = Math.max(0, Math.floor((maxWidth - contactStr.length) / 2));
    resume += " ".repeat(contactSpaces) + contactStr + "\n";
  }
  
  resume += "<<<HEADER_END>>>\n\n";

  // Career Objective
  const objective = careerObjective || generateCareerObjective(userDetails, skills, education);
  if (objective) {
    resume += "CAREER OBJECTIVE\n";
    resume += objective + "\n\n";
  }

  // Technical Skills
  const skillsSection = formatSkillsSection(skills);
  if (skillsSection) {
    resume += skillsSection + "\n";
  }

  // Education
  const eduSection = formatEducationSection(education, userDetails);
  if (eduSection) {
    resume += eduSection + "\n\n";
  }

  // Certifications
  const certSection = formatCertificationsSection(certifications);
  if (certSection) {
    resume += certSection + "\n\n";
  }

  return resume.trim();
}

/**
 * Tailor resume for specific job description
 */
export function tailorResumeForJob(resumeContent, jobDescription, userDetails) {
  if (!jobDescription || jobDescription.trim().length === 0) {
    return resumeContent;
  }

  const jobDescLower = jobDescription.toLowerCase();
  let tailoredResume = resumeContent;

  // Extract key job requirements
  const jobKeywords = extractJobKeywords(jobDescription);
  
  // Move matching skills to the top
  const skillsStartIdx = tailoredResume.indexOf("TECHNICAL SKILLS:");
  const skillsEndIdx = tailoredResume.indexOf("\n\n", skillsStartIdx);

  if (skillsStartIdx !== -1) {
    const skillsSection = tailoredResume.substring(skillsStartIdx, skillsEndIdx);
    const lines = skillsSection.split("\n");
    
    // Reorder skills to highlight job-relevant ones first
    const reorderedLines = reorderSkillsByRelevance(lines, jobKeywords);
    tailoredResume = tailoredResume.substring(0, skillsStartIdx) + 
                     reorderedLines.join("\n") + 
                     tailoredResume.substring(skillsEndIdx);
  }

  // Update career objective to match job role
  const roleMatch = jobDescription.match(/(?:role|position|title)[:\s]+([^.\n]+)/i);
  if (roleMatch) {
    const targetRole = roleMatch[1].trim();
    const objectiveStartIdx = tailoredResume.indexOf("CAREER OBJECTIVE:");
    const objectiveEndIdx = tailoredResume.indexOf("\n\n", objectiveStartIdx + 17);
    
    if (objectiveStartIdx !== -1 && objectiveEndIdx !== -1) {
      const currentObjective = tailoredResume.substring(objectiveStartIdx + 17, objectiveEndIdx).trim();
      const tailoredObjective = currentObjective.replace(/(?:Full Stack|development|role)/i, targetRole);
      
      tailoredResume = tailoredResume.substring(0, objectiveStartIdx) + 
                      "CAREER OBJECTIVE:\n" + tailoredObjective + 
                      tailoredResume.substring(objectiveEndIdx);
    }
  }

  return tailoredResume;
}

/**
 * Extract important job keywords from job description
 */
function extractJobKeywords(jobDescription) {
  const keywords = [];
  const patterns = [
    /(?:required|must have|skills?)[:\s]+([^.\n]+)/gi,
    /(?:experience with)[:\s]+([^.\n]+)/gi,
    /(?:proficient in)[:\s]+([^.\n]+)/gi,
    /(?:expertise in)[:\s]+([^.\n]+)/gi,
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(jobDescription)) !== null) {
      const skills = match[1].split(",").map(s => s.trim());
      keywords.push(...skills);
    }
  });

  return [...new Set(keywords)];
}

/**
 * Reorder skills by relevance to job
 */
function reorderSkillsByRelevance(skillLines, jobKeywords) {
  const relevantSkills = [];
  const otherSkills = [];

  skillLines.forEach(line => {
    let isRelevant = false;
    jobKeywords.forEach(keyword => {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        isRelevant = true;
      }
    });

    if (line.includes("TECHNICAL SKILLS:") || line.trim() === "") {
      // Keep header and empty lines
    } else if (isRelevant) {
      relevantSkills.push(line);
    } else {
      otherSkills.push(line);
    }
  });

  return [skillLines[0], ...relevantSkills, ...otherSkills];
}

/**
 * Calculate keyword density in resume
 */
export function calculateKeywordDensity(resumeContent, keywords) {
  if (!keywords || keywords.length === 0) return 0;

  const contentLower = resumeContent.toLowerCase();
  let totalMatches = 0;

  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "gi");
    const matches = contentLower.match(regex);
    totalMatches += matches ? matches.length : 0;
  });

  const wordCount = resumeContent.split(/\s+/).length;
  return wordCount > 0 ? Math.min((totalMatches / wordCount) * 100, 100) : 0;
}
