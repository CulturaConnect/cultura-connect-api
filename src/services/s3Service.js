const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const isMinio = !!process.env.S3_ENDPOINT;

const s3 = new S3Client({
  region: process.env.S3_REGION || process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT || undefined,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", // MinIO precisa
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Faz upload de um buffer para S3/MinIO.
 * @param {Buffer|Uint8Array|ReadableStream} buffer
 * @param {string} key - caminho/arquivo (ex: "uploads/abc.png")
 * @param {string} contentType - (ex: "image/png")
 * @returns {string} URL pública (se bucket/objeto forem públicos) ou URL "endereço do objeto"
 */
async function uploadFile(buffer, key, contentType = "application/octet-stream") {
  const Bucket = process.env.S3_BUCKET_NAME;

  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL: "public-read", // AWS só; MinIO geralmente ignora ACL (melhor usar policy no bucket)
  });

  await s3.send(command);

  // Monta URL de retorno:
  // - MinIO (com path-style): https://s3.seudominio.com/<bucket>/<key>
  // - AWS (virtual-host):     https://<bucket>.s3.<region>.amazonaws.com/<key>
  const url = isMinio
    ? `${process.env.S3_ENDPOINT.replace(/\/+$/, "")}/${encodeURIComponent(Bucket)}/${encodeURIComponent(key)}`
    : `https://${Bucket}.s3.${process.env.AWS_REGION || process.env.S3_REGION}.amazonaws.com/${encodeURIComponent(key)}`;

  return url;
}

module.exports = { uploadFile, s3 };
