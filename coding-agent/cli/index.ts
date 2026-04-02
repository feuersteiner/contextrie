#!/usr/bin/env node

import { Command } from "commander";

const program = new Command();

program.name("contextrie-harness");
program.action(() => {
  console.log("Hello world from Contextrie");
});

program.parse();
