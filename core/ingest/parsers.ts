export const parseText = (content: string): string =>
  content.trim().replace(/\r\n/g, "\n");

export const parseMarkdown = (content: string): string => parseText(content);

export const parseCSV = (content: string): string[] => {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]!);

  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return headers.map((h, i) => `${h}: ${values[i] ?? ""}`).join(", ");
  });
};

const parseLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};
