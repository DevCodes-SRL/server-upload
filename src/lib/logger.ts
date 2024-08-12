import chalk from "chalk";

const badgeText = "[DevCodes SDK] ";

/**
 * The `logger` object provides methods for logging messages to the console with different levels of severity:
 * `log`, `warn`, and `error`. Each method formats the message with a specific color and a badge.
 */
export const logger = {
  /**
   * Logs an informational message to the console.
   *
   * @param message - The message to log. (Required)
   */
  log: (message: any) => {
    console.log(chalk.blue(badgeText), message);
  },

  /**
   * Logs a warning message to the console.
   *
   * @param message - The warning message to log. (Required)
   */
  warn: (message: any) => {
    console.warn(chalk.yellow(badgeText), message);
  },

  /**
   * Logs an error message to the console.
   *
   * @param message - The error message to log. (Required)
   */
  error: (message: any) => {
    console.error(chalk.red(badgeText), message);
  },
};
