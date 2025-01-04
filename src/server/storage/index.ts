import "server-only";

import { env } from "@/env";
import { Client, type ClientOptions } from "minio";

const config: ClientOptions = {
  accessKey: env.S3_ACCESS_KEY,
  endPoint: env.S3_ENDPOINT,
  secretKey: env.S3_SECRET_KEY,
  useSSL: false,
};

export const s3Client = new Client(config);

export async function createBucketIfNotExist(bucketName: string) {
  const isExist = await s3Client.bucketExists(bucketName);

  if (!isExist) {
    await s3Client.makeBucket(bucketName);
  }
}

export async function saveFileInBucket({
  bucketName,
  fileName,
  file,
  folderPath = "", // Add optional folderPath parameter
}: {
  bucketName: string;
  fileName: string;
  file: File;
  folderPath?: string;
}) {
  // create bucket if not exist
  await createBucketIfNotExist(bucketName);

  // Construct the full path by combining folderPath and fileName
  const fullPath = folderPath
    ? `${folderPath.replace(/^\/+|\/+$/g, "")}/${fileName}` // Remove leading/trailing slashes
    : fileName;

  const fileExist = await checkFileExistsInBucket({
    bucketName,
    fileName: fullPath,
  });

  if (fileExist) {
    throw new Error("File already exist");
  }

  // convert file to Buffer | internal.Readable
  const buffer = Buffer.from(await file.arrayBuffer());
  return await s3Client.putObject(bucketName, fullPath, buffer);
}

export async function getFileFromBucket({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
  folderPath?: string;
}) {
  try {
    await s3Client.statObject(bucketName, fileName);
  } catch (error) {
    console.error(error);
    return null;
  }
  return await s3Client.getObject(bucketName, fileName);
}

export async function deleteFileFromBucket({
  bucketName,
  fileName,
  folderPath = "",
}: {
  bucketName: string;
  fileName: string;
  folderPath?: string;
}) {
  // check if file exist
  const fileExist = await checkFileExistsInBucket({
    bucketName,
    fileName,
    folderPath,
  });

  if (!fileExist) {
    throw new Error("File not found");
  }

  // Construct the full path by combining folderPath and fileName
  const fullPath = folderPath
    ? `${folderPath.replace(/^\/+|\/+$/g, "")}/${fileName}` // Remove leading/trailing slashes
    : fileName;

  await s3Client.removeObject(bucketName, fullPath);
}

export async function checkFileExistsInBucket({
  bucketName,
  fileName,
  folderPath = "",
}: {
  bucketName: string;
  fileName: string;
  folderPath?: string;
}) {
  try {
    // Construct the full path by combining folderPath and fileName
    const fullPath = folderPath
      ? `${folderPath.replace(/^\/+|\/+$/g, "")}/${fileName}` // Remove leading/trailing slashes
      : fileName;

    await s3Client.statObject(bucketName, fullPath);
  } catch {
    return false;
  }
  return true;
}

export async function createPresignedUrl({
  bucketName,
  fileName,
  // default expiry time is 24 hours
  expiryTime = 24 * 60 * 60,
}: {
  bucketName: string;
  fileName: string;
  expiryTime?: number;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExist(bucketName);

  return await s3Client.presignedPutObject(bucketName, fileName, expiryTime);
}

export async function generatePresignedUrl({
  bucketName,
  fileName,
  expiryTime = 24 * 60 * 60,
  folderPath = "",
}: {
  bucketName: string;
  fileName: string;
  expiryTime?: number;
  folderPath?: string;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExist(bucketName);

  // Construct the full path by combining folderPath and fileName
  const fullPath = folderPath
    ? `${folderPath.replace(/^\/+|\/+$/g, "")}/${fileName}` // Remove leading/trailing slashes
    : fileName;

  return await s3Client.presignedGetObject(bucketName, fullPath, expiryTime);
}

export async function getFileUrl({
  bucketName,
  fileName,
}: {
  bucketName: string;
  fileName: string;
}) {
  // Create bucket if it doesn't exist
  await createBucketIfNotExist(bucketName);

  return await s3Client.presignedGetObject(bucketName, fileName);
}
