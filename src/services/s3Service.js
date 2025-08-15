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
 * @param {Buffer|Uint8Array} buffer
 * @param {string} key ex: "projects/123/file.png"
 * @param {string} contentType ex: "image/png"
 * @returns {string} URL do objeto
 */
async function uploadFile(buffer, key, contentType = "application/octet-stream") {
  const Bucket = process.env.S3_BUCKET_NAME;
  if (!Bucket) throw new Error("S3_BUCKET_NAME ausente");
  if (!buffer || !buffer.length) throw new Error("buffer vazio");

  // Importante: informar ContentLength pra evitar chunked e não quebrar a assinatura
  const command = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
    // Cache-Control/ACL se precisar:
    // CacheControl: "public, max-age=31536000, immutable",
    // ACL: "public-read", // (AWS) MinIO geralmente ignora (prefira policy)
  });

   await s3.send(command);

  // Monta URL sem encodear as barras do path
  const encodedBucket = encodeURIComponent(Bucket);
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");

  const url = isMinio
    ? `${process.env.S3_ENDPOINT.replace(/\/+$/, "")}/${encodedBucket}/${encodedKey}`
    : `https://${Bucket}.s3.${process.env.AWS_REGION || process.env.S3_REGION}.amazonaws.com/${encodedKey}`;


  return url;
}

module.exports = { uploadFile, s3 };
