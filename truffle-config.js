const path = require('path');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    }
  },

  mocha: {
    // timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.19",
    }
  },

  // Set the output directory directly to your React app's contracts directory
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
};