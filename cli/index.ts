#!/usr/bin/env node

import { Contextrie } from "../client";

const args = process.argv.slice(2);

const run = async (): Promise<void> => {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const command = args[0];
  if (command === "version" || command === "--version" || command === "-v") {
    console.log("contextrie v0.1.0");
    return;
  }

  if (command === "ingest") {
    const files = args.slice(1).filter((arg) => !arg.startsWith("-"));
    if (files.length === 0) {
      console.error("No files provided for ingest.");
      printHelp();
      process.exit(1);
    }

    const ctx = new Contextrie();
    const ingester = ctx.ingest;
    for (const file of files) {
      ingester.file(file);
    }
    const sources = await ingester.run();
    console.log(`Ingested ${sources.length} sources.`);
    return;
  }

  console.error(`Unknown command: ${command ?? ""}`);
  printHelp();
  process.exit(1);
};

const printHelp = (): void => {
  console.log(`Contextrie CLI

Deprecation notice: this CLI interface will change during the issue #39 refactor.

Usage:
  contextrie ingest <file...>
  contextrie --help
  contextrie --version, -v
`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
