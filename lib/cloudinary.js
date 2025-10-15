import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,

});

export async function uploadToCloudinary(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = file.type;

  // Envia diretamente o arquivo base64
  const result = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${base64}`,
    { folder: "chat_uploads" }
  );

  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    resourceType: result.resource_type,
  };
}
