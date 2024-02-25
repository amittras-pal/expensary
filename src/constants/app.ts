import { MantineColor } from "@mantine/core";

export const APP_TITLE = "Expensary";
export const primaryColor: MantineColor = "indigo";
export const planDetailsPath = /\/plans\/\w+/;
export const time20Min = 20 * 60 * 1000;
export const blinkColors: MantineColor[] = [
  "lime",
  "blue",
  "green",
  "yellow",
  "cyan",
];

export const equationRX = /[0-9]*( ){0,}([+-/*]( ){0,}[0-9]*( ){0,})*/;
export const urlRX =
  /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
