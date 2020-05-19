const path = require('path');
require("dotenv").config({path: "./.env"});
const hdWalletProvider = require('@truffle/hdwallet-provider');
const accountIndex = 0;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "Server/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    ganache_local:{
      provider: function(){
        return new hdWalletProvider(process.env.Mnemonic,"HTTP://127.0.0.1:7545",0)
      },
      network_id: 5777
    },
    rinkeby_infura:{
      provider: function(){
        return new hdWalletProvider(process.env.Mnemonic,"https://rinkeby.infura.io/v3/d29e6e8389ba4119ac071627843b1521",0)
      },
      network_id: 4
    }

  },
  compilers: {
    solc: {
      version: "0.6.0"
    }
  }
};
