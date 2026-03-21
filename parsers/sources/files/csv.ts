import { readFile } from "node:fs/promises";
import { DocumentSource, ListSource } from "@contextrie/core";
import { generateId } from "../../utils";

export const parseCsvFileSource = async (
  filePath: string,
): Promise<DocumentSource | ListSource> => {
  const content = await readTextFile(filePath);
  const id = generateId();
  const rows = parseCsv(content);

  if (rows.length === 0) {
    return new DocumentSource(id, undefined, "");
  }

  if (shouldParseCsvAsDocument(rows)) {
    return new DocumentSource(id, undefined, toCsvDocument(rows));
  }

  return new ListSource(id, undefined, toCsvItems(rows));
};

const readTextFile = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath, "utf8");
  return content.replace(/\r\n?/g, "\n");
};

const shouldParseCsvAsDocument = (rows: string[][]): boolean => {
  if (rows.length <= 2) {
    return true;
  }

  const maxColumnCount = rows.reduce(
    (largest, row) => Math.max(largest, row.length),
    0,
  );
  const totalCellCount = rows.reduce((count, row) => count + row.length, 0);

  return rows.length <= 4 && maxColumnCount <= 3 && totalCellCount <= 12;
};

const toCsvDocument = (rows: string[][]): string => {
  const hasHeader = looksLikeHeaderRow(rows);
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const headers = hasHeader ? rows[0] ?? [] : [];

  return dataRows
    .map((row, index) => {
      if (headers.length === row.length && headers.length > 0) {
        const pairs = row.map((value, columnIndex) => {
          const header = headers[columnIndex]?.trim() || `column${columnIndex + 1}`;
          return `${header}: ${value.trim()}`;
        });

        return pairs.join(" | ");
      }

      return `row ${index + 1}: ${row.map((value) => value.trim()).join(" | ")}`;
    })
    .join("\n");
};

const toCsvItems = (rows: string[][]): string[] => {
  const hasHeader = looksLikeHeaderRow(rows);
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const headers = hasHeader ? rows[0] ?? [] : [];

  return dataRows
    .filter((row) => row.some((value) => value.trim().length > 0))
    .map((row, index) => {
      if (headers.length === row.length && headers.length > 0) {
        return row
          .map((value, columnIndex) => {
            const header =
              headers[columnIndex]?.trim() || `column${columnIndex + 1}`;
            return `${header}: ${value.trim()}`;
          })
          .join(" | ");
      }

      return `row ${index + 1}: ${row.map((value) => value.trim()).join(" | ")}`;
    });
};

const looksLikeHeaderRow = (rows: string[][]): boolean => {
  if (rows.length < 2) {
    return false;
  }

  const [firstRow, secondRow] = rows;
  if (!firstRow || !secondRow || firstRow.length === 0) {
    return false;
  }

  const normalizedFirstRow = firstRow.map((value) => value.trim().toLowerCase());
  const uniqueHeaderCount = new Set(normalizedFirstRow.filter(Boolean)).size;
  const numericFirstRowCount = firstRow.filter(isNumericLike).length;
  const numericSecondRowCount = secondRow.filter(isNumericLike).length;

  return (
    uniqueHeaderCount === firstRow.length &&
    numericFirstRowCount < firstRow.length &&
    numericSecondRowCount >= numericFirstRowCount
  );
};

const isNumericLike = (value: string): boolean =>
  value.trim() !== "" && !Number.isNaN(Number(value));

const parseCsv = (content: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (character === "\"") {
      const nextCharacter = content[index + 1];
      if (inQuotes && nextCharacter === "\"") {
        cell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (character === "\n" && !inQuotes) {
      row.push(cell);
      pushCsvRow(rows, row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    pushCsvRow(rows, row);
  }

  return rows;
};

const pushCsvRow = (rows: string[][], row: string[]): void => {
  if (row.length === 1 && row[0]?.trim() === "") {
    return;
  }

  rows.push(row);
};
