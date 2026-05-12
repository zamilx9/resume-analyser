import { NextResponse } from "next/server";
import { analyzeResume } from "@/utils/atsScorer";
import { successResponse, errorResponse } from "@/utils/helpers";
import { generateJobFocusedCareerObjective, generateTailoredResumeWithJobKeywords } from "@/utils/resumeTemplateer";

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

    // Extract keywords from job description
    const jobKeywords = extractKeywordsFromJD(jobDescription);

    // Extract keywords already in resume
    const resumeKeywords = extractKeywordsFromResume(resume);

    // Find missing keywords using actual resume text presence instead of only extracted keywords
    const resumeLower = resume.toLowerCase();
    const missingKeywords = jobKeywords.filter((keyword) => {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      return !regex.test(resumeLower);
    });

    // Generate job-focused career objective
    const jobFocusedObjective = generateJobFocusedCareerObjective(
      jobDescription,
      jobKeywords,
      userDetails
    );

    // Generate tailored resume with job keywords and new career objective
    const tailoredResume = generateTailoredResumeWithJobKeywords(
      resume,
      jobKeywords,
      resumeKeywords,
      jobFocusedObjective
    );

    // Analyze the tailored resume for ATS score
    const analysis = analyzeResume(tailoredResume, jobDescription);

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
        careerObjective: jobFocusedObjective,
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
 * Calculate match percentage between job requirements and resume
 */
function calculateMatchPercentage(jobKeywords, resumeKeywords) {
  if (jobKeywords.length === 0) return 0;

  const matches = jobKeywords.filter((keyword) =>
    resumeKeywords.some((rk) => rk.toLowerCase() === keyword.toLowerCase())
  ).length;

  return Math.round((matches / jobKeywords.length) * 100);
}
