import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["node_modules/", "dist/", "*.config.js", "bun.lockb"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended
);
