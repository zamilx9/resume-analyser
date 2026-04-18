/**
 * ATS Score Calculator
 * Calculates resume ATS compatibility score (0-100)
 */

const ATS_WEIGHTS = {
  format: 10,
  keywords: 25,
  experience: 20,
  education: 15,
  skills: 15,
  contact: 5,
  structure: 10,
};

const COMMON_ATS_KEYWORDS = [
  // Technical Skills
  "javascript", "typescript", "python", "java", "c++", "c#", ".net",
  "react", "vue", "angular", "nodejs", "express", "django", "flask",
  "mongodb", "postgresql", "mysql", "oracle", "cassandra",
  "aws", "azure", "gcp", "docker", "kubernetes", "jenkins",
  "git", "gitlab", "github", "bitbucket", "ansible", "terraform",
  "rest api", "graphql", "microservices", "sql", "nosql", "etl",
  "apache spark", "hadoop", "kafka", "redis", "rabbitmq",
  "ci/cd", "devops", "cloud", "linux", "windows",

  // Soft Skills & Frameworks
  "agile", "scrum", "kanban", "jira", "confluence",
  "communication", "teamwork", "leadership", "problem solving",
  "analytical", "detail oriented", "time management", "project management",
  "cross-functional", "collaboration", "stakeholder management",

  // Experience Keywords (Action Verbs)
  "experience", "developed", "implemented", "designed", "managed", "led",
  "improved", "created", "built", "optimized", "architected", "automated",
  "launched", "delivered", "achieved", "increased", "reduced", "enhanced",
  "spearheaded", "pioneered", "orchestrated", "mentored", "trained",
  "collaborated", "coordinated", "streamlined", "accelerated",

  // Education Keywords
  "bachelor", "master", "phd", "degree", "diploma", "certification",
  "bootcamp", "coursework", "gpa", "cgpa", "university", "college",
  "honors", "distinction", "merit", "scholarship", "award",

  // Domain Keywords
  "full stack", "frontend", "backend", "database", "api", "web",
  "mobile", "iot", "machine learning", "ai", "data science",
  "business intelligence", "analytics", "automation", "security",
  "blockchain", "fintech", "healthcare", "ecommerce",
];

/**
 * Calculate format score - checks for proper structure
 */
function calculateFormatScore(resumeContent) {
  let score = 0;

  // Check for proper sections
  const sections = ["experience", "education", "skills", "contact"];
  const contentLower = resumeContent.toLowerCase();

  sections.forEach((section) => {
    if (contentLower.includes(section)) {
      score += ATS_WEIGHTS.format / sections.length;
    }
  });

  // Deduct for too much formatting that might confuse ATS
  const hasProblematicFormatting =
    contentLower.includes("<") || contentLower.includes("<!--");
  if (!hasProblematicFormatting) {
    score += 2; // Bonus for clean formatting
  }

  return Math.min(score, ATS_WEIGHTS.format);
}

/**
 * Calculate keyword match score
 */
function calculateKeywordScore(resumeContent, jobDescription = null) {
  let score = 0;
  const contentLower = resumeContent.toLowerCase();
  const keywordsToCheck = jobDescription
    ? extractKeywords(jobDescription)
    : COMMON_ATS_KEYWORDS;

  const matchedKeywords = keywordsToCheck.filter((keyword) =>
    contentLower.includes(keyword)
  );

  const matchPercentage = keywordsToCheck.length > 0
    ? (matchedKeywords.length / keywordsToCheck.length) * 100
    : 0;
  
  score = (matchPercentage / 100) * ATS_WEIGHTS.keywords;

  return {
    score: Math.min(score, ATS_WEIGHTS.keywords),
    matchPercentage: Math.round(matchPercentage),
    matchedCount: matchedKeywords.length,
    totalCount: keywordsToCheck.length,
    missingKeywords: keywordsToCheck.filter(kw => !contentLower.includes(kw)),
  };
}

/**
 * Calculate experience score
 */
