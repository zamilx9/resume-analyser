import { prisma } from "@/lib/prisma";

/**
 * Create a document record in database
 */
export async function createDocument(documentData) {
  try {
    const document = await prisma.document.create({
      data: documentData,
    });
    return document;
  } catch (error) {
    console.error("Create Document Error:", error);
    throw error;
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(documentId) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    return document;
  } catch (error) {
    console.error("Get Document Error:", error);
    throw error;
  }
}

/**
 * Get document by S3 key
 */
export async function getDocumentByS3Key(s3Key) {
  try {
    const document = await prisma.document.findUnique({
      where: { s3Key },
    });
    return document;
  } catch (error) {
    console.error("Get Document by S3 Key Error:", error);
    throw error;
  }
}

/**
 * Get all documents of a user
 */
export async function getUserDocuments(userId, filters = {}) {
  try {
    const { skip = 0, take = 10, fileType = null } = filters;

    const where = { userId };
    if (fileType) where.fileType = fileType;

    const documents = await prisma.document.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const total = await prisma.document.count({ where });

    return {
      documents,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  } catch (error) {
    console.error("Get User Documents Error:", error);
    throw error;
  }
}

/**
 * Update document
 */
export async function updateDocument(documentId, updates) {
  try {
    const document = await prisma.document.update({
      where: { id: documentId },
      data: updates,
    });
    return document;
  } catch (error) {
    console.error("Update Document Error:", error);
    throw error;
  }
}

/**
 * Delete document
 */
export async function deleteDocument(documentId) {
  try {
    const document = await prisma.document.delete({
      where: { id: documentId },
    });
    return document;
  } catch (error) {
    console.error("Delete Document Error:", error);
    throw error;
  }
}

/**
 * Delete document by S3 key
 */
export async function deleteDocumentByS3Key(s3Key) {
  try {
    const document = await prisma.document.delete({
      where: { s3Key },
    });
    return document;
  } catch (error) {
    console.error("Delete Document by S3 Key Error:", error);
    throw error;
  }
}

/**
 * Get documents by file type
 */
export async function getDocumentsByType(userId, fileType) {
  try {
    const documents = await prisma.document.findMany({
      where: {
        userId,
        fileType,
      },
      orderBy: { createdAt: "desc" },
    });
    return documents;
  } catch (error) {
    console.error("Get Documents by Type Error:", error);
    throw error;
  }
}

/**
 * Count user documents
 */
export async function countUserDocuments(userId) {
  try {
    const count = await prisma.document.count({
      where: { userId },
    });
    return count;
  } catch (error) {
    console.error("Count Documents Error:", error);
    throw error;
  }
}

/**
 * Get total storage used by user (in bytes)
 */
export async function getUserStorageUsed(userId) {
  try {
    const result = await prisma.document.aggregate({
      where: { userId },
      _sum: {
        fileSize: true,
      },
    });

    return result._sum.fileSize || 0;
  } catch (error) {
    console.error("Get User Storage Error:", error);
    throw error;
  }
}

/**
 * Get document statistics
 */
export async function getUserDocumentStats(userId) {
  try {
    const totalDocuments = await prisma.document.count({
      where: { userId },
    });

    const storageUsed = await getUserStorageUsed(userId);

    const fileTypeStats = await prisma.document.groupBy({
      by: ["fileType"],
      where: { userId },
      _count: true,
    });

    return {
      totalDocuments,
      storageUsed,
      storageUsedMB: Math.round(storageUsed / (1024 * 1024)),
      fileTypeBreakdown: fileTypeStats,
    };
  } catch (error) {
    console.error("Get Document Stats Error:", error);
    throw error;
  }
}
