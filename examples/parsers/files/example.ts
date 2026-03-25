export const summarizeRepository = (files: string[]): string[] => {
  return files
    .map((file) => file.trim())
    .filter(Boolean)
    .map((file, index) => `${index + 1}. ${file}`);
};
