const ethers = require('ethers');
const {
  dynamoDb,
  fromWei,
  fromBytes32,
  formatUnits,
  avalancheHistoricalProvider,
  arbitrumHistoricalProvider,
  getWrappedContractsHistorical,
  getArweavePackages
} = require('../utils/helpers');
const constants = require('../config/constants.json');
const gmTokens = require('../config/gmTokens.json');
const FACTORY = require('../abis/SmartLoansFactory.json');
const EthDater = require("ethereum-block-by-date");
const redstone = require("redstone-api");

// const config = require("../../src/config");
// const key = fs.readFileSync("./.secret").toString().trim();

// const Web3 = require('web3');
// const fs = require("fs");
const blockTimestampStart = 1719494583;
const blockTimestampEnd = 1719571663;

const factoryAddress = constants.avalanche.factory;

const getBlockForTimestamp = async (timestamp) => {
  const dater = new EthDater(
    avalancheHistoricalProvider // ethers provider, required.
  );

  return await dater.getDate(
    timestamp, // Date, required. Any valid moment.js value: string, milliseconds, Date() object, moment() object.
    true // Block after, optional. Search for the nearest block before or after the given date. By default true.
  );
}

const findClosest = (numbers, target) => {

  let closest = numbers[0];
  // Assume the first number is the closest
  let closestDiff = Math.abs(target - closest.timestamp);

  // Calculate the difference between the target and closest
  for (let i = 1; i < numbers.length; i++) {
    let current = numbers[i];
    let currentDiff = Math.abs(target - current.timestamp);

    // Calculate the difference between the target and current number
    if (currentDiff < closestDiff) {
      closest = current;

      // Update the closest number
      closestDiff = currentDiff;

      // Update the closest difference
    }
  }
  return closest;
}

