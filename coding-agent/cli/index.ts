#!/usr/bin/env node

import { Command } from "commander";
import { initHarness } from "../services/init.ts";

const program = new Command();

program.name("contextrie-harness");
program.action(() => {
  console.log("Hello world from Contextrie");
});

program
  .command("init")
  .description(
    "Initialize the harness structure in the current repository directory",
  )
  .action(async () => {
    const result = await initHarness(process.cwd());
    result.created.map((entry) => console.log(`[init] created ${entry}`));
    result.existing.map((entry) => console.log(`[init] exists ${entry}`));
  });

await program.parseAsync();
