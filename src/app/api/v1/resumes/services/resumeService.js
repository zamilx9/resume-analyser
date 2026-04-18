import {
  createResume,
  getResumeById,
  getUserResumes,
  updateResume,
  deleteResume,
  countUserResumes,
} from "../dal/resumeDAL";
import {
  createDocument,
  deleteDocument,
  deleteDocumentByS3Key,
} from "@/app/api/v1/documents/dal/documentDAL";
import { uploadFileToS3, deleteFileFromS3 } from "@/utils/s3";
import { analyzeResume } from "@/utils/atsScorer";
import { createATSAnalysis } from "@/app/api/v1/ats/dal/atsDAL";
import { validateFileSize, validateResumeFileType } from "@/utils/helpers";

/**
 * Generate resume from job description
 */
export async function generateJobBasedResume(userId, jobDescription, educationData) {
  try {
    // In a real application, you would call an AI service here (OpenAI, Anthropic, etc.)
    // For now, we'll create a template-based resume

    const generatedContent = createResumeFromTemplate({
      educationData,
      jobDescription,
      isJobBased: true,
    });

    const resume = await createResume({
      userId,
      title: `Resume for ${jobDescription.title || "Position"}`,
      content: generatedContent,
      resumeType: "JOB_BASED",
      jobDescriptionId: jobDescription.id,
    });

    return {
      resume,
      message: "Resume generated successfully from job description",
    };
  } catch (error) {
    console.error("Generate Job-Based Resume Error:", error);
    throw error;
  }
}

/**
 * Generate resume from education details
 */
export async function generateEducationBasedResume(userId, educationData) {
  try {
    const generatedContent = createResumeFromTemplate({
      educationData,
      isEducationBased: true,
    });

    const resume = await createResume({
      userId,
      title: `Resume - ${new Date().toISOString().split("T")[0]}`,
      content: generatedContent,
      resumeType: "EDUCATION_BASED",
    });

    return {
      resume,
      message: "Resume generated successfully from education details",
    };
  } catch (error) {
    console.error("Generate Education-Based Resume Error:", error);
    throw error;
  }
}

/**
 * Upload and parse resume file
 */
