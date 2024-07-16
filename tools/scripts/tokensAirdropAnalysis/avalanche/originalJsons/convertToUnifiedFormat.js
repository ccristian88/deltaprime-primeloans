const fs = require('fs');
const path = require('path');

// Function to read JSON from a file
function readJSONFromFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            try {
                const jsonData = JSON.parse(data);
                resolve(jsonData);
            } catch (parseErr) {
                reject(parseErr);
            }
        });
    });
}

// Function to write JSON to a file
function writeJSONToFile(filePath, data) {
    return new Promise((resolve, reject) => {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFile(filePath, jsonData, 'utf8', (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

// Function to remove "isExcluded" field and restructure the data
function removeIsExcludedAndRestructure(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        const { isExcluded, ...rest } = value;
        result[key] = rest;
    }
    return result;
}

// Function to rename "sPrimeSum" key to "amount" and restructure the data
function renameAndRestructure(data) {
    const result = {};
    for (const value of Object.values(data)) {
        const { sPrimeSum, address, ...rest } = value;
        result[address] = { ...rest, amount: sPrimeSum };
    }
    return result;
}

// Function to calculate the dollar value from primeAmount and avaxAmount
function calculateDollarValue(data) {
    const result = {};
    for (const item of data) {
        const { address, primeAmount, avaxAmount } = item;
        const dollarValue = (primeAmount * PRIME_PRICE) + (avaxAmount * WAVAX_PRICE);
        result[address] = { amount: dollarValue };
    }
    return result;
}


// Main function to read, modify, and write JSON data
async function processLoyaltyJson(inputFilePath, outputFilePath) {
    try {
        const data = await readJSONFromFile(inputFilePath);
        const modifiedData = removeIsExcludedAndRestructure(data);
        await writeJSONToFile(outputFilePath, modifiedData);
        console.log('File has been saved successfully.');
    } catch (error) {
        console.error('Error processing JSON file:', error);
    }
}

// Main function to read, modify, and write JSON data for renaming "sPrimeSum"
async function processSPrimeJson(inputFilePath, outputFilePath) {
    try {
        const data = await readJSONFromFile(inputFilePath);
        const modifiedData = renameAndRestructure(data);
        await writeJSONToFile(outputFilePath, modifiedData);
        console.log('File has been saved successfully.');
    } catch (error) {
        console.error('Error processing JSON file:', error);
    }
}

// Main function to read, calculate, and write JSON data for the third type
async function processPartnerGuesserJSON(inputFilePath, outputFilePath) {
    try {
        const data = await readJSONFromFile(inputFilePath);
        const modifiedData = calculateDollarValue(data);
        await writeJSONToFile(outputFilePath, modifiedData);
        console.log('File has been saved successfully.');
    } catch (error) {
        console.error('Error processing JSON file:', error);
    }
}

// Define input and output file paths
const inputFilePathLoyalty = path.join(__dirname, 'sPrimeLoyaltyAvalanche.json');
const inputFilePathSPrime = path.join(__dirname, 'sPrimeSumResultAva.json');
const inputFilePathPartnerGuesser = path.join(__dirname, 'sPrimeSumResultAva16Spreadsheet.json');
const outputDir = path.join(__dirname, 'unifiedFormat');
const outputFilePathLoyalty = path.join(outputDir, 'loyaltyUnified.json');
const outputFilePathSPrime = path.join(outputDir, 'sPrimeUnified.json');
const outputFilePathPartnerGuesser = path.join(outputDir, 'sPrimePartnerGuesserUnified.json');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const PRIME_PRICE = 1.3125;
const WAVAX_PRICE = 27;

processLoyaltyJson(inputFilePathLoyalty, outputFilePathLoyalty);
processSPrimeJson(inputFilePathSPrime, outputFilePathSPrime);
processPartnerGuesserJSON(inputFilePathPartnerGuesser, outputFilePathPartnerGuesser);
