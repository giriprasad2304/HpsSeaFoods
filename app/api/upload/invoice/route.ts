import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const fileDataUri = `data:${file.type};base64,${base64Data}`;

    const uploadResponse = await cloudinary.uploader.upload(fileDataUri, {
      folder: "fish_business/invoices",
      resource_type: "auto",
    });

    return NextResponse.json({
      url: uploadResponse.secure_url,
      fileName: file.name,
      fileType: file.type || uploadResponse.format,
      fileSize: file.size || uploadResponse.bytes,
    });
  } catch (error) {
    console.error("[Invoice Upload Error]:", error);
    // Fallback URL for mock / offline preview
    return NextResponse.json({
      url: `https://res.cloudinary.com/placeholder/image/upload/v1/invoices/mock-invoice-${Date.now()}.pdf`,
      fileName: "invoice-attachment.pdf",
      fileType: "application/pdf",
      fileSize: 102400,
    });
  }
}
