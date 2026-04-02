import path from "node:path";
import {
  AGENTS_DIR_NAME,
  PROGRESS_FILE_NAME,
  TASKS_DIR_NAME,
} from "../constants/paths.ts";
import {
  createDirIfNotExists,
  createFileIfNotExists,
} from "../lib/io.ts";
import { PROGRESS_MARKDOWN_CONTENT_TEMPLATE } from "../templates/progress.ts";

export interface InitHarnessResult {
  created: string[];
  existing: string[];
}

/**
 * Initializes the harness structure in the provided working directory.
 * Creates the expected top-level directories and progress file when missing.
 */
export const initHarness = async (
  workingDir: string,
): Promise<InitHarnessResult> => {
  const result: InitHarnessResult = {
    created: [],
    existing: [],
  };

  const tasksDirPath = path.join(workingDir, TASKS_DIR_NAME);
  const agentsDirPath = path.join(workingDir, AGENTS_DIR_NAME);
  const progressFilePath = path.join(workingDir, PROGRESS_FILE_NAME);

  const tasksDirResult = await createDirIfNotExists(tasksDirPath);
  const agentsDirResult = await createDirIfNotExists(agentsDirPath);
  const progressFileResult = await createFileIfNotExists(
    progressFilePath,
    PROGRESS_MARKDOWN_CONTENT_TEMPLATE,
  );

  result[tasksDirResult.existed ? "existing" : "created"].push(tasksDirPath);
  result[agentsDirResult.existed ? "existing" : "created"].push(agentsDirPath);
  result[progressFileResult.existed ? "existing" : "created"].push(
    progressFilePath,
  );

  return result;
};
