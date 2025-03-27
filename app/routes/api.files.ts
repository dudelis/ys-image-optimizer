// routes/api/files.ts
import { type ActionFunction } from "@remix-run/node";
import { fetchFiles } from "../services/files.server";
import { authenticate, apiVersion } from "app/shopify.server";
import type { IPageDirection } from "app/types/filter";

export const action: ActionFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  if (!shop || !accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const {
      cursor,
      pageDirection,
    }: { cursor: string; pageDirection: IPageDirection } = await request.json();

    const fileResponse = await fetchFiles(
      shop,
      apiVersion,
      accessToken,
      pageDirection,
      cursor,
    );
    return Response.json(fileResponse);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
};
