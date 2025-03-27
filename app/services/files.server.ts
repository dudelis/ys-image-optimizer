import type { IFileResponse, IFile, IPageInfo } from "app/types/files";
import type { IPageDirection } from "app/types/filter";
import { extractFileName, formatFileSize, isEmptyObject } from "app/utils";

export async function fetchFiles(
  shop: string,
  apiVersion: string,
  accessToken: string,
  direction: IPageDirection,
  cursor: string | null,
): Promise<IFileResponse> {
  const dir = direction === "before" ? "before" : "after";
  const limit = dir === "before" ? "last" : "first"; // Set limit to 10 for "after" direction
  const response = await fetch(
    `https://${shop}/admin/api/${apiVersion}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `{
          files(${limit}: 10, ${dir}: ${cursor ? `"${cursor}"` : null}) {
          pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor        
        }
            edges {
              node {
                ... on MediaImage {
                  id
                  createdAt
                  originalSource {
                    fileSize
                    url
                  }
                  image {
                    altText
                    url
                  }
                }
              }
            }
          }
        }
      `,
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }

  const { data } = await response.json();
  const files = data.files.edges
    .map(({ node }: any) => {
      if (!node || !isEmptyObject(node)) {
        const file: IFile = {
          id: node.id,
          createdAt: node.createdAt,
          fileName: extractFileName(node.originalSource?.url),
          formattedFileSize: formatFileSize(node.originalSource?.fileSize),
          fileSize: node.originalSource?.fileSize,
          url: node.originalSource?.url,
          altText: node.image?.altText,
        };
        return file;
      }
    })
    .filter((file: IFile) => file !== undefined);
  const pageInfo = data.files.pageInfo as IPageInfo;

  return {
    data: files,
    pageInfo,
  };
}
