// routes/api/files.ts
import { type ActionFunction } from "@remix-run/node";
import { fetchFilesAction } from "../services/files.server";
import { authenticate } from "app/shopify.server";
import type { IRequest } from "app/types/request";

export const action: ActionFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  if (!shop || !accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }
  const body: IRequest = await request.json();
  switch (body.operationName) {
    case "fetchFiles":
      return fetchFilesAction(request, body);
    default:
      return new Response("Operation not supported", { status: 400 });
  }
};
