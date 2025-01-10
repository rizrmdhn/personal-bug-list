import { fetchKey } from "@/lib/fetch-key";
import { formatErrorResponse, formatResponse } from "@/lib/response-formatter";
import { getDetailBug } from "@/server/queries/bugs.queries";
import { generatePresignedUrl } from "@/server/storage";
import { type NextRequest } from "next/server";

async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  },
) {
  try {
    await fetchKey(req);
    const id = (await params).id;

    const detailBug = await getDetailBug(id);

    if (!detailBug) {
      return formatErrorResponse({
        code: 404,
        status: "error",
        message: "Bug not found",
      });
    }

    // remap the data image
    detailBug.images = await Promise.all(
      detailBug.images.map(async (image) => ({
        ...image,
        url: await generatePresignedUrl({
          bucketName: "bugs",
          fileName: image.file,
          folderPath: "images",
        }),
      })),
    );

    return formatResponse(
      {
        code: 200,
        status: "success",
        message: "Detail bug",
      },
      detailBug,
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    if (error instanceof Error) {
      return formatErrorResponse({
        code: 500,
        status: "error",
        message: error.message,
      });
    }

    return formatErrorResponse({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
}

export { GET };
