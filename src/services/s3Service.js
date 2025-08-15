// s3-client.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { Sha256 } = require("@aws-crypto/sha256-js");
const { parseUrl } = require("@smithy/url-parser");

const endpoint = process.env.S3_ENDPOINT || undefined;
const region = process.env.S3_REGION || process.env.AWS_REGION || "us-east-1";
const accessKeyId = process.env.S3_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY;

const parsed = endpoint ? parseUrl(endpoint) : null;
const port = parsed?.port;
const isHttps = parsed?.protocol === "https:";
const isHttp = parsed?.protocol === "http:";
const isDefaultPort =
  !port || (isHttps && Number(port) === 443) || (isHttp && Number(port) === 80);

// só cria signer custom se tiver porta não-padrão
const signer =
  endpoint && !isDefaultPort
    ? async () => ({
        sign: async (request) => {
          // injeta host:porta antes de assinar
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

const s3 = new S3Client({
  region,
  endpoint,                     // ex.: https://s3.connectcultura.org  (443 => sem signer)
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
  credentials: { accessKeyId, secretAccessKey },
  signer,                       // só entra quando precisar (porta ≠ 443/80)
});

// helper de upload com ContentLength
async function uploadFile(buffer, key, contentType = "application/octet-stream") {
  const Bucket = process.env.S3_BUCKET_NAME;
  const cmd = new PutObjectCommand({
    Bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
  });
  await s3.send(cmd);

  const encodedBucket = encodeURIComponent(Bucket);
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");

  const isMinio = !!endpoint;
  return isMinio
    ? `${endpoint.replace(/\/+$/, "")}/${encodedBucket}/${encodedKey}`
    : `https://${Bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

module.exports = { s3, uploadFile };
