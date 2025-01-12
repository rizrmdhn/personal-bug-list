import { AVALIABLE_BUG_SEVERITY } from "@/lib/constants";
import { fetchKey } from "@/lib/fetch-key";
import { formatErrorResponse, formatResponse } from "@/lib/response-formatter";
import { type NextRequest } from "next/server";

async function GET(req: NextRequest) {
  try {
    await fetchKey(req);

    return formatResponse(
      {
        code: 200,
        status: "success",
        message: "List of available severities",
      },
      AVALIABLE_BUG_SEVERITY,
    );
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return formatErrorResponse({
      code: 500,
      status: "error",
      message: "Internal server error",
    });
  }
}

export { GET };