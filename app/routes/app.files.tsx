import {
  Page,
  Card,
  Spinner,
  Layout,
  TextField,
  IndexTable,
  useIndexResourceState,
  Text
} from "@shopify/polaris";

import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";
import { fetchFiles } from "app/services/files.server";
import { apiVersion, authenticate } from "app/shopify.server";
import type { ActionFunction } from "@remix-run/node";
import type { IFile, IFileResponse } from "app/types/files";
import type { IPageDirection } from "app/types/filter";

export const action: ActionFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop, accessToken } = session;
  if (!shop || !accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { cursor, pageDirection } = await request.json();

  try {
    const fileResponse = await fetchFiles(shop, apiVersion, accessToken, pageDirection, cursor);
    return new Response(JSON.stringify(fileResponse), {
      headers: { "Content-Type": "application/json" }
    }
    );
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

export default function FilesPage() {
  const [files, setFiles] = useState<IFile[]>([]);
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(files as any);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");
  const [startCursor, setStartCursor] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(true);
  // const [pageDirection, setPageDiretion] = useState<IPageDirection>("after");

  const fetchFiles = useCallback(async (pageDir: IPageDirection = "after") => {
    setLoading(true);
    const cursor = pageDir === "before" ? startCursor : endCursor;
    try {
      const response = await fetch('/api/files', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ cursor, search, pageDirection: pageDir }),
      });
      const data: IFileResponse = await response.json();
      console.log(data);

      setFiles(data.data);
      //setPageInfo(data.pageInfo);

      setHasNextPage(data.pageInfo.hasNextPage);
      setHasPreviousPage(data.pageInfo.hasPreviousPage);
      setStartCursor(data.pageInfo.startCursor); // Update cursor 
      setEndCursor(data.pageInfo.endCursor); // Update cursor 
    } catch (error) {
      console.error("Error fetching files:", error);
    }
    setLoading(false);
  }, [endCursor, startCursor, search]);
  // Mock data for demonstration purposes
  useEffect(() => {
    fetchFiles("after");
  }, []);


  // Handle search input
  // const handleSearch = (value: string) => setSearch(value);

  // // Handle sorting
  // const handleSort = (index: number, direction: SortDirection) => {
  //   console.log(direction);
  //   const columnKeys = ["name", "size", "uploadedAt"];
  //   setSortColumn(columnKeys[index]);
  //   setSortDirection(direction);
  // };

  // const filteredFiles = files
  //   //.filter((file) => file.filename.toLowerCase().includes(search.toLowerCase()))
  //   .sort((a, b) => {
  //     const factor = sortDirection === "ascending" ? 1 : -1;
  //     if (sortColumn === "size") return (a.fileSize - b.fileSize) * factor;
  //     if (sortColumn === "uploadedAt")
  //       return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
  //     return a.fileName.localeCompare(b.fileName) * factor;
  //   });


  const rowMarkup = files.map(
    ({ id, fileName, formattedFileSize, createdAt }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {fileName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{formattedFileSize}</IndexTable.Cell>
        <IndexTable.Cell>{createdAt}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page>
      <TitleBar title="Files" />
      <Layout>
        <Layout.Section>
          <Card>
            <TextField
              label="Search Files"
              value={search}
              onChange={(value) => setSearch(value)}
              placeholder="Search by file name"
              clearButton
              onClearButtonClick={() => setSearch("")}
              autoComplete="off"
            />
          </Card>
        </Layout.Section>
        {/* <button
          onClick={() => { fetchFiles(true) }}>Load more files</button> */}
        <Layout.Section>
          <Card>
            {loading && files.length === 0 ? (
              <Spinner size="large" />
            ) : (
              <IndexTable
                // condensed={useBreakpoints().smDown}
                resourceName={{ singular: "file", plural: "files" }}
                itemCount={files.length}
                selectedItemsCount={
                  allResourcesSelected ? 'All' : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: 'Name' },
                  { title: 'Size' },
                  { title: 'Created Date' },

                ]}
                pagination={{
                  hasNext: hasNextPage,
                  onNext: () => {
                    //setPageDiretion("after");
                    fetchFiles("after");
                  },
                  hasPrevious: hasPreviousPage,
                  onPrevious: () => {
                    //setPageDiretion("before");
                    fetchFiles("before");
                  }
                }}
              >
                {rowMarkup}
              </IndexTable>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}