const gmxIncentivesCalculatorAvaRetroactive = async (event) => {
  //in seconds
  let timestampInSeconds = blockTimestampStart;

  // let prices = {};

  // for (let gmSymbol of Object.keys(gmTokens.avalanche)) {
  //   const resp = await redstone.getHistoricalPrice(gmSymbol, {
  //     startDate: (blockTimestampStart - 60 * 60 * 4) * 1000,
  //     interval: 60 * 60 * 1000,
  //     endDate: (blockTimestampEnd + 60 * 60 * 4) * 1000,
  //     provider: "redstone"
  //   });

  //   prices[gmSymbol] = resp;
  // }

  // console.log('Prices:');
  // console.log(prices);

  const blockNumbers = [
    226485129,
    226484685,
    226465436,
    226464775,
    226462046,
    226461638,
    226460792,
    226460411,
    226460175,
    226459589,
    226459178,
    226458920,
    226453081,
    226452344,
    226427392,
    226422898,
    226422707,
    226422584,
    226422380,
    226421178,
    226421022,
    226419932,
    226419343,
    226419164,
    226418443,
    226416359,
    226413682,
  ]

  for (const blockNumber of blockNumbers.reverse()) {
    const block = await arbitrumHistoricalProvider.getBlock(blockNumber);
    const timestamp = block.timestamp;

    let packages = await getArweavePackages(timestamp);

    const [wrappedContract] = await getWrappedContractsHistorical(["0xda17e8137562064E12cf2Ba79D28610AFE11D0ed"], 'arbitrum', packages);

    async function runMethod(contract, methodName, blockNumber) {
      const tx = await contract.populateTransaction[methodName]()
      let res = await contract.signer.call(tx, blockNumber)
      return contract.interface.decodeFunctionResult(
        methodName,
        res
      );
    }

    const totalValueBefore = fromWei(await runMethod(wrappedContract, 'getTotalValue', blockNumber - 1));
    const totalValueAfter = fromWei(await runMethod(wrappedContract, 'getTotalValue', blockNumber + 10));
    console.log(`Checking block: ${blockNumber}`);
    console.log(`before: ${totalValueBefore}, after: ${totalValueAfter}, diff: ${totalValueAfter - totalValueBefore}`);

    // console.log(`Updated timestamp: ${timestampInSeconds}, block number: ${blockNumber}, total value: ${totalValue}.`);

    // timestampInSeconds += 60 * 60;

    // const factoryContract = new ethers.Contract(factoryAddress, FACTORY.abi, avalancheHistoricalProvider);
    // let loanAddresses = await factoryContract.getAllLoans({ blockTag: blockNumber });
    // const totalLoans = loanAddresses.length;

    // let weeklyIncentives;
    // if (timestampInSeconds < 1710421200) {// 14.03 14:00 CET
    //   weeklyIncentives = 1666;
    // } else if (timestampInSeconds < 1710535200) {// 15.03 21:40 CET
    //   weeklyIncentives = 1000;
    // } else {
    //   weeklyIncentives = 225;
    // }
    // const incentivesPerInterval = weeklyIncentives / (60 * 60 * 24 * 7) * (60 * 60 * 4);
    // const batchSize = 200;

    // const loanQualifications = {};
    // let totalLeveragedGM = 0;
    // let gmTvl = 0;

    // // calculate gm leveraged by the loan
    // for (let i = 0; i < Math.ceil(totalLoans / batchSize); i++) {
    //   try {
    //     console.log(`processing ${i * batchSize} - ${(i + 1) * batchSize > totalLoans ? totalLoans : (i + 1) * batchSize} loans. ${timestampInSeconds}`);

    //     const batchLoanAddresses = loanAddresses.slice(i * batchSize, (i + 1) * batchSize);

    //     const wrappedContracts = await getWrappedContractsHistorical(batchLoanAddresses, 'avalanche', packages)

    //     async function runMethod(contract, methodName, blockNumber) {
    //       const tx = await contract.populateTransaction[methodName]()
    //       let res = await contract.signer.call(tx, blockNumber)
    //       return contract.interface.decodeFunctionResult(
    //         methodName,
    //         res
    //       )[0];
    //     }

    //     const loanStats = await Promise.all(
    //       wrappedContracts.map(contract => Promise.all([
    //         runMethod(contract, 'getFullLoanStatus', blockNumber),
    //         runMethod(contract, 'getAllAssetsBalances', blockNumber)
    //       ])));


    //     if (loanStats.length > 0) {
    //       await Promise.all(
    //         loanStats.map(async (loan, batchId) => {
    //           const loanId = batchLoanAddresses[batchId].toLowerCase();
    //           const status = loan[0];
    //           const assetBalances = loan[1];
    //           const collateral = fromWei(status[0]) - fromWei(status[1]);

    //           loanQualifications[loanId] = {
    //             collateral,
    //             gmTokens: {},
    //             loanLeveragedGM: 0
    //           };

    //           let loanTotalGMValue = 0;

    //           await Promise.all(
    //             Object.entries(gmTokens.avalanche).map(async ([symbol, token]) => {
    //               const price = findClosest(prices[symbol], timestampInSeconds * 1000);
    //               console.log(price);

    //               const asset = assetBalances.find(asset => fromBytes32(asset.name) == symbol);
    //               const balance = formatUnits(asset.balance.toString(), token.decimals);

    //               loanQualifications[loanId].gmTokens[symbol] = balance * price.value;
    //               loanTotalGMValue += balance * price.value;
    //             })
    //           );

    //           const loanLeveragedGM = loanTotalGMValue - collateral > 0 ? loanTotalGMValue - collateral : 0;
    //           loanQualifications[loanId].loanLeveragedGM = loanLeveragedGM;
    //           totalLeveragedGM += loanLeveragedGM;
    //           gmTvl += loanTotalGMValue;
    //         })
    //       );
    //     }
    //   } catch (error) {
    //     console.log(`loan calculation failed. Error: ${error}`);
    //   }
    // }

    // console.log(`${Object.entries(loanQualifications).length} loans analyzed.`);

    // // incentives of all loans
    // const loanIncentives = {};

    // Object.entries(loanQualifications).map(([loanId, loanData]) => {
    //   loanIncentives[loanId] = 0;

    //   if (loanData.loanLeveragedGM > 0) {
    //     const intervalIncentivesForLoan = incentivesPerInterval * loanData.loanLeveragedGM / totalLeveragedGM;

    //     loanIncentives[loanId] = intervalIncentivesForLoan;
    //   }
    // })

    // // save/update incentives values to DB
    // await Promise.all(
    //   Object.entries(loanIncentives).map(async ([loanId, value]) => {
    //     const data = {
    //       id: loanId,
    //       timestamp: timestampInSeconds,
    //       avaxCollected: value
    //     };

    //     const params = {
    //       TableName: 'gmx-incentives-ava-retroactive-prod',
    //       Item: data
    //     };
    //     await dynamoDb.put(params).promise();
    //   })
    // );

    // console.log(`GMX incentives updated for timestamp ${timestampInSeconds}.`)

    // console.log(`Updated timestamp: ${timestampInSeconds}, block number: ${blockNumber}.`);

    // timestampInSeconds += 60 * 60 * 4;
  }

  // console.log(Object.values(prices)[0][Object.values(prices)[0].length - 1])

  // return event;
}

module.exports.handler = gmxIncentivesCalculatorAvaRetroactive;

gmxIncentivesCalculatorAvaRetroactive();