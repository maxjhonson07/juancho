import { Level } from "level";
import input from "input";

const db = new Level("keys", { valueEncoding: "json", errorIfExists: false });

export const addTradeQuantityInUsd = async () => {
  const quantity = await input.text("Please enter the Trade Quantity in USD: ");
  await db.put("tradeQuantityInUSD", parseInt(quantity));
};

export const getTradeQuantityInUsd = async () => {
  const value = await getKey("tradeQuantityInUSD");
  return value === null ? 100 : value;
};

export const addLaverage = async () => {
  const laverage = await input.text("Please enter the Laverage: ");
  await db.put("laverage", parseInt(laverage));
};

export const getLaverage = async () => {
  return await getKey("laverage");
};

export const setChatIdToWatchList = async () => {
  const chatIdList = await input.text("Please enter the Chat Id: ");
  const currentlist = (await getChatIdFromWatchList()) ?? [];
  currentlist.push(chatIdList);
  await db.put("watchList", currentlist);
};

export const printChatIdFromWatchList = async () => {
  const currentlist = (await getChatIdFromWatchList()) ?? [];
  if (currentlist.length === 0) return console.log("Watch list is empty");

  currentlist.forEach((value, index) => {
    console.log(`${index + 1}) ${value}`);
  });
};

export const deleteChatIdFromWatchList = async () => {
  const currentlist = (await getChatIdFromWatchList()) ?? [];
  if (currentlist.length === 0) return console.log("Watch list is empty");

  currentlist.forEach((value, index) => {
    console.log(`${index + 1}) ${value}`);
  });

  const order = await input.text("Insert the chat ID's order number you want to delete:");

  currentlist.splice(parseInt(order - 1), 1);

  await db.put("watchList", currentlist);
};

export const getChatIdFromWatchList = async () => {
  return await getKey("watchList");
};

const getKey = async (key) => {
  try {
    return await db.get(key);
  } catch {
    return null;
  }
};
