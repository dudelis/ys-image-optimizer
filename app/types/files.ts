export interface IFile {
  id: string;
  createdAt: string;
  fileName: string;
  formattedFileSize: string;
  fileSize: number;
  url: string;
  altText: string | null;
}

export interface IPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string | null;
  startCursor: string | null;
}

export interface IFileResponse {
  data: IFile[];
  pageInfo: IPageInfo;
}
