import { NextResponse } from "next/server";
import { analyzeResume } from "@/utils/atsScorer";
import { generateProfessionalResume, tailorResumeForJob } from "@/utils/resumeTemplateer";
import { successResponse, errorResponse } from "@/utils/helpers";

// Extract keywords from job description
function extractKeywordsFromJD(jobDescription) {
  const commonKeywords = [
    "javascript", "typescript", "python", "java", "c#", ".net", "react", "vue", "angular",
    "nodejs", "express", "django", "spring", "mongodb", "postgresql", "mysql", "sql",
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "agile", "scrum", "api",
    "rest", "graphql", "microservices", "database", "frontend", "backend", "full stack",
    "devops", "cloud", "ci/cd", "linux", "html", "css", "communication", "leadership"
  ];

  const words = jobDescription.toLowerCase().split(/\s+/);
  const foundKeywords = commonKeywords.filter(keyword => 
    words.some(word => word.includes(keyword) || keyword.includes(word))
  );

  return foundKeywords.length > 0 ? foundKeywords : [];
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const jobDescription = formData.get("jobDescription") || "";
    const userDetailsStr = formData.get("userDetails");

    if (!file) {
      return NextResponse.json(
        errorResponse(null, "No file provided", 400),
        { status: 400 }
      );
    }

    // Convert file to text
    let fileContent = "";
    const fileType = file.type;

    if (fileType === "application/pdf") {
      const buffer = await file.arrayBuffer();
      fileContent = Buffer.from(buffer).toString("utf-8").substring(0, 5000);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      const buffer = await file.arrayBuffer();
      fileContent = Buffer.from(buffer).toString("utf-8").substring(0, 5000);
    } else if (fileType === "text/plain") {
      fileContent = await file.text();
    } else {
      return NextResponse.json(
        errorResponse(null, "Unsupported file format", 400),
        { status: 400 }
      );
    }

    // Analyze resume
    const analysis = analyzeResume(fileContent, jobDescription);

    // Extract suggested keywords from job description
    const suggestedKeywords = jobDescription 
      ? extractKeywordsFromJD(jobDescription).filter(kw => !fileContent.toLowerCase().includes(kw))
      : [];

    // Parse user details if provided
    let userDetails = {};
    if (userDetailsStr) {
      try {
        userDetails = JSON.parse(userDetailsStr);
      } catch (e) {
        // Continue without user details
      }
    }

    // Generate tailored resume if user details provided
    let tailoredResume = null;
    if (userDetails.fullName) {
      tailoredResume = generateProfessionalResume(userDetails, [], [], []);
    }

    return NextResponse.json(
      successResponse({
        ...analysis,
        suggestedKeywords,
        optimizedContent: tailoredResume || fileContent.substring(0, 500),
        resumeText: tailoredResume,
      }, "Resume analyzed successfully", 200),
      { status: 200 }
    );
  } catch (error) {
    console.error("[ATS Analyze Error]:", error.message);
    return NextResponse.json(
      errorResponse(error, error.message || "Analysis failed", 500),
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        errorResponse(null, "Invalid JSON in request body", 400),
        { status: 400 }
      );
    }
    
    const { education, skills, certifications, userDetails = {}, jobDescription = "" } = body;

    if (!education || !skills) {
      return NextResponse.json(
        errorResponse(null, "Education and skills are required", 400),
        { status: 400 }
      );
    }

    // Generate resume with user details
    const generatedResume = generateProfessionalResume(userDetails, education, skills, certifications);

    // Analyze the generated resume
    const analysis = analyzeResume(generatedResume, "");

    // Tailor if job description provided
    let tailoredResume = generatedResume;
    if (jobDescription && jobDescription.trim()) {
      tailoredResume = tailorResumeForJob(generatedResume, jobDescription, userDetails);
    }

    return NextResponse.json(
      successResponse({
        ...analysis,
        resumeText: tailoredResume,
        fullName: userDetails.fullName,
        email: userDetails.email,
        phone: userDetails.phone,
        location: userDetails.location,
        linkedIn: userDetails.linkedIn,
        github: userDetails.github,
        careerObjective: userDetails.careerObjective,
        skills,
        education,
        certifications,
      }, "ATS Resume generated successfully", 200),
      { status: 200 }
    );
  } catch (error) {
    console.error("[ATS Generate Error]:", error.message);
    return NextResponse.json(
      errorResponse(error, error.message || "Generation failed", 500),
      { status: 500 }
    );
  }
}
