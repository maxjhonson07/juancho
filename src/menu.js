import input from "input";
import { getTelegram, connect } from "./telegramClient";
import { getTraderStatuses, init as initTrader } from "./trader";
import chalk from "chalk";
import { binanceConnect, getBinance } from "./Binance";
import {
  addLaverage,
  addTradeQuantityInUsd,
  deleteChatIdFromWatchList,
  getLaverage,
  getTradeQuantityInUsd,
  printChatIdFromWatchList,
  setChatIdToWatchList,
} from "./keys";

const menu = async () => {
  let running = true;
  while (running) {
    console.log("********************************************************");
    console.log(chalk.green(await getStatuses()));
    console.log("********************************************************");

    console.log("Menu");
    console.log("1: Connect to Telegram");
    console.log("2: Connect to Binance");
    console.log("3: Add trade quantity in usd");
    console.log("4: Leverage");
    console.log("5: Margin type");
    console.log("6: Add new group to the watch list");
    console.log("7: Print watch list");
    console.log("8: Remove group from the watch list");
    console.log("9: Start Trading");
    console.log("10: Stop Trading");

    console.log("********************************************************");

    const answer = await input.text("Type an option number:");

    if (answer === "1") {
      // const {} =
      await connect();
    }

    if (answer === "2") {
      await binanceConnect();
    }

    if (answer === "3") {
      await addTradeQuantityInUsd();
    }

    if (answer === "4") {
      await addLaverage();
    }

    if (answer === "6") {
      await setChatIdToWatchList();
    }

    if (answer === "7") {
      await printChatIdFromWatchList();
    }

    if (answer === "8") {
      await deleteChatIdFromWatchList();
    }

    if (answer === "9") {
      await initTrader();
    }

    if (answer === "10") {
      running = false;
      console.clear();
      process.exit();
    }

    await input.text("Press enter to continue....");
  }
};

const getStatuses = async () => {
  const { isConnected: isConnectTelegram } = getTelegram();
  const { isConnected: isConnectBinance, isTest } = getBinance();
  const tradeQuantityInUSD = await getTradeQuantityInUsd();
  const laverage = await getLaverage();
  const tradingStatus = getTraderStatuses();

  return `Statuses: Telegram:  ${isConnectTelegram ? "✅ Connected" : "❌ Disconnected"} | Binance:  ${
    isConnectBinance ? "✅ Connected" : "❌ Disconnected"
  } | Binance Enviroment: ${
    isTest ? "Test" : "Live"
  } | Trade quantity in usd: ${tradeQuantityInUSD} | Laverage: ${laverage}
    | Automatic Trading:  ${tradingStatus.isRunning ? "✅ Connected" : "❌ Disconnected"}
  `;
};

export default menu;
