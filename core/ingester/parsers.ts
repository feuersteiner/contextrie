export const parseText = (content: string): string =>
  content.trim().replace(/\r\n/g, "\n");

export const parseMarkdown = (content: string): string => parseText(content);

export const parseJSON = (content: string): Record<string, any>[] => {
  const parsed = JSON.parse(content);
  
  // If it's already an array of objects, return it
  if (Array.isArray(parsed)) {
    // Ensure all elements are objects (not primitives)
    return parsed.map((item, index) => {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        return item;
      }
      // Wrap primitives in an object
      return { value: item, _index: index };
    });
  }
  
  // If it's a single object, wrap it in an array
  if (typeof parsed === "object" && parsed !== null) {
    return [parsed];
  }
  
  // If it's a primitive, wrap it
  return [{ value: parsed }];
};

export const parseCSV = (content: string): string[] => {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]!);

  return lines.slice(1).map((line) => {
    const values = parseLine(line);
    return headers
      .map((h, i) => `${h}: ${values[i] ?? ""}`)
      .concat(values.slice(headers.length))
      .filter(Boolean)
      .join(", ");
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
