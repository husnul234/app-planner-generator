import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

let _s3: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3) {
    const endpoint =
      process.env.AWS_ENDPOINT_URL_S3 ||
      "https://br-aged-king-a122ccgb.storage.c-1.ap-southeast-1.aws.neon.tech";
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "nak_live_eb77b1ccf1d0420f9651c755d6526d44";
    const secretAccessKey =
      process.env.AWS_SECRET_ACCESS_KEY ||
      "nsk_live_ca98f453d296fbfdc19c2cb4ff36665c46a37283df10522dfb0aa2caea3650b0";
    const region = process.env.AWS_REGION || "ap-southeast-1";

    _s3 = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }
  return _s3;
}

export const DEFAULT_BUCKET = "assets";

export async function checkStorageHealth(bucketName = DEFAULT_BUCKET) {
  const start = Date.now();
  try {
    await getS3Client().send(new HeadBucketCommand({ Bucket: bucketName }));
    const list = await getS3Client().send(
      new ListObjectsV2Command({ Bucket: bucketName, MaxKeys: 5 })
    );
    const duration = Date.now() - start;
    return {
      status: "ok",
      bucket: bucketName,
      durationMs: duration,
      objectCountSample: list.KeyCount || 0,
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
    };
  } catch (error: unknown) {
    const duration = Date.now() - start;
    const err = error as Error;
    return {
      status: "error",
      bucket: bucketName,
      durationMs: duration,
      error: err.message,
    };
  }
}

export async function uploadObject(
  key: string,
  content: string | Uint8Array,
  contentType = "text/plain",
  bucketName = DEFAULT_BUCKET
) {
  const body = typeof content === "string" ? Buffer.from(content) : content;
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  return await getS3Client().send(command);
}

export async function getObject(
  key: string,
  bucketName = DEFAULT_BUCKET
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  const response = await getS3Client().send(command);
  if (!response.Body) {
    throw new Error(`Empty body returned for key: ${key}`);
  }
  return await response.Body.transformToString();
}

export async function listObjects(prefix = "", bucketName = DEFAULT_BUCKET) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });
  const response = await getS3Client().send(command);
  return (
    response.Contents?.map((item) => ({
      key: item.Key || "",
      size: item.Size || 0,
      lastModified: item.LastModified?.toISOString() || "",
    })) || []
  );
}

export async function deleteObject(key: string, bucketName = DEFAULT_BUCKET) {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return await getS3Client().send(command);
}

export async function deleteFolder(prefix: string, bucketName = DEFAULT_BUCKET) {
  const objects = await listObjects(prefix, bucketName);
  for (const obj of objects) {
    if (obj.key) {
      await deleteObject(obj.key, bucketName);
    }
  }
}
