import { prisma } from "@/lib/prisma";

/**
 * Create a new resume
 */
export async function createResume(resumeData) {
  try {
    const resume = await prisma.resume.create({
      data: resumeData,
      include: {
        atsAnalysis: true,
        document: true,
      },
    });
    return resume;
  } catch (error) {
    console.error("Create Resume Error:", error);
    throw error;
  }
}

/**
 * Get resume by ID
 */
export async function getResumeById(resumeId) {
  try {
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: {
        atsAnalysis: true,
        document: true,
        jobDescription: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
    return resume;
  } catch (error) {
    console.error("Get Resume Error:", error);
    throw error;
  }
}

/**
 * Get all resumes of a user
 */
export async function getUserResumes(userId, filters = {}) {
  try {
    const { skip = 0, take = 10, resumeType = null, isPaid = null } = filters;

    const where = { userId };
    if (resumeType) where.resumeType = resumeType;
    if (isPaid !== null) where.isPaid = isPaid;

    const resumes = await prisma.resume.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        atsAnalysis: {
          select: {
            score: true,
          },
        },
        _count: {
          select: { atsAnalysis: true },
        },
      },
    });

    const total = await prisma.resume.count({ where });

    return {
      resumes,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  } catch (error) {
    console.error("Get User Resumes Error:", error);
    throw error;
  }
}

/**
 * Update resume
 */
export async function updateResume(resumeId, updates) {
  try {
    const resume = await prisma.resume.update({
      where: { id: resumeId },
      data: updates,
      include: {
        atsAnalysis: true,
      },
    });
    return resume;
  } catch (error) {
    console.error("Update Resume Error:", error);
    throw error;
  }
}

/**
 * Delete resume
 */
export async function deleteResume(resumeId) {
  try {
    // This will cascade delete related atsAnalysis and transactions
    const resume = await prisma.resume.delete({
      where: { id: resumeId },
    });
    return resume;
  } catch (error) {
    console.error("Delete Resume Error:", error);
    throw error;
  }
}

/**
 * Mark resume as paid
 */
export async function markResumePaid(resumeId, transactionId) {
  try {
    const resume = await prisma.resume.update({
      where: { id: resumeId },
      data: {
        isPaid: true,
        transactionId,
      },
    });
    return resume;
  } catch (error) {
    console.error("Mark Resume Paid Error:", error);
    throw error;
  }
}

/**
 * Get resumes by transaction
 */
export async function getResumesByTransaction(transactionId) {
  try {
    const resumes = await prisma.resume.findMany({
      where: { transactionId },
    });
    return resumes;
  } catch (error) {
    console.error("Get Resumes by Transaction Error:", error);
    throw error;
  }
}

/**
 * Count user resumes
 */
export async function countUserResumes(userId) {
  try {
    const count = await prisma.resume.count({
      where: { userId },
    });
    return count;
  } catch (error) {
    console.error("Count Resumes Error:", error);
    throw error;
  }
}

/**
 * Get resumed with free downloads (not paid)
 */
export async function getFreeResumes(userId) {
  try {
    const resumes = await prisma.resume.findMany({
      where: {
        userId,
        isPaid: false,
      },
      orderBy: { createdAt: "desc" },
    });
    return resumes;
  } catch (error) {
    console.error("Get Free Resumes Error:", error);
    throw error;
  }
}
