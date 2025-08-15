const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { Sha256 } = require("@aws-crypto/sha256-js");
const { parseUrl } = require("@smithy/url-parser");

const endpoint = process.env.S3_ENDPOINT || undefined;
const publicBase = process.env.S3_PUBLIC_URL || endpoint; // usado só pra montar URL pública
const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const parsed = endpoint ? parseUrl(endpoint) : null;
const port = parsed?.port;
const isHttps = parsed?.protocol === "https:";
const isHttp = parsed?.protocol === "http:";
const isDefaultPort =
  !port || (isHttps && Number(port) === 443) || (isHttp && Number(port) === 80);

// signer custom só se a porta NAO for padrão (ex.: 9000, 4443, 8443)
const signer =
  endpoint && !isDefaultPort
    ? async () => ({
        sign: async (request) => {
          if (port) request.headers.host = `${request.hostname}:${port}`;
          const sv4 = new SignatureV4({
            credentials: { accessKeyId, secretAccessKey },
            region,
            service: "s3",
            sha256: Sha256,
          });
          return sv4.sign(request);
        },
      })
    : undefined;

console.log("[S3 CONFIG]", {
  region,
  endpoint,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE,
  accessKeyId,
  bucket: process.env.S3_BUCKET_NAME,
  publicBase,
  signer: !!signer,
});

const s3 = new S3Client({
  region,
  endpoint,
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId, secretAccessKey },
  signer,
});

async function uploadFile(buffer, key, contentType = "application/octet-stream") {
  const Bucket = process.env.S3_BUCKET_NAME;
  if (!Bucket) throw new Error("S3_BUCKET_NAME ausente");
  if (!buffer?.length) throw new Error("buffer vazio");

  const cmd = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length, // evita chunked → assinatura estável
  });

  await s3.send(cmd);

  // monta URL pública sem "quebrar" as barras
  const encodedBucket = encodeURIComponent(Bucket);
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  const base = (publicBase || "").replace(/\/+$/, "");

  const isMinio = !!endpoint;
  return isMinio
    ? `${base}/${encodedBucket}/${encodedKey}`
    : `https://${Bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

module.exports = { uploadFile, s3 };
