import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import input from "input";
import chalk from "chalk";

let stringSession = null;
let apiId = null;
let apiHash = null;
let isConnected = false;
let client = null;

export const getTelegram = () => {
  return { isConnected: isConnected, client: client };
};

export const connect = async () => {
  try {
    console.log(chalk.green("Connecting to Telegram......"));
    if (stringSession && apiId && apiHash) {
      let { client: localClient, stringSession: localStringSession } = await connectWithSession();

      setConnection(localClient, localStringSession);
    } else {
      let { client: localClient, stringSession: stringSessionLocal } = await connectWithParrameters();
      setConnection(localClient, stringSessionLocal);
    }
  } catch (err) {
    console.log(err);
    resetConnection();
  }
};

const connectWithParrameters = async () => {
  const apiIdString = await input.text("Please enter your apiId: ");
  apiId = Number.parseInt(apiIdString);
  apiHash = await input.text("Please enter your apiHash: ");

  let client = new TelegramClient(new StringSession(stringSession), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () => await input.text("Please enter the code you received: "),
    onError: (err) => {
      throw new Error(err);
    },
  });
  let stringSessionLocal = client.session.save();
  return { client, stringSession: stringSessionLocal };
};

const connectWithSession = async () => {
  const client = new TelegramClient(new StringSession(stringSession), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start();
  let stringSessionLocal = client.session.save();

  return { client, stringSession: stringSessionLocal };
};

const setConnection = (clientLocal, stringSessionLocal) => {
  isConnected = true;
  stringSession = stringSessionLocal;
  client = clientLocal;
};

const resetConnection = () => {
  isConnected = false;
  stringSession = null;
  apiHash = null;
  apiId = null;
};
