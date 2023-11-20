#!/usr/bin/env node

const fs = require("fs");
const readline = require("readline");
const { Command } = require("commander");

const processCSV = (filePath) => {
  const debts = {};

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      const [payer, payee, amount] = line.split(",");
      const key = `${payer},${payee}`;
      const existingAmount = debts[key] || 0;
      debts[key] = existingAmount + parseFloat(amount);
    });

    rl.on("close", () => {
      resolve(debts);
    });

    rl.on("error", (err) => {
      if (err.code === "ENOENT") {
        console.error(`File not found: ${filePath}`);
        resolve(debts); // Resolving with an empty object
      } else {
        reject(err);
      }
    });
  });
};

const writeOutput = (outputFilePath, debts) => {
  const outputStream = fs.createWriteStream(outputFilePath);

  for (const key in debts) {
    outputStream.write(`${key},${debts[key].toFixed(2)}\n`);
  }

  outputStream.end();
  console.log(`Output written to ${outputFilePath}`);
};

const processAndWriteCSV = async (csvFilePath, outputFileName) => {
  const outputFilePath = outputFileName || program.output || "output.csv";
  const debts = await processCSV(csvFilePath);
  writeOutput(outputFilePath, debts);
};

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

program.parse(process.argv);

module.exports = { processCSV, writeOutput, processAndWriteCSV };
