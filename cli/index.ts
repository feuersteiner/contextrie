#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { globSync } from "fast-glob";
import meow from "meow";
import { createOpenAI } from "@ai-sdk/openai";
import {
  ComposerAgent,
  DocumentSource,
  IndexingAgent,
  JudgeAgent,
  type IndexedSourceBase,
  ListSource,
  type Metadata,
} from "@contextrie/core";
import {
  parseCsvFileSource,
  parseMarkdownFileSource,
  parseReferenceTextFileSource,
  supportsTextFileSource,
} from "@contextrie/parsers";

const CONTEXTRIE_DIRECTORY = ".contextrie";
const CONFIG_FILENAME = "config.json";
const CONTEXT_FILENAME = "context.md";
const SOURCES_FILENAME = "sources.json";

interface CliConfig {
  OPENAI_API_KEY: string;
  OPENAI_BASE_URL?: string;
  OPENAI_MODEL: string;
}

type SourceFormat = "text" | "markdown" | "csv";

interface SourceManifestRecord {
  id: string;
  kind: string;
  format: SourceFormat;
  path?: string;
  metadata: Metadata;
}

interface SourceManifest {
  version: 1;
  sources: SourceManifestRecord[];
}

const cli = meow(
  `
Usage
  $ contextrie --index [paths...]
  $ contextrie --task "describe the task"

Options
  -i, --index                Index source files into .contextrie/sources.json
  -t, --task                 Compose .contextrie/context.md for a task
      --all                  Recursively index supported source files in the current directory
      --openai-api-key       OpenAI-compatible API key
      --openai-base-url      OpenAI-compatible base URL
      --openai-model         Model used for indexing, judging, and composition
      --help                 Show help
      --version              Show version
`,
  {
    importMeta: import.meta,
    flags: {
      all: {
        type: "boolean",
        default: false,
      },
      index: {
        shortFlag: "i",
        type: "boolean",
        default: false,
      },
      openaiApiKey: {
        type: "string",
      },
      openaiBaseUrl: {
        type: "string",
      },
      openaiModel: {
        type: "string",
      },
      task: {
        shortFlag: "t",
        type: "string",
      },
    },
  },
);

const normalizeRelativePath = (value: string): string =>
  value.split(path.sep).join("/");

const isGlobPattern = (value: string): boolean => /[*?[\]{}]/.test(value);

const markdownFileExtensions = new Set([".md", ".markdown"]);

const getContextrieDirectory = (rootDirectory: string): string =>
  path.join(rootDirectory, CONTEXTRIE_DIRECTORY);

const getConfigPath = (rootDirectory: string): string =>
  path.join(getContextrieDirectory(rootDirectory), CONFIG_FILENAME);

const getSourcesPath = (rootDirectory: string): string =>
  path.join(getContextrieDirectory(rootDirectory), SOURCES_FILENAME);

const getContextPath = (rootDirectory: string): string =>
  path.join(getContextrieDirectory(rootDirectory), CONTEXT_FILENAME);

const ensureContextrieDirectory = async (rootDirectory: string): Promise<void> => {
  await mkdir(getContextrieDirectory(rootDirectory), { recursive: true });
};

const readJsonFile = async <T>(filePath: string): Promise<T> => {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
};

const writeJsonFile = async (filePath: string, value: unknown): Promise<void> => {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const readSavedConfig = async (
  rootDirectory: string,
): Promise<Partial<CliConfig>> => {
  const configPath = getConfigPath(rootDirectory);
  if (!existsSync(configPath)) {
    return {};
  }

  return await readJsonFile<Partial<CliConfig>>(configPath);
};

const resolveConfig = async (rootDirectory: string): Promise<CliConfig> => {
  const savedConfig = await readSavedConfig(rootDirectory);
  const resolvedConfig: Partial<CliConfig> = {
    OPENAI_API_KEY:
      cli.flags.openaiApiKey ??
      savedConfig.OPENAI_API_KEY ??
      process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL:
      cli.flags.openaiBaseUrl ??
      savedConfig.OPENAI_BASE_URL ??
      process.env.OPENAI_BASE_URL,
    OPENAI_MODEL:
      cli.flags.openaiModel ??
      savedConfig.OPENAI_MODEL ??
      process.env.OPENAI_MODEL,
  };

  if (!resolvedConfig.OPENAI_API_KEY) {
    throw new Error(
      "Missing OpenAI-compatible API key. Provide --openai-api-key, set OPENAI_API_KEY, or save it in .contextrie/config.json.",
    );
  }

  if (!resolvedConfig.OPENAI_MODEL) {
    throw new Error(
      "Missing OpenAI-compatible model. Provide --openai-model, set OPENAI_MODEL, or save it in .contextrie/config.json.",
    );
  }

  return resolvedConfig as CliConfig;
};

const persistConfig = async (
  rootDirectory: string,
  config: CliConfig,
): Promise<void> => {
  await ensureContextrieDirectory(rootDirectory);
  await writeJsonFile(getConfigPath(rootDirectory), config);
};

const createModel = (config: CliConfig) => {
  const openai = createOpenAI({
    apiKey: config.OPENAI_API_KEY,
    baseURL: config.OPENAI_BASE_URL,
  });

  return openai.chat(config.OPENAI_MODEL);
};

const sortAndDedupe = (values: string[]): string[] =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));

