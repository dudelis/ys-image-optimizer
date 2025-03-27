export function extractFileName(url: string): string {
  try {
    // Create a URL object to safely parse the URL
    const parsedUrl = new URL(url);
    // Extract the pathname and split by "/"
    const pathParts = parsedUrl.pathname.split("/");
    // The filename is the last part of the path
    return pathParts.pop() || "";
  } catch (error) {
    console.error("Invalid URL:", error);
    return "";
  }
}
export function isEmptyObject(obj: Object): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}
export function formatFileSize(size: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let formattedSize = size;

  while (formattedSize >= 1024 && index < units.length - 1) {
    formattedSize /= 1024;
    index++;
  }

  return `${formattedSize.toFixed(2)} ${units[index]}`;
}
