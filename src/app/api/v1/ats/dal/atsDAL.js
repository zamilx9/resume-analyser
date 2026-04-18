import { prisma } from "@/lib/prisma";

/**
 * Create ATS analysis
 */
export async function createATSAnalysis(analysisData) {
  try {
    const analysis = await prisma.atsAnalysis.create({
      data: analysisData,
    });
    return analysis;
  } catch (error) {
    if (error.code === "P2002") {
      // Resume already has an analysis, update it instead
      return updateATSAnalysis(analysisData.resumeId, analysisData);
    }
    console.error("Create ATS Analysis Error:", error);
    throw error;
  }
}

/**
 * Get ATS analysis by ID
 */
export async function getATSAnalysisById(analysisId) {
  try {
    const analysis = await prisma.atsAnalysis.findUnique({
      where: { id: analysisId },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            content: true,
          },
        },
      },
    });
    return analysis;
  } catch (error) {
    console.error("Get ATS Analysis Error:", error);
    throw error;
  }
}

/**
 * Get ATS analysis by resume ID
 */
export async function getATSAnalysisByResumeId(resumeId) {
  try {
    const analysis = await prisma.atsAnalysis.findUnique({
      where: { resumeId },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    return analysis;
  } catch (error) {
    console.error("Get ATS Analysis by Resume Error:", error);
    throw error;
  }
}

/**
 * Get all ATS analyses for a user
 */
export async function getUserATSAnalyses(userId, filters = {}) {
  try {
    const { skip = 0, take = 10 } = filters;

    const analyses = await prisma.atsAnalysis.findMany({
      where: { userId },
      skip,
      take,
      orderBy: { analyzedAt: "desc" },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
            resumeType: true,
          },
        },
      },
    });

    const total = await prisma.atsAnalysis.count({ where: { userId } });

    return {
      analyses,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  } catch (error) {
    console.error("Get User ATS Analyses Error:", error);
    throw error;
  }
}

/**
 * Update ATS analysis
 */
export async function updateATSAnalysis(resumeId, updates) {
  try {
    const analysis = await prisma.atsAnalysis.update({
      where: { resumeId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
    return analysis;
  } catch (error) {
    console.error("Update ATS Analysis Error:", error);
    throw error;
  }
}

/**
 * Delete ATS analysis
 */
export async function deleteATSAnalysis(analysisId) {
  try {
    const analysis = await prisma.atsAnalysis.delete({
      where: { id: analysisId },
    });
    return analysis;
  } catch (error) {
    console.error("Delete ATS Analysis Error:", error);
    throw error;
  }
}

/**
 * Get average ATS score for user
 */
export async function getUserAverageATSScore(userId) {
  try {
    const result = await prisma.atsAnalysis.aggregate({
      where: { userId },
      _avg: {
        score: true,
      },
      _max: {
        score: true,
      },
      _min: {
        score: true,
      },
    });

    return {
      average: Math.round(result._avg.score || 0),
      highest: result._max.score,
      lowest: result._min.score,
    };
  } catch (error) {
    console.error("Get Average ATS Score Error:", error);
    throw error;
  }
}

/**
 * Get highest scoring resume
 */
export async function getHighestScoringResume(userId) {
  try {
    const analysis = await prisma.atsAnalysis.findFirst({
      where: { userId },
      orderBy: { score: "desc" },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return analysis;
  } catch (error) {
    console.error("Get Highest Scoring Resume Error:", error);
    throw error;
  }
}

/**
 * Get analyses with score above threshold
 */
export async function getAnalysesAboveScore(userId, minScore) {
  try {
    const analyses = await prisma.atsAnalysis.findMany({
      where: {
        userId,
        score: { gte: minScore },
      },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { score: "desc" },
    });

    return analyses;
  } catch (error) {
    console.error("Get Analyses Above Score Error:", error);
    throw error;
  }
}
