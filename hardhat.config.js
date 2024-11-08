
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.27",
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
    },
  },
};