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

const getKey = async (key) => {
  try {
    return await db.get(key);
  } catch {
    return null;
  }
};
