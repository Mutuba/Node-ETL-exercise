#!/usr/bin/env node

const fs = require("fs");
const readline = require("readline");
const { Transform, pipeline } = require("stream");
const { Command } = require("commander");

// Create a Commander program instance
const program = new Command();

/**
 * Process a CSV file to calculate debts. Extract and Transform part of ETL pipeline
 *
 * @param {string} filePath - The path to the CSV file.
 * @returns {Promise<Object>} A promise that resolves to an object representing debts.
 * @throws {Error} If the file is not found or there's an error processing the file.
 */
const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      const errorMessage = `File not found: ${filePath}`;
      console.error(errorMessage);
      reject(new Error(errorMessage));
      return;
    }

    // Object to store debts
    const debts = {};

    // Create a Transform stream to process CSV lines
    // Transform part of ETL pipeline
    const transformStream = new Transform({
      objectMode: true,
      transform(line, encoding, callback) {
        const [payer, payee, amount] = line.split(",");
        // Check if the line contains valid data
        if (payer && payee && amount) {
          const key = `${payer},${payee}`;
          const existingAmount = debts[key] || 0;
          debts[key] = existingAmount + parseFloat(amount);
        } else {
          console.error(`Invalid line: ${line}`);
        }
        callback();
      },
    });

    // Create a Readline interface to read the CSV file line by line
    // Extract part of ETL pipeline
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      // Configure the readline interface to interpret carriage return characters (\r)
      // as newline characters, regardless of whether they are followed by a line feed character (\n)
      crlfDelay: Infinity,
    });

    // Connect the Readline and Transform streams using pipeline
    // This is a min demonstration of ETL pipeline in Node.js
    // Invoking Transform part of ETL pipeline
    pipeline(rl, transformStream, (error) => {
      if (error) {
        console.error(`Error processing file: ${error.message}`);
        reject(error);
      } else {
        resolve(debts);
      }
    });
  });
};

/**
 * Write debts to an output file. Load part of ETL pipeline
 *
 * @param {string} outputFilePath - The path to the output file.
 * @param {Object} debts - Object representing debts.
 * @returns {Promise<void>} A promise that resolves when writing is complete.
 * @throws {Error} If there's an error writing to the output file.
 */
const writeOutput = (outputFilePath, debts) => {
  return new Promise((resolve, reject) => {
    // Create a WriteStream to the output file
    const outputStream = fs.createWriteStream(outputFilePath);

    // Set up event listeners for the WriteStream
    outputStream.on("finish", () => {
      console.log(`Output written to ${outputFilePath}`);
      resolve();
    });

    outputStream.on("error", (error) => {
      console.error(`Error writing to output file: ${error.message}`);
      reject(error);
    });

    // Write debts to the output file
    for (const key in debts) {
      outputStream.write(`${key},${debts[key].toFixed(2)}\n`);
    }

    // End the WriteStream
    outputStream.end();
  });
};

/**
 * Process a CSV file and write debts to an output file.
 *
 * @param {string} csvFilePath - The path to the CSV file.
 * @param {string} [outputFileName] - The name of the output file.
 * @returns {Promise<void>} A promise that resolves when processing and writing are complete.
 * @throws {Error} If there's an unexpected error during processing.
 */
const processAndWriteCSV = async (csvFilePath, outputFileName) => {
  try {
    // Determine the output file path
    const outputFilePath = outputFileName || program.output || "output.csv";

    // Process the CSV file to calculate debts
    const debts = await processCSV(csvFilePath);

    // Write debts to the output file
    await writeOutput(outputFilePath, debts);
  } catch (error) {
    // Handle unexpected errors
    console.error(`An unexpected error occurred: ${error.message}`);
  }
};

/**
 * Run the CSV processing script.
 *
 * @param {string[]} args - Command-line arguments.
 */
const runScript = (args) => {
  // Create a new Commander program
  const program = new Command();

  // Define command-line options and arguments
  program
    .arguments("<csvFilePath> [outputFileName]")
    .description("Process a CSV file to calculate debts.")
    .action((csvFilePath, outputFileName) => {
      processAndWriteCSV(csvFilePath, outputFileName);
    })
    .option("-o, --output <file>", "Output file")
    .on("--help", () => {
      console.log("");
      console.log("Examples:");
      console.log("  $ node index.js path/to/your/file.csv");
      console.log("  $ node index.js path/to/your/file.csv customOutput.csv");
    });

  // Parse command-line arguments
  program.parse(args);
};

// Run the script if it is the main module
if (require.main === module) {
  runScript(process.argv);
}

// Export functions for testing or use in other modules
module.exports = { processCSV, writeOutput, processAndWriteCSV, runScript };
