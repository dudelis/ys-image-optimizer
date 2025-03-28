import {
  Page,
  Card,
  Spinner,
  Layout,
  IndexTable,
  useIndexResourceState,
  Text,
  IndexFilters,
  useSetIndexFiltersMode
} from "@shopify/polaris";

import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useEffect, useCallback } from "react";
import type { IFile, IFileResponse } from "app/types/files";
import type { IFileRequestVariables } from "app/types/request";
import type { IndexFiltersProps } from "@shopify/polaris";



export default function FilesPage() {
  const [files, setFiles] = useState<IFile[]>([]);
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(files as any);
  const [loading, setLoading] = useState(true);
  const [sortSelected, setSortSelected] = useState(['order asc']);
  const { mode, setMode } = useSetIndexFiltersMode();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [reverse, setReverse] = useState<boolean>(false);
  const [startCursor, setStartCursor] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(true);

  const fetchFiles = useCallback(async (variables: IFileRequestVariables) => {
    setLoading(true);
    try {
      const response = await fetch('/api/files', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          operationName: "fetchFiles",
          variables
        }),
      });
      const data: IFileResponse = await response.json();
      setFiles(data.data);
      setHasNextPage(data.pageInfo.hasNextPage);
      setHasPreviousPage(data.pageInfo.hasPreviousPage);
      setStartCursor(data.pageInfo.startCursor); // Update cursor 
      setEndCursor(data.pageInfo.endCursor); // Update cursor 
    } catch (error) {
      console.error("Error fetching files:", error);
    }
    setLoading(false);
  }, []);
  // Mock data for demonstration purposes
  useEffect(() => {
    fetchFiles({
      first: 10,
      after: null,
      last: null,
      before: null,
      sortKey: sortColumn,//sortColumn,
      reverse: reverse,
      query: "status:ready"
    } as IFileRequestVariables);
  }, [sortColumn, reverse, fetchFiles]);

  useEffect(() => {
    if (sortSelected.length > 0) {
      const [sortKey, sortDirection] = sortSelected[0].split(" ");
      setSortColumn(sortKey);
      setReverse(sortDirection === "desc");
    }
  }, [sortSelected])

  // SORTINT
  const sortOptions: IndexFiltersProps['sortOptions'] = [
    { label: 'Title', value: 'FILENAME asc', directionLabel: 'A-Z' },
    { label: 'Title', value: 'FILENAME desc', directionLabel: 'Z-A' },
    { label: 'Size', value: 'ORIGINAL_UPLOAD_SIZE asc', directionLabel: 'Ascending' },
    { label: 'Size', value: 'ORIGINAL_UPLOAD_SIZE desc', directionLabel: 'Descending' },
    { label: 'Created Date', value: 'ID asc', directionLabel: 'Ascending' },
    { label: 'Created Date', value: 'ID desc', directionLabel: 'Descending' }
  ];

  const rowMarkup = files.map(
    ({ id, fileName, formattedFileSize, createdAt, altText }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span" breakWord>
            {fileName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <div style={{ display: 'block', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {altText}
          </div>
        </IndexTable.Cell>
        <IndexTable.Cell>{formattedFileSize}</IndexTable.Cell>
        <IndexTable.Cell>{new Date(createdAt).toLocaleString()}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page fullWidth>
      <TitleBar title="Files" />
      <Layout>
        {/* <Layout.Section>
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
        </Layout.Section> */}
        <Layout.Section>
          <Card>
            {loading && files.length === 0 ? (
              <Spinner size="large" />
            ) : (
              <>
                <IndexFilters
                  sortOptions={sortOptions}
                  sortSelected={sortSelected}
                  queryValue=""
                  queryPlaceholder="Searching in all"
                  onQueryChange={() => { }}
                  onQueryClear={() => { }}
                  onSort={(v) => { console.log(v); setSortSelected(v) }}
                  primaryAction={{
                    type: 'save-as',
                    onAction: (name: string) => {
                      console.log(name);
                      return new Promise((resolve) => {
                        setTimeout(() => {
                          resolve(true);
                        }, 1000);
                      });
                    },
                    disabled: false,
                    loading: false,
                  }}
                  cancelAction={{
                    onAction: () => { },
                    disabled: false,
                    loading: false,
                  }}
                  tabs={[]}
                  selected={1}
                  // onSelect={setSelected}
                  canCreateNewView={false}
                  onCreateNewView={(name) => {
                    return new Promise((resolve) => {
                      setTimeout(() => {
                        resolve(true);
                      }, 1000);
                    })
                  }
                  }
                  filters={[]}
                  appliedFilters={[]}
                  onClearAll={() => { }}
                  mode={mode}
                  setMode={setMode}
                  hideFilters
                  hideQueryField
                />
                <IndexTable
                  resourceName={{ singular: "file", plural: "files" }}
                  itemCount={files.length}
                  selectedItemsCount={
                    allResourcesSelected ? 'All' : selectedResources.length
                  }
                  onSelectionChange={handleSelectionChange}
                  headings={[
                    { title: 'File name' },
                    { title: 'Alt Text' },
                    { title: 'Size' },
                    { title: 'Created Date' },

                  ]}
                  pagination={{
                    hasNext: hasNextPage,
                    onNext: () => {
                      //setPageDiretion("after");
                      fetchFiles({
                        first: 10,
                        after: endCursor,
                        last: null,
                        before: null,
                        sortKey: null,
                        reverse: false,
                      } as IFileRequestVariables);
                    },
                    hasPrevious: hasPreviousPage,
                    onPrevious: () => {
                      //setPageDiretion("before");
                      fetchFiles({
                        first: null,
                        after: null,
                        last: 10,
                        before: startCursor,
                        sortKey: null,
                        reverse: false,
                      } as IFileRequestVariables);
                    }
                  }}
                >
                  {rowMarkup}
                </IndexTable>
              </>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}