const getSourceFormat = (filePath: string): SourceFormat | undefined => {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".csv") {
    return "csv";
  }

  if (markdownFileExtensions.has(extension)) {
    return "markdown";
  }

  if (supportsTextFileSource(filePath)) {
    return "text";
  }

  return undefined;
};

const isSupportedSourcePath = (filePath: string): boolean =>
  getSourceFormat(filePath) !== undefined;

const parseSourceForIndex = async (
  absolutePath: string,
  relativePath: string,
): Promise<{
  format: SourceFormat;
  source: IndexedSourceBase;
}> => {
  const format = getSourceFormat(absolutePath);
  if (!format) {
    throw new Error(`Unsupported source file: ${absolutePath}`);
  }

  if (format === "text") {
    return {
      format,
      source: await parseReferenceTextFileSource(absolutePath, {
        path: relativePath,
      }),
    };
  }

  if (format === "markdown") {
    const parsedSource = await parseMarkdownFileSource(absolutePath);
    if (parsedSource.kind === "list") {
      return {
        format,
        source: new ListSource(
          parsedSource.id,
          undefined,
          parsedSource.getContent(),
          relativePath,
        ),
      };
    }

    return {
      format,
      source: new DocumentSource(
        parsedSource.id,
        undefined,
        parsedSource.getContent(),
        relativePath,
      ),
    };
  }

  const parsedSource = await parseCsvFileSource(absolutePath);
  return {
    format,
    source: new ListSource(
      parsedSource.id,
      undefined,
      parsedSource.getContent(),
      relativePath,
    ),
  };
};

const rehydrateSource = async (
  rootDirectory: string,
  record: SourceManifestRecord,
): Promise<IndexedSourceBase> => {
  if (!record.path) {
    throw new Error(`Source is missing path: ${record.id}`);
  }

  const absolutePath = path.resolve(rootDirectory, record.path);
  const sourcePath = normalizeRelativePath(record.path);

  if (record.format === "text") {
    return await parseReferenceTextFileSource(absolutePath, {
      id: record.id,
      metadata: record.metadata,
      path: sourcePath,
    });
  }

  if (record.format === "markdown") {
    const parsedSource = await parseMarkdownFileSource(absolutePath);
    return parsedSource.kind === "list"
      ? new ListSource(
          record.id,
          record.metadata,
          parsedSource.getContent(),
          sourcePath,
        )
      : new DocumentSource(
          record.id,
          record.metadata,
          parsedSource.getContent(),
          sourcePath,
        );
  }

  const parsedSource = await parseCsvFileSource(absolutePath);
  return new ListSource(
    record.id,
    record.metadata,
    parsedSource.getContent(),
    sourcePath,
  );
};

const listDirectoryFiles = (directoryPath: string): string[] =>
  globSync("**/*", {
    absolute: true,
    cwd: directoryPath,
    dot: true,
    onlyFiles: true,
  }).map((entry) => path.resolve(entry));

const expandInput = (rootDirectory: string, input: string): string[] => {
  if (isGlobPattern(input)) {
    return globSync(input, {
      absolute: true,
      cwd: rootDirectory,
      dot: true,
      onlyFiles: false,
    }).map((entry) => path.resolve(entry));
  }

  const absolutePath = path.resolve(rootDirectory, input);
  if (!existsSync(absolutePath)) {
    throw new Error(`Input path does not exist: ${input}`);
  }

  if (statSync(absolutePath).isDirectory()) {
    return listDirectoryFiles(absolutePath);
  }

  return [absolutePath];
};

const isExcludedDiscoveredPath = (relativePath: string): boolean => {
  const normalized = normalizeRelativePath(relativePath);
  return (
    normalized.startsWith(".git/") ||
    normalized.startsWith("node_modules/") ||
    normalized.startsWith(".contextrie/")
  );
};

const discoverGitFiles = (rootDirectory: string): string[] => {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    {
      cwd: rootDirectory,
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    return [];
  }

  return result.stdout
    .split("\0")
    .filter(Boolean)
    .map((entry) => path.join(rootDirectory, entry));
};

const discoverAllFiles = (rootDirectory: string): string[] => {
  const gitFiles = discoverGitFiles(rootDirectory);
  if (gitFiles.length > 0) {
    return gitFiles;
  }

  return globSync("**/*", {
    absolute: true,
    cwd: rootDirectory,
    dot: true,
    onlyFiles: true,
  }).map((entry) => path.resolve(entry));
};