function calculateExperienceScore(resumeContent) {
  let score = 0;
  const contentLower = resumeContent.toLowerCase();

  const experienceKeywords = [
    "developed",
    "implemented",
    "managed",
    "led",
    "designed",
    "created",
    "built",
    "improved",
    "optimized",
    "increased",
  ];

  const actionVerbs = experienceKeywords.filter((verb) =>
    contentLower.includes(verb)
  );

  // Count years of experience mentioned
  const yearsMatch = resumeContent.match(/(\d+)\s*(years?|yrs)/i);
  const yearsBonus = yearsMatch ? 3 : 0;

  score = Math.min((actionVerbs.length / experienceKeywords.length) * 18 + yearsBonus, ATS_WEIGHTS.experience);

  return score;
}

/**
 * Calculate education score
 */
function calculateEducationScore(resumeContent) {
  let score = 0;
  const contentLower = resumeContent.toLowerCase();

  const educationKeywords = [
    "bachelor",
    "master",
    "phd",
    "degree",
    "diploma",
    "certification",
  ];

  const hasEducation = educationKeywords.some((edu) =>
    contentLower.includes(edu)
  );

  // Check for university/institution name
  const hasInstitution = /[A-Z]{1}[a-z]+ (?:University|College|Institute)/g.test(
    resumeContent
  );

  // Check for graduation date
  const hasGradDate = /20\d{2}|(\d{4})/.test(resumeContent);

  if (hasEducation) score += ATS_WEIGHTS.education * 0.5;
  if (hasInstitution) score += ATS_WEIGHTS.education * 0.3;
  if (hasGradDate) score += ATS_WEIGHTS.education * 0.2;

  return Math.min(score, ATS_WEIGHTS.education);
}

/**
 * Calculate skills score
 */
