import { authenticate } from "app/shopify.server";
import type { IFileResponse, IFile, IPageInfo } from "app/types/files";
import { extractFileName, formatFileSize, isEmptyObject } from "app/utils";
import type { IRequest } from "app/types/request";

export async function fetchFilesAction(
  request: Request,
  body: IRequest,
): Promise<IFileResponse> {
  const { admin } = await authenticate.admin(request);
  //const reqData: IRequest = await request.json();
  const response = await admin.graphql(
    `#graphql
    query FilesQuery($first: Int, $last: Int, $after: String, $before: String, $sortKey: FileSortKeys, $reverse: Boolean, $query: String) {
    files(
      first: $first
      last: $last
      after: $after
      before: $before
      sortKey: $sortKey
      reverse: $reverse
      query: $query
    ) {
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
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor        
        }
      }
    }`,
    { variables: body.variables },
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
