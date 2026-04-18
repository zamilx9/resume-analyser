import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "ats-resume-documents";

/**
 * Upload file to S3
 */
export async function uploadFileToS3(
  fileBuffer,
  fileName,
  userId,
  contentType = "application/octet-stream"
) {
  try {
    const timestamp = Date.now();
    const s3Key = `resumes/${userId}/${timestamp}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: {
        userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    return {
      success: true,
      s3Key,
      fileName,
      bucket: BUCKET_NAME,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate signed URL for file download
 */
export async function getSignedDownloadUrl(s3Key, expirationSeconds = 604800) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds, // 7 days by default
    });

    return {
      success: true,
      url: signedUrl,
    };
  } catch (error) {
    console.error("Get Signed URL Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Delete file from S3
 */
export async function deleteFileFromS3(s3Key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("S3 Delete Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get S3 public URL (if bucket has public access enabled)
 */
export function getS3PublicUrl(s3Key) {
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${s3Key}`;
}

/**
 * Get file metadata from S3
 */
export async function getFileMetadata(s3Key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const metadata = await s3Client.send(command);

    return {
      success: true,
      size: metadata.ContentLength,
      type: metadata.ContentType,
      lastModified: metadata.LastModified,
    };
  } catch (error) {
    console.error("S3 Metadata Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
