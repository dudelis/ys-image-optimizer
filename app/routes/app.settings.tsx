import {
  Page,
  Card,
  TextField,
  BlockStack,
  Box,
  Text,
  InlineGrid
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";

export default function SettingsPage() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const handleUrlChange = (value: string) => setUrl(value);
  const handleApiKeyChange = (value: string) => setApiKey(value);

  return (
    <Page
      primaryAction={{ content: "View on your store", disabled: true }}
      secondaryActions={[
        {
          content: "Duplicate",
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
      ]}
    >
      <TitleBar title="Settings" />
      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: "400", sm: "0" }}
            paddingInlineEnd={{ xs: "400", sm: "0" }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                TinyPNG Configuration
              </Text>
              <Text as="p" variant="bodyMd">
                Connection details for TinyPNG service
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextField autoComplete="off" label="TinyPNG URL" value={url} onChange={handleUrlChange} />
              <TextField autoComplete="off" label="API Key" value={apiKey} onChange={handleApiKeyChange} type="password" />
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}