const resolveIndexTargets = (rootDirectory: string): string[] => {
  if (cli.input.length === 0) {
    if (!cli.flags.all) {
      throw new Error(
        "No index inputs provided. Pass file paths/globs or use --all.",
      );
    }

    return sortAndDedupe(
      discoverAllFiles(rootDirectory)
        .filter((absolutePath) => existsSync(absolutePath))
        .filter((absolutePath) => statSync(absolutePath).isFile())
        .filter((absolutePath) => {
          const relativePath = normalizeRelativePath(
            path.relative(rootDirectory, absolutePath),
          );
          return !isExcludedDiscoveredPath(relativePath);
        })
        .filter((absolutePath) => isSupportedSourcePath(absolutePath)),
    );
  }

  return sortAndDedupe(
    cli.input
      .flatMap((input) => expandInput(rootDirectory, input))
      .filter((absolutePath) => existsSync(absolutePath))
      .filter((absolutePath) => statSync(absolutePath).isFile())
      .filter((absolutePath) => isSupportedSourcePath(absolutePath)),
  );
};

const toManifestRecord = (
  source: IndexedSourceBase,
  format: SourceFormat,
): SourceManifestRecord => {
  if (!source.metadata) {
    throw new Error(`Indexed source is missing metadata: ${source.id}`);
  }

  return {
    id: source.id,
    kind: source.kind,
    format,
    path: source.path ? normalizeRelativePath(source.path) : undefined,
    metadata: source.metadata,
  };
};

const loadManifest = async (rootDirectory: string): Promise<SourceManifest> => {
  const manifestPath = getSourcesPath(rootDirectory);
  if (!existsSync(manifestPath)) {
    throw new Error(
      "Missing .contextrie/sources.json. Run `contextrie --index` first.",
    );
  }

  return await readJsonFile<SourceManifest>(manifestPath);
};

const buildReferenceSources = async (
  rootDirectory: string,
  records: SourceManifestRecord[],
): Promise<IndexedSourceBase[]> =>
  await Promise.all(records.map((record) => rehydrateSource(rootDirectory, record)));

const runIndex = async (rootDirectory: string): Promise<void> => {
  const config = await resolveConfig(rootDirectory);
  const targetFiles = resolveIndexTargets(rootDirectory);
  if (targetFiles.length === 0) {
    throw new Error("No supported source files found to index.");
  }

  const model = createModel(config);
  const parsedSources = await Promise.all(
    targetFiles.map(async (absolutePath) => {
      const relativePath = normalizeRelativePath(
        path.relative(rootDirectory, absolutePath),
      );

      return await parseSourceForIndex(absolutePath, relativePath);
    }),
  );
  const sources = parsedSources.map(({ source }) => source);
  const formatsById = new Map(
    parsedSources.map(({ format, source }) => [source.id, format]),
  );

  const indexedSources = await new IndexingAgent(model).add(sources).run();
  const manifest: SourceManifest = {
    version: 1,
    sources: indexedSources.map((source) => {
      const format = formatsById.get(source.id);
      if (!format) {
        throw new Error(`Missing source format: ${source.id}`);
      }

      return toManifestRecord(source, format);
    }),
  };

  await ensureContextrieDirectory(rootDirectory);
  await persistConfig(rootDirectory, config);
  await writeJsonFile(getSourcesPath(rootDirectory), manifest);
  console.log(`Indexed ${manifest.sources.length} source(s) into .contextrie/sources.json`);
};

const runTask = async (rootDirectory: string, task: string): Promise<void> => {
  const trimmedTask = task.trim();
  if (!trimmedTask) {
    throw new Error("Task text cannot be empty.");
  }

  const config = await resolveConfig(rootDirectory);
  const manifest = await loadManifest(rootDirectory);
  const sources = await buildReferenceSources(rootDirectory, manifest.sources);
  const model = createModel(config);
  const judgments = await new JudgeAgent(model).from(sources).run({
    objective: "response",
    input: trimmedTask,
  });

  const judgedRecord = Object.fromEntries(
    sources.map((source) => {
      const decision = judgments[source.id];
      if (!decision) {
        throw new Error(`Missing judgment for source ${source.id}`);
      }

      return [
        source.id,
        {
          source,
          decision,
        },
      ];
    }),
  );

  const context = await new ComposerAgent(model).from(judgedRecord).run({
    objective: "response",
    input: trimmedTask,
  });

  await ensureContextrieDirectory(rootDirectory);
  await persistConfig(rootDirectory, config);
  await writeFile(getContextPath(rootDirectory), `${context.trim()}\n`, "utf8");
  console.log("Wrote .contextrie/context.md");
};

export async function main(argv = process.argv.slice(2)): Promise<number> {
  void argv;

  const rootDirectory = process.cwd();
  const isIndexMode = cli.flags.index;
  const task = cli.flags.task;
  const isTaskMode = typeof task === "string";

  if (isIndexMode === isTaskMode) {
    console.error("Choose exactly one mode: --index or --task.");
    cli.showHelp(1);
  }

  try {
    if (isIndexMode) {
      await runIndex(rootDirectory);
      return 0;
    }

    if (!task) {
      throw new Error("Task text cannot be empty.");
    }

    await runTask(rootDirectory, task);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return 1;
  }
}

process.exitCode = await main(cli.input);
