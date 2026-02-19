import { describe, test, expect } from "bun:test";
import { parseText, parseMarkdown, parseJSON, parseCSV } from "./parsers";

describe("parseText", () => {
  test("trims whitespace", () => {
    const input = "  hello world  ";
    const result = parseText(input);
    expect(result).toBe("hello world");
  });

  test("converts CRLF to LF", () => {
    const input = "line1\r\nline2\r\nline3";
    const result = parseText(input);
    expect(result).toBe("line1\nline2\nline3");
  });

  test("handles empty string", () => {
    const result = parseText("");
    expect(result).toBe("");
  });

  test("handles multiline with mixed line endings", () => {
    const input = "  line1\r\nline2\nline3  ";
    const result = parseText(input);
    expect(result).toBe("line1\nline2\nline3");
  });
});

describe("parseMarkdown", () => {
  test("behaves same as parseText", () => {
    const input = "  # Header\r\n\r\nContent  ";
    const result = parseMarkdown(input);
    expect(result).toBe("# Header\n\nContent");
  });

  test("preserves markdown formatting", () => {
    const input = "# Title\n\n- Item 1\n- Item 2";
    const result = parseMarkdown(input);
    expect(result).toBe("# Title\n\n- Item 1\n- Item 2");
  });
});

describe("parseJSON", () => {
  test("parses array of objects", () => {
    const input = '[{"name":"Alice","age":30},{"name":"Bob","age":25}]';
    const result = parseJSON(input);
    expect(result).toEqual([
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ]);
  });

  test("wraps single object in array", () => {
    const input = '{"name":"Alice","age":30}';
    const result = parseJSON(input);
    expect(result).toEqual([{ name: "Alice", age: 30 }]);
  });

  test("wraps primitives in array of objects", () => {
    const input = '[1, 2, 3]';
    const result = parseJSON(input);
    expect(result).toEqual([
      { value: 1, _index: 0 },
      { value: 2, _index: 1 },
      { value: 3, _index: 2 },
    ]);
  });

  test("wraps single primitive", () => {
    const input = '42';
    const result = parseJSON(input);
    expect(result).toEqual([{ value: 42 }]);
  });

  test("wraps single string primitive", () => {
    const input = '"hello"';
    const result = parseJSON(input);
    expect(result).toEqual([{ value: "hello" }]);
  });

  test("handles mixed array with objects and primitives", () => {
    const input = '[{"name":"Alice"}, "Bob", 42]';
    const result = parseJSON(input);
    expect(result).toEqual([
      { name: "Alice" },
      { value: "Bob", _index: 1 },
      { value: 42, _index: 2 },
    ]);
  });

  test("handles nested objects", () => {
    const input = '{"user":{"name":"Alice","meta":{"age":30}}}';
    const result = parseJSON(input);
    expect(result).toEqual([{ user: { name: "Alice", meta: { age: 30 } } }]);
  });

  test("handles empty array", () => {
    const input = '[]';
    const result = parseJSON(input);
    expect(result).toEqual([]);
  });

  test("handles null value", () => {
    const input = 'null';
    const result = parseJSON(input);
    expect(result).toEqual([{ value: null }]);
  });
});

describe("parseCSV", () => {
  test("parses simple CSV", () => {
    const input = "name,age\nAlice,30\nBob,25";
    const result = parseCSV(input);
    expect(result).toEqual(["name: Alice, age: 30", "name: Bob, age: 25"]);
  });

  test("handles quoted values", () => {
    const input = 'name,description\nAlice,"Hello, World"\nBob,"Test"';
    const result = parseCSV(input);
    expect(result).toEqual([
      'name: Alice, description: Hello, World',
      'name: Bob, description: Test',
    ]);
  });

  test("handles empty values", () => {
    const input = "name,age,city\nAlice,30,\nBob,,NYC";
    const result = parseCSV(input);
    expect(result).toEqual([
      "name: Alice, age: 30, city: ",
      "name: Bob, age: , city: NYC",
    ]);
  });

  test("handles single row (header only)", () => {
    const input = "name,age";
    const result = parseCSV(input);
    expect(result).toEqual([]);
  });

  test("handles empty string", () => {
    const input = "";
    const result = parseCSV(input);
    expect(result).toEqual([]);
  });

  test("handles commas inside quotes", () => {
    const input = 'name,address\nAlice,"123 Main St, Apt 4"\nBob,"456 Elm St"';
    const result = parseCSV(input);
    expect(result).toEqual([
      "name: Alice, address: 123 Main St, Apt 4",
      "name: Bob, address: 456 Elm St",
    ]);
  });

  test("handles whitespace in values", () => {
    const input = "name,age\n  Alice  ,  30  \n  Bob  ,  25  ";
    const result = parseCSV(input);
    expect(result).toEqual([
      "name: Alice, age: 30",
      "name: Bob, age: 25",
    ]);
  });

  test("handles more columns than headers", () => {
    const input = "name,age\nAlice,30,Extra\nBob,25";
    const result = parseCSV(input);
    expect(result).toEqual([
      "name: Alice, age: 30",
      "name: Bob, age: 25",
    ]);
  });

  test("handles fewer columns than headers", () => {
    const input = "name,age,city\nAlice,30\nBob,25,NYC";
    const result = parseCSV(input);
    expect(result).toEqual([
      "name: Alice, age: 30, city: ",
      "name: Bob, age: 25, city: NYC",
    ]);
  });
});
