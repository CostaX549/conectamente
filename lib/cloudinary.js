import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  signature_algorithm: "sha256",
});

/**
 * Faz upload de arquivos para Cloudinary:
 * - Imagens: JPG, PNG, GIF
 * - Vídeos: MP4, MOV
 * - Documentos: DOCX, PPTX, PDF
 */
export async function uploadToCloudinary(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type;

  // Detecta o tipo
  let resourceType = "auto";
  const docTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  if (docTypes.includes(mimeType)) resourceType = "raw";

  // Extrai nome e extensão (importante!)
  const originalName = file.name?.split(".")[0] || `upload_${Date.now()}`;
  const extension = file.name?.split(".").pop() || "";

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "chat_uploads",
        resource_type: resourceType,
        public_id: originalName, // ✅ força o nome do arquivo
        format: extension || undefined, // ✅ mantém extensão correta
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          resourceType: result.resource_type,
        });
      }
    );

    uploadStream.end(buffer);
  });
}
