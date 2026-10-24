import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

function getStorageClient(): S3Client {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "ap-southeast-1";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Missing Neon Object Storage credentials in environment (AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)"
    );
  }

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export const s3 = getStorageClient();
export const DEFAULT_BUCKET = "assets";

export async function checkStorageHealth(bucketName = DEFAULT_BUCKET) {
  const start = Date.now();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    const list = await s3.send(
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
  return await s3.send(command);
}

export async function getObject(
  key: string,
  bucketName = DEFAULT_BUCKET
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  const response = await s3.send(command);
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
  const response = await s3.send(command);
  return (
    response.Contents?.map((item) => ({
      key: item.Key || "",
      size: item.Size || 0,
      lastModified: item.LastModified?.toISOString() || "",
    })) || []
  );
}
