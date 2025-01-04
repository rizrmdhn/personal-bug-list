import { AVALIABLE_BUG_TAG } from "@/lib/constants";
import { formatResponse } from "@/lib/response-formatter";
import { type NextRequest } from "next/server";

async function GET(req: NextRequest) {
  console.log("Request", req);

  return Response.json(
    formatResponse(
      {
        code: 200,
        status: "success",
        message: "List of available bug tags",
      },
      {
        tags: AVALIABLE_BUG_TAG,
      },
    ),
  );
}

export { GET };
