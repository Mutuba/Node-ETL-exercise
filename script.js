#!/usr/bin/env node

const fs = require("fs");
const readline = require("readline");
const { Transform, pipeline } = require("stream");
const { Command } = require("commander");

const program = new Command();

const processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      const errorMessage = `File not found: ${filePath}`;
      console.error(errorMessage);
      reject(new Error(errorMessage));
      return;
    }

    const debts = {};

    const transformStream = new Transform({
      objectMode: true,
      transform(line, encoding, callback) {
        const [payer, payee, amount] = line.split(",");
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

    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      //  Configure the readline interface to interpret carriage return characters (\r)
      // as newline characters, regardless of whether they are followed by a line feed character (\n)
      crlfDelay: Infinity,
    });

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

const writeOutput = (outputFilePath, debts) => {
  return new Promise((resolve, reject) => {
    const outputStream = fs.createWriteStream(outputFilePath);

    outputStream.on("finish", () => {
      console.log(`Output written to ${outputFilePath}`);
      resolve();
    });

    outputStream.on("error", (error) => {
      console.error(`Error writing to output file: ${error.message}`);
      reject(error);
    });

    for (const key in debts) {
      outputStream.write(`${key},${debts[key].toFixed(2)}\n`);
    }

    outputStream.end();
  });
};

const processAndWriteCSV = async (csvFilePath, outputFileName) => {
  try {
    const outputFilePath = outputFileName || program.output || "output.csv";
    const debts = await processCSV(csvFilePath);
    await writeOutput(outputFilePath, debts);
  } catch (error) {
    console.error(`An unexpected error occurred: ${error.message}`);
  }
};

const runScript = (args) => {
  const program = new Command();

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

  program.parse(args);
};

if (require.main === module) {
  runScript(process.argv);
}

module.exports = { processCSV, writeOutput, processAndWriteCSV, runScript };
