import { fetchKey } from "@/lib/fetch-key";
import { base64ToFile, getFileExtension } from "@/lib/file-converter";
import {
  formatErrorResponse,
  formatResponse,
  formatZodErrorResponse,
} from "@/lib/response-formatter";
import {
  createBugImageFileSchema,
  type CreateBugImageFileSchemaType,
  createBugImageSchema,
} from "@/schema/bug-images.schema";
import {
  createBugSchema,
  type CreateBugSchemaType,
} from "@/schema/bugs.schema";
import { db, type DBType } from "@/server/db";
import { createBugImages } from "@/server/queries/bug-images.queries";
import { createBugs } from "@/server/queries/bugs.queries";
import { deleteFindedFileFromBucket, saveFileInBucket } from "@/server/storage";
import { type SelectApplication } from "@/types/applications.types";
import { getUnixTime } from "date-fns";
import { S3Error } from "minio";
import { type NextRequest } from "next/server";
import { ZodError } from "zod";

async function handleJsonRequest(
  data: CreateBugSchemaType,
  app: SelectApplication,
  db: DBType,
  savedFileNames: string[],
) {
  const safeBase64Image = createBugImageSchema.parse(data);
  if (!safeBase64Image.file) {
    throw formatErrorResponse({
      code: 400,
      status: "error",
      message: "Image is required",
    });
  }

  await Promise.all(
    safeBase64Image.file.map(async (image) => {
      const fileName = `${app.id}-${getUnixTime(new Date())}`;
      const file = await base64ToFile(image, {
        filename: fileName,
      });
      await saveFileInBucket({
        bucketName: "bugs",
        fileName: file.name,
        file,
        folderPath: "images",
      });

      await createBugImages(db, app.id, fileName);

      savedFileNames.push(fileName);
    }),
  );
}

async function handleFormDataRequest(
  data: CreateBugImageFileSchemaType,
  app: SelectApplication,
  dbClient: DBType,
  bugId: string,
  savedFileNames: string[],
) {
  const safeFileList = createBugImageFileSchema.parse(data);
  if (!safeFileList.file) {
    throw formatErrorResponse({
      code: 400,
      status: "error",
      message: "Image is required",
    });
  }

  await Promise.all(
    safeFileList.file.map(async (file) => {
      const extension = getFileExtension(file.type);
      const fileName = `${app.id}-${getUnixTime(new Date())}${extension}`;
      await saveFileInBucket({
        bucketName: "bugs",
        fileName,
        file,
        folderPath: "images",
      });
      await createBugImages(dbClient, bugId, fileName);

      savedFileNames.push(fileName);
    }),
  );
}

async function POST(req: NextRequest) {
  const savedFileNames: string[] = [];
  try {
    const app = await fetchKey(req);
    const contentType = req.headers.get("content-type");

    const data = await (async () => {
      if (contentType?.includes("application/json")) {
        return await req.json();
      }
      if (contentType?.includes("multipart/form-data")) {
        const formData = await req.formData();
        const files = formData.getAll("file");
        const tagsString = formData.get("tags") as string;
        const tags = JSON.parse(tagsString); // Parse the JSON string back to array

        return {
          ...Object.fromEntries(formData),
          tags, // Use the parsed tags array
          file: files,
        };
      }
      throw formatErrorResponse({
        code: 400,
        status: "error",
        message: "Unsupported content type",
      });
    })();

    const safeData = createBugSchema.parse(data);

    const result = await db.transaction(async (dbClient) => {
      const bug = await createBugs(dbClient, app.id, {
        description: safeData.description,
        severity: safeData.severity,
        status: safeData.status,
        tags: safeData.tags,
        title: safeData.title,
      });

      if (contentType?.includes("application/json")) {
        await handleJsonRequest(safeData, app, dbClient, savedFileNames);
      } else if (contentType?.includes("multipart/form-data")) {
        await handleFormDataRequest(
          data,
          app,
          dbClient,
          bug.id,
          savedFileNames,
        );
      }

      return bug;
    });

    return formatResponse(
      {
        code: 200,
        status: "success",
        message: "Bug report created successfully",
      },
      result,
    );
  } catch (error) {
    console.log(error);
    if (error instanceof Response) return error;
    if (error instanceof ZodError) return formatZodErrorResponse(error.errors);
    if (error instanceof S3Error) {
      throw formatErrorResponse({
        code: 500,
        status: "error",
        message: error.message,
      });
    }

    // delete files from bucket
    await Promise.all(
      savedFileNames.map(async (fileName) => {
        await deleteFindedFileFromBucket({
          bucketName: "bugs",
          fileName,
          folderPath: "images",
        });
      }),
    );

    return formatErrorResponse({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
}

export { POST };
