import { NextResponse } from "next/server";
import { uploadResume } from "./services/resumeService";
import { successResponse, errorResponse } from "@/utils/helpers";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        errorResponse(null, "No file provided", 400),
        { status: 400 }
      );
    }

    // Get user ID from request (you might want to get this from auth)
    const userId = "test-user"; // For now, use a test user

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);

    // Upload resume
    const result = await uploadResume(userId, fileBuffer, file.name, file.type);

    return NextResponse.json(
      successResponse(result, "Resume uploaded successfully", 200),
      { status: 200 }
    );
  } catch (error) {
    console.error("[Resume Upload Error]:", error.message);
    return NextResponse.json(
      errorResponse(error, error.message || "Upload failed", 500),
      { status: 500 }
    );
  }
}