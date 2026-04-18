import {
  getATSAnalysisById,
  getATSAnalysisByResumeId,
  getUserATSAnalyses,
  updateATSAnalysis,
  getUserAverageATSScore,
  getHighestScoringResume,
  getAnalysesAboveScore,
} from "../dal/atsDAL";
import { getResumeById } from "@/app/api/v1/resumes/dal/resumeDAL";
import { analyzeResume } from "@/utils/atsScorer";

/**
 * Get ATS analysis for resume
 */
export async function getATSAnalysis(resumeId, userId) {
  try {
    const analysis = await getATSAnalysisByResumeId(resumeId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Verify authorization
    const resume = await getResumeById(resumeId);
    if (resume.userId !== userId) {
      throw new Error("Unauthorized to access this analysis");
    }

    return {
      analysis,
    };
  } catch (error) {
    console.error("Get ATS Analysis Error:", error);
    throw error;
  }
}

/**
 * Get all analyses for a user
 */
export async function getUserAnalyses(userId, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    const result = await getUserATSAnalyses(userId, {
      skip,
      take: limit,
    });

    return {
      analyses: result.analyses,
      pagination: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  } catch (error) {
    console.error("Get User Analyses Error:", error);
    throw error;
  }
}

/**
 * Get user's ATS statistics/dashboard
 */
export async function getUserATSStatistics(userId) {
  try {
    const scores = await getUserAverageATSScore(userId);
    const bestResume = await getHighestScoringResume(userId);
    const excellentResumes = await getAnalysesAboveScore(userId, 75);
    const goodResumes = await getAnalysesAboveScore(userId, 50);

    return {
      statistics: {
        averageScore: scores.average,
        highestScore: scores.highest,
        lowestScore: scores.lowest,
        excellentResumes: excellentResumes.length, // Score >= 75
        goodResumes: goodResumes.length, // Score >= 50
      },
      bestResume: bestResume
        ? {
            id: bestResume.id,
            resumeTitle: bestResume.resume.title,
            score: bestResume.score,
            analyzedAt: bestResume.analyzedAt,
          }
        : null,
    };
  } catch (error) {
    console.error("Get User ATS Statistics Error:", error);
    throw error;
  }
}

/**
 * Re-analyze resume
 */
export async function reanalyzeResume(resumeId, userId, jobDescriptionContent = null) {
  try {
    const resume = await getResumeById(resumeId);

    if (!resume) {
      throw new Error("Resume not found");
    }

    if (resume.userId !== userId) {
      throw new Error("Unauthorized to analyze this resume");
    }

    // Perform new analysis
    const analysisResult = analyzeResume(resume.content, jobDescriptionContent);

    // Update analysis in database
    const updatedAnalysis = await updateATSAnalysis(resumeId, {
      score: analysisResult.score,
      summary: analysisResult.summary,
      strengths: analysisResult.strengths,
      improvements: analysisResult.improvements,
      missingKeywords: analysisResult.missingKeywords,
      analyzedAt: new Date(),
    });

    return {
      analysis: updatedAnalysis,
      message: "Resume re-analyzed successfully",
    };
  } catch (error) {
    console.error("Re-analyze Resume Error:", error);
    throw error;
  }
}

/**
 * Compare two resumes
 */
export async function compareResumes(resumeId1, resumeId2, userId) {
  try {
    const analysis1 = await getATSAnalysisByResumeId(resumeId1);
    const analysis2 = await getATSAnalysisByResumeId(resumeId2);

    if (!analysis1 || !analysis2) {
      throw new Error("One or both analyses not found");
    }

    const resume1 = await getResumeById(resumeId1);
    const resume2 = await getResumeById(resumeId2);

    if (resume1.userId !== userId || resume2.userId !== userId) {
      throw new Error("Unauthorized to compare these resumes");
    }

    return {
      comparison: {
        resume1: {
          id: resumeId1,
          title: resume1.title,
          score: analysis1.score,
          improvements: analysis1.improvements.length,
        },
        resume2: {
          id: resumeId2,
          title: resume2.title,
          score: analysis2.score,
          improvements: analysis2.improvements.length,
        },
        winner: analysis1.score > analysis2.score ? resumeId1 : resumeId2,
        scoreDifference: Math.abs(analysis1.score - analysis2.score),
      },
    };
  } catch (error) {
    console.error("Compare Resumes Error:", error);
    throw error;
  }
}

/**
 * Get improvement suggestions for a resume
 */
export async function getImprovementSuggestions(resumeId, userId) {
  try {
    const analysis = await getATSAnalysisByResumeId(resumeId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    const resume = await getResumeById(resumeId);
    if (resume.userId !== userId) {
      throw new Error("Unauthorized to access this analysis");
    }

    return {
      suggestions: {
        score: analysis.score,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        missingKeywords: analysis.missingKeywords,
        scoreBreakdown: generateScoreBreakdown(analysis.score),
      },
    };
  } catch (error) {
    console.error("Get Improvement Suggestions Error:", error);
    throw error;
  }
}

/**
 * Generate score breakdown for better understanding
 */
function generateScoreBreakdown(score) {
  let category = "";
  let description = "";
  let recommendation = "";

  if (score >= 85) {
    category = "Excellent";
    description = "Your resume is highly optimized for ATS systems";
    recommendation = "You're ready to apply! Consider applying to jobs that match your profile.";
  } else if (score >= 70) {
    category = "Good";
    description = "Your resume is well-optimized for ATS systems";
    recommendation = "Make a few improvements to increase your chances";
  } else if (score >= 50) {
    category = "Fair";
    description = "Your resume needs some ATS optimization";
    recommendation = "Follow the improvement suggestions to enhance your ATS compatibility";
  } else {
    category = "Poor";
    description = "Your resume needs significant ATS optimization";
    recommendation = "Please address the major issues listed in improvements section";
  }

  return {
    score,
    category,
    description,
    recommendation,
  };
}

/**
 * Get top keywords for job-based optimization
 */
export async function getTopKeywordsForJob(jobDescription) {
  try {
    const keywords = extractImportantKeywords(jobDescription);

    return {
      keywords,
      message: `Found ${keywords.length} important keywords for this job`,
    };
  } catch (error) {
    console.error("Get Top Keywords Error:", error);
    throw error;
  }
}

/**
 * Extract important keywords from job description
 */
function extractImportantKeywords(jobDescription) {
  const jobLower = jobDescription.toLowerCase();

  // Common technical skills
  const commonKeywords = [
    "javascript",
    "python",
    "java",
    "react",
    "nodejs",
    "aws",
    "docker",
    "kubernetes",
    "sql",
    "mongodb",
    "git",
    "agile",
    "scrum",
    "api",
    "rest",
    "graphql",
    "typescript",
    "html",
    "css",
  ];

  return commonKeywords.filter((keyword) => jobLower.includes(keyword));
}

/**
 * Download ATS report
 */
export async function generateATSReport(resumeId, userId) {
  try {
    const analysis = await getATSAnalysisByResumeId(resumeId);

    if (!analysis) {
      throw new Error("Analysis not found");
    }

    const resume = await getResumeById(resumeId);
    if (resume.userId !== userId) {
      throw new Error("Unauthorized to access this analysis");
    }

    const scoreBreakdown = generateScoreBreakdown(analysis.score);

    const report = {
      title: `ATS Report - ${resume.title}`,
      generatedAt: new Date().toISOString(),
      resume: {
        id: resume.id,
        title: resume.title,
        type: resume.resumeType,
      },
      analysis: {
        score: analysis.score,
        scoreBreakdown,
        summary: analysis.summary,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        missingKeywords: analysis.missingKeywords,
      },
    };

    return {
      report,
      message: "ATS report generated successfully",
    };
  } catch (error) {
    console.error("Generate ATS Report Error:", error);
    throw error;
  }
}
