import chalk from "chalk";

const badgeText = "[DevCodes SDK] ";

export const logger = {
  log: (message: any) => {
    console.log(chalk.blue(badgeText), message);
  },

  warn: (message: any) => {
    console.warn(chalk.yellow(badgeText), message);
  },

  error: (message: any) => {
    console.error(chalk.red(badgeText), message);
  },
};
