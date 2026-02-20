import { describe, test, expect } from "bun:test";

const run = (...args: string[]) =>
  Bun.spawn(["bun", "cli/index.ts", ...args], {
    cwd: import.meta.dir + "/..",
    stdout: "pipe",
    stderr: "pipe",
  });

const collect = async (proc: ReturnType<typeof run>) => {
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;
  return { stdout, stderr, exitCode };
};

describe("CLI", () => {
  describe("help", () => {
    test("prints help with no arguments", async () => {
      const { stdout, exitCode } = await collect(run());
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Usage:");
      expect(stdout).toContain("contextrie ingest");
    });

    test("prints help with --help", async () => {
      const { stdout, exitCode } = await collect(run("--help"));
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Usage:");
    });

    test("prints help with -h", async () => {
      const { stdout, exitCode } = await collect(run("-h"));
      expect(exitCode).toBe(0);
      expect(stdout).toContain("Usage:");
    });
  });

  describe("version", () => {
    test("prints version with --version", async () => {
      const { stdout, exitCode } = await collect(run("--version"));
      expect(exitCode).toBe(0);
      expect(stdout).toMatch(/contextrie v\d+\.\d+\.\d+/);
    });

    test("prints version with -v", async () => {
      const { stdout, exitCode } = await collect(run("-v"));
      expect(exitCode).toBe(0);
      expect(stdout).toMatch(/contextrie v\d+\.\d+\.\d+/);
    });

    test("prints version with version command", async () => {
      const { stdout, exitCode } = await collect(run("version"));
      expect(exitCode).toBe(0);
      expect(stdout).toMatch(/contextrie v\d+\.\d+\.\d+/);
    });
  });

  describe("unknown command", () => {
    test("exits with error for unknown command", async () => {
      const { stderr, exitCode } = await collect(run("bogus"));
      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("Unknown command: bogus");
    });
  });

  describe("ingest", () => {
    test("exits with error when no files provided", async () => {
      const { stderr, exitCode } = await collect(run("ingest"));
      expect(exitCode).not.toBe(0);
      expect(stderr).toContain("No files provided");
    });
  });
});
