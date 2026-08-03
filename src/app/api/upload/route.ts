import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const isVideo = file.type.startsWith("video/");
  const uploadOptions: Record<string, unknown> = {
    folder: "drc",
    resource_type: isVideo ? "video" : "image",
    ...(isVideo ? {} : { format: "webp" }),
  };

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error || !result) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}
