import Binance from "node-binance-api";
import input from "input";
import chalk from "chalk";

let binance = null;
let APIKEY = null;
let APISECRET = null;
let isTest = true;
let isConnected = false;

export const getBinance = () => {
  return { binance, isConnected, isTest };
};

export const binanceConnect = async () => {
  APIKEY = await input.text("Please enter your Binance API KEY: ");
  APISECRET = await input.text("Please enter your Binance API SECRET: ");
  isTest = await input.confirm("Use test enviromen?: ");

  const localBinance = new Binance().options({
    APIKEY: APIKEY,
    APISECRET: APISECRET,
    test: isTest,
  });

  try {
    const result = await localBinance.futuresBalance();
    if (result["msg"]) {
      console.log(chalk.red("Binance: Invalid Credentials"));
      binance = null;
      isConnected = false;
      isTest = null;
    } else {
      binance = localBinance;
      isConnected = true;
    }
  } catch (err) {
    console.log(err);
  }
};
