import { MantineColor } from "@mantine/core";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE;
export const primaryColor: MantineColor = "indigo";
export const planDetailsPath = /\/plans\/\w+/;
export const _20Min = 20 * 60 * 1000;

export const eqSanityRX = /([^\d.()+\-*/])/g;
export const urlRX =
  /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
