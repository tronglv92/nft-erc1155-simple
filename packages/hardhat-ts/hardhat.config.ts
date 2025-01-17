// This adds support for typescript paths mappings
import 'tsconfig-paths/register';

import './helpers/hardhat-imports';

import path from 'path';

import { config as envConfig } from 'dotenv';
import glob from 'glob';
import { removeConsoleLog } from 'hardhat-preprocessor';
import { HardhatUserConfig } from 'hardhat/config';
import { hardhatNamedAccounts } from 'scaffold-common/src/constants';
import { getNetworks } from 'scaffold-common/src/functions';

import { getMnemonic } from './tasks/functions/mnemonic';

// this loads the .env file into process.env
envConfig({ path: '../vite-app-ts/.env' });

/**
 * this loads all the tasks from the tasks folder
 */

if (process.env.BUILDING !== 'true') {
  console.log('vao trong nay: ');
  glob.sync('./tasks/**/*.ts').forEach((file: string) => {
    require(path.resolve(file));
  });
}

/**
 * Set your target network!!!
 */
console.log('HARDHAT_TARGET_NETWORK: ', process.env.HARDHAT_TARGET_NETWORK);

/**
 * loads network list and config from scaffold-common
 */
const networks = {
  ...getNetworks({
    accounts: {
      mnemonic: getMnemonic(),
    },
  }),
  localhost: {
    url: 'http://localhost:8545',
    /*
      if there is no mnemonic, it will just use account 0 of the hardhat node to deploy
      (you can put in a mnemonic here to set the deployer locally)
    */
    // accounts: {
    //   mnemonic: getMnemonic(),
    // },
  },
};

/**
 * See {@link hardhatNamedAccounts} to define named accounts
 */
const namedAccounts = hardhatNamedAccounts as {
  [name: string]: string | number | { [network: string]: null | number | string };
};

export const config: HardhatUserConfig = {
  preprocess: {
    eachLine: removeConsoleLog((hre) => hre.network.name !== 'hardhat' && hre.network.name !== 'localhost'),
  },
  defaultNetwork: process.env.HARDHAT_TARGET_NETWORK,
  namedAccounts: namedAccounts,
  networks: networks,
  solidity: {
    compilers: [
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: true,
            runs: 500,
          },
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
        },
      },
    ],
  },
  mocha: {
    bail: false,
    allowUncaught: false,
    require: ['ts-node/register'],
    timeout: 30000,
    slow: 9900,
    reporter: process.env.GITHUB_ACTIONS === 'true' ? 'mocha-junit-reporter' : 'spec',
    reporterOptions: {
      mochaFile: 'testresult.xml',
      toConsole: true,
    },
  },
  watcher: {
    'auto-compile': {
      tasks: ['compile'],
      files: ['./contracts'],
      verbose: false,
    },
  },
  gasReporter: {
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  dodoc: {
    runOnCompile: false,
    debugMode: false,
    keepFileStructure: true,
    freshOutput: true,
    outputDir: './generated/docs',
    include: ['contracts'],
  },
  paths: {
    cache: './generated/cache',
    artifacts: './generated/artifacts',
    deployments: './generated/deployments',
  },
  typechain: {
    outDir: './generated/contract-types',
  },
};
export default config;
