import { readFile } from "node:fs/promises";
import { ListSource } from "@contextrie/core";
import { generateId } from "../../utils";

export const parseCsvFileSource = async (filePath: string): Promise<ListSource> => {
  const content = await readAndNormalizeFile(filePath);
  const rows = parseCsvRows(content);

  return new ListSource(
    generateId(),
    undefined,
    rows.map(formatCsvRow),
    filePath,
  );
};

const readAndNormalizeFile = async (filePath: string): Promise<string> => {
  const content = await readFile(filePath, "utf8");
  return content.replace(/\r\n?/g, "\n");
};

const formatCsvRow = (row: string[], index: number): string =>
  `row ${index + 1}: ${row.map((value) => value.trim()).join(" | ")}`;

interface CsvParseState {
  currentCell: string;
  currentRow: string[];
  inQuotes: boolean;
  rows: string[][];
  skipNextQuote: boolean;
}

const parseCsvRows = (content: string): string[][] => {
  const characters = Array.from(content);
  const finalState = characters.reduce<CsvParseState>(
    (state, character, index) => {
      if (state.skipNextQuote) {
        return {
          ...state,
          skipNextQuote: false,
        };
      }

      if (character === '"') {
        if (state.inQuotes && characters[index + 1] === '"') {
          return {
            ...state,
            currentCell: `${state.currentCell}"`,
            skipNextQuote: true,
          };
        }

        return {
          ...state,
          inQuotes: !state.inQuotes,
        };
      }

      if (character === "," && !state.inQuotes) {
        return appendCell(state);
      }

      if (character === "\n" && !state.inQuotes) {
        return appendRow(appendCell(state));
      }

      return {
        ...state,
        currentCell: `${state.currentCell}${character}`,
      };
    },
    {
      currentCell: "",
      currentRow: [],
      inQuotes: false,
      rows: [],
      skipNextQuote: false,
    },
  );

  const completedState =
    finalState.currentCell.length > 0 || finalState.currentRow.length > 0
      ? appendRow(appendCell(finalState))
      : finalState;

  return completedState.rows;
};

const appendCell = (state: CsvParseState): CsvParseState => ({
  ...state,
  currentCell: "",
  currentRow: [...state.currentRow, state.currentCell],
});

const appendRow = (state: CsvParseState): CsvParseState => {
  if (state.currentRow.every((cell) => cell.trim() === "")) {
    return {
      ...state,
      currentRow: [],
    };
  }

  return {
    ...state,
    currentRow: [],
    rows: [...state.rows, state.currentRow],
  };
};
