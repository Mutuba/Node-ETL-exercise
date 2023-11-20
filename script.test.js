const fs = require("fs");
const { expect } = require("chai");
const { processCSV, writeOutput, processAndWriteCSV } = require("./script.js");

describe("CSV Processing", () => {
  it("should correctly process the CSV file", async () => {
    const inputFilePath = "test-file.csv";
    const expectedOutputFilePath = "test-output.csv";

    // Run the CSV processing function
    const debts = await processCSV(inputFilePath);

    // Compare actual and expected output
    const expectedOutput = fs
      .readFileSync(expectedOutputFilePath, "utf8")
      .trim();
    const actualOutput = Object.entries(debts)
      .map(([key, value]) => `${key},${value.toFixed(2)}`)
      .join("\n")
      .trim();
    expect(actualOutput).to.equal(expectedOutput);
  });

  it("should correctly write output to a file", async () => {
    const debts = {
      "Alice,Bob": 50.0,
      "Bob,Alice": 30.0,
    };
    const outputFilePath = "test-special-output.csv";

    // Write the output to a file
    writeOutput(outputFilePath, debts);

    // Read the actual and expected output files
    const actualOutput = fs.readFileSync(outputFilePath, "utf8").trim();
    const expectedOutput = Object.entries(debts)
      .map(([key, value]) => `${key},${value.toFixed(2)}`)
      .join("\n")
      .trim();

    // Compare actual and expected output
    expect(actualOutput).to.equal(expectedOutput);

    // Clean up test file
    fs.unlinkSync(outputFilePath);
  });

  it("should correctly process and write to output file", async () => {
    const inputFilePath = "test-file.csv";
    const expectedOutputFilePath = "test-output.csv";
    const customOutputFilePath = "customOutput.csv";

    // Run the combined CSV processing and writing function
    await processAndWriteCSV(inputFilePath, customOutputFilePath);

    // Read the actual and expected output files
    const actualOutput = fs.readFileSync(customOutputFilePath, "utf8").trim();
    const expectedOutput = fs
      .readFileSync(expectedOutputFilePath, "utf8")
      .trim();

    // Compare actual and expected output
    expect(actualOutput).to.equal(expectedOutput);

    // Clean up test files
    fs.unlinkSync(customOutputFilePath);
  });

  it("should handle non-existent input file", async () => {
    const nonExistentFilePath = "non-existent-file.csv";

    // Run the CSV processing function
    const debts = await processCSV(nonExistentFilePath);

    // Check that the result is an empty object (handles non-existent file gracefully)
    expect(debts).to.deep.equal({});
  });

  it("should handle non-existent input file", async () => {
    const nonExistentFilePath = "non-existent-file.csv";

    // Run the CSV processing function
    await processAndWriteCSV(nonExistentFilePath, "output.csv");

    // Check that the function doesn't throw an error (handles non-existent file gracefully)
    expect(true).to.equal(true);
  });

  it("should handle empty input file", async () => {
    const emptyFilePath = "empty-file.csv";
    fs.writeFileSync(emptyFilePath, "", "utf8");

    // Run the CSV processing function
    const debts = await processCSV(emptyFilePath);

    // Check that the result is an empty object (handles empty file gracefully)
    expect(debts).to.deep.equal({});

    // Clean up test file
    fs.unlinkSync(emptyFilePath);
  });

  it("should handle missing output file", async () => {
    const inputFilePath = "test-input.csv";

    // Run the CSV processing and writing function without specifying the output file
    await processAndWriteCSV(inputFilePath);

    // Check that the function doesn't throw an error (handles missing output file gracefully)
    expect(true).to.equal(true);
  });
});
