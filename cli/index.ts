#!/usr/bin/env bun

import * as core from "@contextrie/core";
import * as parsers from "@contextrie/parsers";

const CLI_VERSION = "0.1.0";

function printHelp() {
  console.log(`contextrie ${CLI_VERSION}

Usage:
  contextrie --help
  contextrie --version

Status:
  Default entry point only. Command surface is not implemented yet.

Loaded packages:
  @contextrie/core (${Object.keys(core).length} exports)
  @contextrie/parsers (${Object.keys(parsers).length} exports)`);
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const [command] = argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return 0;
  }

  if (command === "--version" || command === "-v") {
    console.log(CLI_VERSION);
    return 0;
  }

  console.error(`Unknown command: ${command}`);
  console.error("Run `contextrie --help` for the current entry point.");
  return 1;
}

process.exitCode = await main();