export async function uploadResume(userId, fileBuffer, fileName, mimeType) {
  try {
    // Validate file
    if (!validateFileSize(fileBuffer.length)) {
      throw new Error("File size exceeds 10MB limit");
    }

    if (!validateResumeFileType(fileName)) {
      throw new Error("Invalid file type. Only PDF, DOC, DOCX allowed");
    }

    // Upload to S3
    const uploadResult = await uploadFileToS3(fileBuffer, fileName, userId, mimeType);

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    // Create document record
    const document = await createDocument({
      userId,
      fileName,
      fileType: fileName.split(".").pop().toLowerCase(),
      fileSize: fileBuffer.length,
      s3Key: uploadResult.s3Key,
      s3Url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadResult.s3Key}`,
    });

    // Extract text from file (simplified - in production use pdfparse, docx etc.)
    const extractedText = extractTextFromFile(fileBuffer, fileName);

    // Create resume record
    const resume = await createResume({
      userId,
      title: fileName,
      content: extractedText,
      fileUrl: document.s3Url,
      fileName,
      resumeType: "UPLOADED",
      documentId: document.id,
    });

    return {
      resume,
      document,
      message: "Resume uploaded successfully",
    };
  } catch (error) {
    console.error("Upload Resume Error:", error);
    throw error;
  }
}

/**
 * Analyze resume for ATS score
 */
export async function analyzeResumeForATS(resumeId, jobDescription = null) {
  try {
    const resume = await getResumeById(resumeId);
    if (!resume) {
      throw new Error("Resume not found");
    }

    // Calculate ATS score
    const analysisResult = analyzeResume(resume.content, jobDescription?.description);

    // Save analysis to database
    const atsAnalysis = await createATSAnalysis({
      userId: resume.userId,
      resumeId,
      score: analysisResult.score,
      summary: analysisResult.summary,
      strengths: analysisResult.strengths,
      improvements: analysisResult.improvements,
      missingKeywords: analysisResult.missingKeywords,
    });

    return {
      analysis: atsAnalysis,
      message: "Resume analyzed successfully",
    };
  } catch (error) {
    console.error("Analyze Resume Error:", error);
    throw error;
  }
}

/**
 * Get user's resumes with pagination
 */
export async function getUserResumesList(userId, page = 1, limit = 10, filters = {}) {
  try {
    const skip = (page - 1) * limit;

    const result = await getUserResumes(userId, {
      skip,
      take: limit,
      ...filters,
    });

    return {
      resumes: result.resumes,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  } catch (error) {
    console.error("Get User Resumes Error:", error);
    throw error;
  }
}

/**
 * Delete resume and related files
 */
export async function deleteUserResume(resumeId, userId) {
  try {
    const resume = await getResumeById(resumeId);

    if (!resume) {
      throw new Error("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new Error("Unauthorized to delete this resume");
    }

    // Delete from S3 if exists
    if (resume.document) {
      await deleteFileFromS3(resume.document.s3Key);
      await deleteDocument(resume.document.id);
    }

    // Delete resume
    await deleteResume(resumeId);

    return {
      message: "Resume deleted successfully",
    };
  } catch (error) {
    console.error("Delete Resume Error:", error);
    throw error;
  }
}

/**
 * Get resume details
 */
export async function getResumeDetails(resumeId, userId) {
  try {
    const resume = await getResumeById(resumeId);

    if (!resume) {
      throw new Error("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new Error("Unauthorized to access this resume");
    }

    return {
      resume,
    };
  } catch (error) {
    console.error("Get Resume Details Error:", error);
    throw error;
  }
}

/**
 * Update resume
 */
export async function updateResumeContent(resumeId, userId, updates) {
  try {
    const resume = await getResumeById(resumeId);

    if (!resume) {
      throw new Error("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new Error("Unauthorized to update this resume");
    }

    const allowedUpdates = ["title", "content"];
    const updateData = {};

    for (const key of allowedUpdates) {
      if (updates[key]) {
        updateData[key] = updates[key];
      }
    }

    const updatedResume = await updateResume(resumeId, updateData);

    return {
      resume: updatedResume,
      message: "Resume updated successfully",
    };
  } catch (error) {
    console.error("Update Resume Error:", error);
    throw error;
  }
}

/**
 * Create resume from template (helper function)
 */
function createResumeFromTemplate({ educationData, jobDescription, isJobBased = false, isEducationBased = false }) {
  let content = "";

  // Header
  if (educationData?.name) {
    content += `${educationData.name.toUpperCase()}\n`;
    content += "=" .repeat(50) + "\n\n";
  }

  // Contact Info
  if (educationData?.email || educationData?.phone) {
    content += "CONTACT INFORMATION\n";
    content += "- " + (educationData?.email || "") + "\n";
    content += "- " + (educationData?.phone || "") + "\n\n";
  }

  // Professional Summary
  if (isJobBased && jobDescription) {
    content += "PROFESSIONAL SUMMARY\n";
    content += `Seeking a position as ${jobDescription.title} with strong skills in ${
      jobDescription.requiredSkills?.slice(0, 3).join(", ") || "required areas"
    }.\n\n`;
  }

  // Education
  if (isEducationBased && educationData?.education) {
    content += "EDUCATION\n";
    educationData.education.forEach((edu) => {
      content += `- ${edu.degree} in ${edu.field} from ${edu.instituteName}\n`;
      if (edu.gpa) content += `  GPA: ${edu.gpa}\n`;
      if (edu.description) content += `  ${edu.description}\n`;
    });
    content += "\n";
  }

  // Skills
  if (isJobBased && jobDescription?.requiredSkills) {
    content += "TECHNICAL SKILLS\n";
    jobDescription.requiredSkills.forEach((skill) => {
      content += `- ${skill}\n`;
    });
    content += "\n";
  }

  if (isEducationBased && educationData?.skills) {
    content += "SKILLS\n";
    educationData.skills.forEach((skill) => {
      content += `- ${skill}\n`;
    });
    content += "\n";
  }

  return content;
}

/**
 * Extract text from file buffer (simplified)
 */
function extractTextFromFile(fileBuffer, fileName) {
  // In production, use libraries like pdfparse, docxtemplater, etc.
  // For now, return a placeholder
  return `Document: ${fileName}\n[Content would be extracted from file in production environment]`;
}
