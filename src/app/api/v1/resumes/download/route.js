import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getResumeById } from "../dal/resumeDAL";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("id");
    const userId = searchParams.get("userId"); // In production, get from auth

    if (!resumeId) {
      return NextResponse.json(
        { error: "Resume ID required" },
        { status: 400 }
      );
    }

    const resume = await getResumeById(resumeId);

    if (!resume || resume.userId !== userId) {
      return NextResponse.json(
        { error: "Resume not found or unauthorized" },
        { status: 404 }
      );
    }

    // Strip HTML tags from content if present
    const cleanContent = stripHtmlTags(resume.content);

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 } // Small margins for full width
    });

    // Set headers for PDF download
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="${resume.title || 'resume'}.pdf"`);

    // Collect PDF chunks
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});

    // Add content with full width
    doc.fontSize(12);
    const pageWidth = doc.page.width - 40; // Account for margins
    const lines = cleanContent.split('\n');

    lines.forEach(line => {
      // Wrap text to full width
      const wrappedLines = doc.widthOfString(line) > pageWidth
        ? wrapText(line, pageWidth, doc)
        : [line];

      wrappedLines.forEach(wrappedLine => {
        doc.text(wrappedLine, { width: pageWidth, align: 'left' });
      });
    });

    doc.end();

    // Wait for PDF to finish
    await new Promise(resolve => doc.on('end', resolve));

    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error("[Download Resume Error]:", error);
    return NextResponse.json(
      { error: "Download failed" },
      { status: 500 }
    );
  }
}

function wrapText(text, maxWidth, doc) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (doc.widthOfString(testLine) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function stripHtmlTags(html) {
  // Remove HTML tags using regex
  let text = html.replace(/<[^>]*>/g, '');
  // Decode common HTML entities
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/&apos;/g, "'");
  return text;
}