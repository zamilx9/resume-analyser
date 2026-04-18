import { NextResponse } from "next/server";
import { analyzeResume } from "@/utils/atsScorer";
import { successResponse, errorResponse } from "@/utils/helpers";

export async function POST(req) {
  try {
    let requestData = {};
    try {
      requestData = await req.json();
    } catch (jsonError) {
      return NextResponse.json(
        errorResponse(null, "Invalid JSON in request body", 400),
        { status: 400 }
      );
    }
    
    const { resume, jobDescription, userDetails } = requestData;

    if (!resume || !jobDescription) {
      return NextResponse.json(
        errorResponse(400, "Resume and job description are required"),
        { status: 400 }
      );
    }

    // Analyze the base resume
    const analysis = analyzeResume(resume, jobDescription);

    // Extract keywords from job description
    const jobKeywords = extractKeywordsFromJD(jobDescription);

    // Extract keywords already in resume
    const resumeKeywords = extractKeywordsFromResume(resume);

    // Find missing keywords
    const missingKeywords = jobKeywords.filter(
      (keyword) =>
        !resumeKeywords.some((rk) => rk.toLowerCase() === keyword.toLowerCase())
    );

    // Generate tailored resume by reordering and emphasizing job-relevant content
    const tailoredResume = generateTailoredResume(
      resume,
      jobKeywords,
      resumeKeywords
    );

    // Calculate match percentage
    const matchPercentage = calculateMatchPercentage(jobKeywords, resumeKeywords);

    return NextResponse.json(
      successResponse({
        resumeText: tailoredResume,
        score: analysis.score,
        feedback: analysis.feedback,
        suggestedKeywords: missingKeywords,
        matchPercentage,
        matchedKeywords: resumeKeywords.filter((rk) =>
          jobKeywords.some((jk) => jk.toLowerCase() === rk.toLowerCase())
        ),
        jobKeywords,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in tailor endpoint:", error);
    return NextResponse.json(
      errorResponse(500, error.message || "Internal server error"),
      { status: 500 }
    );
  }
}

/**
 * Extract technical keywords from job description
 */
function extractKeywordsFromJD(jobDescription) {
  if (!jobDescription) return [];

  const technicalKeywords = [
    // Programming Languages
    "javascript",
    "python",
    "java",
    "csharp",
    "c#",
    "typescript",
    "go",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "scala",
    "r",
    "matlab",
    "perl",
    "clojure",

    // Frontend Frameworks
    "react",
    "vue",
    "angular",
    "svelte",
    "next.js",
    "nuxt",
    "gatsby",
    "tailwind",
    "bootstrap",
    "material-ui",
    "redux",
    "state management",

    // Backend Frameworks
    "node.js",
    "express",
    "django",
    "flask",
    "spring",
    "fastapi",
    "asp.net",
    "laravel",
    "rails",
    "nestjs",
    "fastify",

    // Databases
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "elasticsearch",
    "cassandra",
    "dynamodb",
    "firestore",
    "sql",
    "nosql",
    "database",

    // Cloud & DevOps
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "ci/cd",
    "jenkins",
    "gitlab",
    "github",
    "terraform",
    "ansible",
    "devops",

    // APIs & Tools
    "rest",
    "graphql",
    "soap",
    "websocket",
    "jwt",
    "oauth",
    "git",
    "api",
    "microservices",
    "grpc",
    "message queue",

    // Methodologies
    "agile",
    "scrum",
    "kanban",
    "tdd",
    "bdd",
    "ci/cd",
    "testing",
    "unit test",
    "integration test",
    "e2e test",

    // Additional technical terms
    "machine learning",
    "ai",
    "deep learning",
    "data science",
    "big data",
    "analytics",
    "performance optimization",
    "security",
    "authentication",
    "authorization",
  ];

  const descriptions = jobDescription.toLowerCase();
  const foundKeywords = new Set();

  technicalKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    if (regex.test(descriptions)) {
      foundKeywords.add(keyword.toLowerCase());
    }
  });

  return Array.from(foundKeywords);
}

/**
 * Extract keywords from resume text
 */
function extractKeywordsFromResume(resume) {
  if (!resume) return [];

  const technicalKeywords = [
    // Programming Languages
    "javascript",
    "python",
    "java",
    "csharp",
    "c#",
    "typescript",
    "go",
    "rust",
    "php",
    "ruby",
    "swift",
    "kotlin",
    "scala",
    "r",
    "matlab",
    "perl",
    "clojure",

    // Frontend Frameworks
    "react",
    "vue",
    "angular",
    "svelte",
    "next.js",
    "nuxt",
    "gatsby",
    "tailwind",
    "bootstrap",
    "material-ui",
    "redux",
    "state management",

    // Backend Frameworks
    "node.js",
    "express",
    "django",
    "flask",
    "spring",
    "fastapi",
    "asp.net",
    "laravel",
    "rails",
    "nestjs",
    "fastify",

    // Databases
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "elasticsearch",
    "cassandra",
    "dynamodb",
    "firestore",
    "sql",
    "nosql",
    "database",

    // Cloud & DevOps
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "ci/cd",
    "jenkins",
    "gitlab",
    "github",
    "terraform",
    "ansible",
    "devops",

    // APIs & Tools
    "rest",
    "graphql",
    "soap",
    "websocket",
    "jwt",
    "oauth",
    "git",
    "api",
    "microservices",
    "grpc",
    "message queue",

    // Methodologies
    "agile",
    "scrum",
    "kanban",
    "tdd",
    "bdd",
    "ci/cd",
    "testing",
    "unit test",
    "integration test",
    "e2e test",

    // Additional technical terms
    "machine learning",
    "ai",
    "deep learning",
    "data science",
    "big data",
    "analytics",
    "performance optimization",
    "security",
    "authentication",
    "authorization",
  ];

  const lowerResume = resume.toLowerCase();
  const foundKeywords = new Set();

  technicalKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    if (regex.test(lowerResume)) {
      foundKeywords.add(keyword.toLowerCase());
    }
  });

  return Array.from(foundKeywords);
}