function calculateSkillsScore(resumeContent) {
  let score = 0;
  const contentLower = resumeContent.toLowerCase();

  // Look for skills section
  const hasSkillsSection = /skills?[\s:]|technical skills/i.test(resumeContent);

  // Count number of distinct skills mentioned (basic heuristic)
  const skillMatches = resumeContent.match(/[A-Z][a-z\+\#\/]+/g);
  const skillCount = skillMatches ? skillMatches.length : 0;

  if (hasSkillsSection) score += ATS_WEIGHTS.skills * 0.5;
  if (skillCount > 10) score += ATS_WEIGHTS.skills * 0.5;

  return Math.min(score, ATS_WEIGHTS.skills);
}

/**
 * Calculate contact information score
 */
function calculateContactScore(resumeContent) {
  let score = 0;

  // Check for email
  const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(resumeContent);
  if (hasEmail) score += ATS_WEIGHTS.contact * 0.4;

  // Check for phone
  const hasPhone = /(\+\d{1,3}[-.\s]?)?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(
    resumeContent
  );
  if (hasPhone) score += ATS_WEIGHTS.contact * 0.3;

  // Check for LinkedIn/GitHub
  const hasLinks = /linkedin|github|portfolio|website/i.test(resumeContent);
  if (hasLinks) score += ATS_WEIGHTS.contact * 0.3;

  return Math.min(score, ATS_WEIGHTS.contact);
}

/**
 * Calculate structure score
 */
function calculateStructureScore(resumeContent) {
  let score = 0;

  // Check for bullet points
  const bulletPoints = resumeContent.match(/[-•*]\s+/g);
  if (bulletPoints && bulletPoints.length > 5) {
    score += ATS_WEIGHTS.structure * 0.3;
  }

  // Check for clear sections
  const sections = (resumeContent.match(/^[A-Z][A-Z\s]+$/gm) || []).length;
  if (sections > 3) {
    score += ATS_WEIGHTS.structure * 0.3;
  }

  // Check for reasonable length
  const wordCount = resumeContent.split(/\s+/).length;
  if (wordCount > 100 && wordCount < 1000) {
    score += ATS_WEIGHTS.structure * 0.4;
  }

  return Math.min(score, ATS_WEIGHTS.structure);
}

/**
 * Extract keywords from job description
 */
function extractKeywords(jobDescription) {
  if (!jobDescription) return COMMON_ATS_KEYWORDS;

  const jobLower = jobDescription.toLowerCase();
  return COMMON_ATS_KEYWORDS.filter((keyword) =>
    jobLower.includes(keyword)
  );
}

/**
 * Generate ATS suggestions
 */
export function generateATSSuggestions(resumeContent, score) {
  const suggestions = [];
  const contentLower = resumeContent.toLowerCase();

  // Format suggestions
  if (!contentLower.includes("education")) {
    suggestions.push("Add a dedicated Education section");
  }
  if (!contentLower.includes("experience")) {
    suggestions.push("Add a dedicated Experience section");
  }
  if (!contentLower.includes("skills")) {
    suggestions.push("Add a dedicated Skills section");
  }

  // Content suggestions
  if (!contentLower.match(/\+?\d+[-.\s]?\d{3}[-.\s]?\d{4}/)) {
    suggestions.push("Include your phone number in a clear format");
  }

  if (score < 50) {
    suggestions.push(
      "Use action verbs like 'Developed', 'Implemented', 'Managed' to start bullet points"
    );
  }

  if (score < 60) {
    suggestions.push(
      "Add more relevant technical skills and keywords from your industry"
    );
  }

  if (!contentLower.includes("linkedin") && !contentLower.includes("github")) {
    suggestions.push(
      "Include links to your LinkedIn or GitHub profile for credibility"
    );
  }

  // Structure suggestions
  const wordCount = resumeContent.split(/\s+/).length;
  if (wordCount < 100) {
    suggestions.push("Your resume seems too short; add more details about your achievements");
  } else if (wordCount > 1000) {
    suggestions.push("Your resume is too long; aim for 150-300 words per section");
  }

  return suggestions;
}

/**
 * Main function - Calculate complete ATS score
 */
export function calculateATSScore(resumeContent, jobDescription = null) {
  if (!resumeContent || typeof resumeContent !== "string") {
    return { score: 0, matchPercentage: 0, details: {} };
  }

  const keywordScoreData = calculateKeywordScore(resumeContent, jobDescription);
  
  const scores = {
    format: calculateFormatScore(resumeContent),
    keywords: keywordScoreData.score,
    experience: calculateExperienceScore(resumeContent),
    education: calculateEducationScore(resumeContent),
    skills: calculateSkillsScore(resumeContent),
    contact: calculateContactScore(resumeContent),
    structure: calculateStructureScore(resumeContent),
  };

  const totalScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0)
  );

  return {
    score: Math.min(Math.max(totalScore, 0), 100),
    matchPercentage: keywordScoreData.matchPercentage,
    details: scores,
    matchedKeywords: keywordScoreData.matchedCount,
    totalKeywords: keywordScoreData.totalCount,
    missingKeywords: keywordScoreData.missingKeywords,
  };
}

/**
 * Generate comprehensive ATS analysis
 */
export function analyzeResume(resumeContent, jobDescription = null) {
  const scoreData = calculateATSScore(resumeContent, jobDescription);
  const score = scoreData.score;
  const matchPercentage = scoreData.matchPercentage;
  
  const suggestions = generateATSSuggestions(resumeContent, score);

  // Extract what's missing
  const contentLower = resumeContent.toLowerCase();
  const missingKeywords = scoreData.missingKeywords || [];

  // Identify strengths
  const strengths = [];
  if (contentLower.includes("experience")) strengths.push("Clear experience section");
  if (contentLower.includes("skills")) strengths.push("Well-defined skills section");
  if (contentLower.includes("education")) strengths.push("Education details included");
  if (contentLower.match(/\+?\d+[-.\s]?\d{3}[-.\s]?\d{4}/))
    strengths.push("Contact information provided");

  return {
    score,
    matchPercentage,
    matchedKeywords: scoreData.matchedKeywords,
    totalKeywords: scoreData.totalKeywords,
    summary: `Your resume has an ATS score of ${score}/100. ${
      score >= 75
        ? "Excellent! Your resume is well-optimized for ATS."
        : score >= 50
          ? "Good! Your resume needs some improvements for better ATS compatibility."
          : "Your resume needs significant improvements for ATS compatibility."
    }`,
    strengths: strengths.length > 0 ? strengths : ["Review and optimize your resume"],
    improvements: suggestions,
    missingKeywords: missingKeywords.slice(0, 10),
  };
}
