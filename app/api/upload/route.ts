import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "fish_business/invoices";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file format. Only JPEG, PNG, WEBP, GIF, and PDF documents are allowed." },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit of 10MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const fileDataUri = `data:${file.type};base64,${base64Data}`;

    // Upload to Cloudinary if configured, fallback cleanly if Cloudinary is not configured in local environment
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const uploadResponse = await cloudinary.uploader.upload(fileDataUri, {
        folder,
        resource_type: "auto",
      });

      return NextResponse.json({
        url: uploadResponse.secure_url,
        fileName: file.name,
        fileType: file.type || uploadResponse.format,
        fileSize: file.size || uploadResponse.bytes,
      });
    }

    // Local / development environment fallback
    return NextResponse.json({
      url: `https://res.cloudinary.com/placeholder/image/upload/v1/invoices/${encodeURIComponent(file.name)}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("[Secure Upload Error]:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing the file upload." },
      { status: 500 }
    );
  }
}

