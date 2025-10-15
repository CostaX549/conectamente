import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  signature_algorithm: 'sha256', // recomendado
});

/**
 * Faz upload de arquivos para Cloudinary:
 * - Imagens: JPG, PNG, GIF
 * - Vídeos: MP4, MOV
 * - Documentos: DOCX, PPTX, PDF
 */
export async function uploadToCloudinary(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = file.type;

  // Define resource_type de acordo com o tipo do arquivo
  let resourceType = "auto"; // padrão para imagens e vídeos
  const docTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  ];

  if (docTypes.includes(mimeType)) {
    resourceType = "raw"; // documentos
  }

  const result = await cloudinary.uploader.upload(
    `data:${mimeType};base64,${base64}`,
    {
      folder: "chat_uploads",
      resource_type: resourceType,
    }
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