/**
 * Generate tailored resume emphasizing job-relevant keywords
 */
function generateTailoredResume(resume, jobKeywords, resumeKeywords) {
  // Emphasize matching keywords in the resume
  let tailoredResume = resume;

  // Add a note at the top about tailoring
  const header = `RESUME TAILORED FOR JOB MATCH
Keyword Match: ${resumeKeywords.length}/${jobKeywords.length} technical skills found

---

`;

  // Highlight matched keywords in bold (using markdown-style or plain emphasis)
  jobKeywords.forEach((keyword) => {
    if (resumeKeywords.some((rk) => rk.toLowerCase() === keyword.toLowerCase())) {
      // Create case-insensitive replacement
      const regex = new RegExp(`\\b(${keyword})\\b`, "gi");
      tailoredResume = tailoredResume.replace(regex, "**$1**");
    }
  });

  // Add suggestions for missing keywords at the end
  const missingKeywords = jobKeywords.filter(
    (keyword) =>
      !resumeKeywords.some((rk) => rk.toLowerCase() === keyword.toLowerCase())
  );

  if (missingKeywords.length > 0) {
    tailoredResume +=
      "\n\n--- SUGGESTED SKILLS TO ADD ---\n" +
      missingKeywords.slice(0, 5).map((k) => `• ${k}`).join("\n");
  }

  return header + tailoredResume;
}

/**
 * Calculate match percentage between job requirements and resume
 */
function calculateMatchPercentage(jobKeywords, resumeKeywords) {
  if (jobKeywords.length === 0) return 0;

  const matches = jobKeywords.filter((keyword) =>
    resumeKeywords.some((rk) => rk.toLowerCase() === keyword.toLowerCase())
  ).length;

  return Math.round((matches / jobKeywords.length) * 100);
}
