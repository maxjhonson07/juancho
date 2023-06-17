import { NewMessage, NewMessageEvent } from "telegram/events";
import { getTelegram } from "./telegramClient";
import Binance from "node-binance-api";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getBinance } from "./Binance";
import chalk from "chalk";
import { getTradeQuantityInUsd } from "./keys";

let isRunning = false;
//let isConnected = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsPath = path.join(__dirname, "../logs");

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
    chatId = `-100${event.originalUpdate.message.peerId.channelId.toString()}`;
  } else if (event?.message?.peerId?.className === "PeerUser") {
    chatId = `-100${event.message.peerId.userId.toString()}`;
  }

  const today = new Date();
  await fs.appendFile(
    `${logsPath}/${today.getDate()}${today.getMonth()}${today.getFullYear()}.txt`,
    `Incoming message from ${chatId}: ${event.message.message}\n`,
    () => {}
  );

  //if (config?.chatIds?.find((id) => id === chatId)) {
  trade(event.message.message);
  //}
}

const trade = async (messageText) => {
  const buyRegularExpression = /[#][A-Z]{1,10}[ ](Buy)[ ](Setup)/gim;
  const shortRegularExpression = /[#][A-Z]{1,10}[ ](Short)[ ](Setup)/gim;

  messageText.split("\n").forEach((line) => {
    if (buyRegularExpression.test(line.trim())) buySetup(messageText);
    if (shortRegularExpression.test(line.trim())) shortSetup(messageText);
  });
};

//#activo buy Setup
const buySetup = async (messageLine) => {
  const asset = getAsset(messageLine);
  const { binance } = getBinance();
  const { markPrice } = await binance.futuresMarkPrice(`${asset}USDT`);
  const quantityInUsd = await getTradeQuantityInUsd();
  const quantity = Math.round(quantityInUsd / markPrice);
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
  const asset = getAsset(messageLine);
  const { binance } = getBinance();
  const { markPrice } = await binance.futuresMarkPrice(`${asset}USDT`);
  const quantityInUsd = await getTradeQuantityInUsd();
  const quantity = Math.round(quantityInUsd / markPrice);
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
