import { NewMessage, NewMessageEvent } from "telegram/events";
import { getTelegram } from "./telegramClient";
import Binance from "node-binance-api";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getBinance } from "./Binance";
import chalk from "chalk";
import { getChatIdFromWatchList, getTradeQuantityInUsd } from "./keys";

let isRunning = false;
//let isConnected = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsPath = path.join(__dirname, "../logs");

const buyRegularExpression = /[#][A-Z]{1,10}[ ](Buy)[ ](Setup)/gim;
const shortRegularExpression = /[#][A-Z]{1,10}[ ](Short)[ ](Setup)/gim;

export const getTraderStatuses = () => {
  return { isRunning };
};

export const init = async () => {
  const { client, isConnected } = getTelegram();
  const { binance } = getBinance();
  if (!isConnected) return console.error(chalk.red("🛑 Telegram is no connected"));
  if (!binance) return console.error(chalk.red("🛑 Binance is no connected"));
  isRunning = true;

  client.addEventHandler(handler, new NewMessage({}));
};

async function handler(event /*:NewMessageEvent*/) {
  if (event.originalUpdate.out) return;
  let chatId = null;
  if (event?.originalUpdate?.message?.peerId?.className === "PeerChannel") {
    chatId = `${event.originalUpdate.message.peerId.channelId.toString()}`;
  } else if (event?.message?.peerId?.className === "PeerUser") {
    chatId = `${event.message.peerId.userId.toString()}`;
  }

  const today = new Date();
  await fs.appendFile(
    `${logsPath}/${today.getDate()}${today.getMonth()}${today.getFullYear()}.txt`,
    `Incoming message from ${chatId}: ${event.message.message}\n`,
    () => {}
  );

  const chatIdsList = await getChatIdFromWatchList();

  if (chatIdsList.find((id) => id === chatId)) {
    trade(event.message.message);
  } else {
    await fs.appendFile(
      `${logsPath}/${today.getDate()}${today.getMonth()}${today.getFullYear()}.txt`,
      `----This chat id: ${chatId} is not in the watch list\n`,
      () => {}
    );
    event.message.message.split("\n").forEach((line) => {
      if (buyRegularExpression.test(line.trim())) prepareTrading(event.message.message);
      if (shortRegularExpression.test(line.trim())) prepareTrading(event.message.message);
    });
  }
}

const trade = async (messageText) => {
  messageText.split("\n").forEach((line) => {
    if (buyRegularExpression.test(line.trim())) buySetup(messageText);
    if (shortRegularExpression.test(line.trim())) shortSetup(messageText);
  });
};

const prepareTrading = async (messageLine) => {
  const asset = getAsset(messageLine);
  const { binance } = getBinance();
  const { markPrice } = await binance.futuresMarkPrice(`${asset}USDT`);
  const quantityInUsd = await getTradeQuantityInUsd();
  const quantity = Math.round(quantityInUsd / markPrice);
  const today = new Date();

  await fs.appendFile(
    `${logsPath}/${today.getDate()}${today.getMonth()}${today.getFullYear()}.txt`,
    `----Trading Info ${messageLine}: asset: ${asset}USDT, Mark Price: ${markPrice},  quantity in usd: ${quantityInUsd}, trade amount: ${quantity}\n`,
    () => {}
  );
  return { asset, markPrice, quantityInUsd, quantity };
};

//#activo buy Setup
const buySetup = async (messageLine) => {
  const { binance } = getBinance();
  const { asset, markPrice, quantityInUsd, quantity } = await prepareTrading(messageLine);
  const result = await binance.futuresMarketBuy(`${asset}USDT`, quantity);
  const today = new Date();
  await fs.appendFile(
    `${logsPath}/${today.getDate()}${today.getMonth()}${today.getFullYear()}.txt`,
    `----Trading buy ${messageLine}: asset: ${asset}USDT, Mark Price: ${markPrice},  quantity in usd: ${quantityInUsd}, trade amount: ${quantity}, trade result: ${JSON.stringify(
      result
    )}\n`,
    () => {}
  );
};

const shortSetup = async (messageLine) => {
  const { binance } = getBinance();
  const { asset, markPrice, quantityInUsd, quantity } = await prepareTrading(messageLine);
  const result = await binance.futuresMarketSell(`${asset}USDT`, quantity);
  const today = new Date();
  await fs.appendFile(
    `${logsPath}/${today.getDate()}${today.getMonth()}${today.getFullYear()}.txt`,
    `----Trading short ${messageLine}: asset: ${asset}USDT, Mark Price: ${markPrice},  quantity in usd: ${quantityInUsd}, trade amount: ${quantity}, trade result: ${JSON.stringify(
      result
    )}\n`,
    () => {}
  );
};

const getAsset = (messageLine) => {
  const [assetWithHash] = messageLine.split(" ");
  return assetWithHash.replace("#", "");
};
