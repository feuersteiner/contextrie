const BASE64_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
const ID_LENGTH = 6;
const CUSTOM_EPOCH_SECONDS = Date.UTC(2026, 3, 1) / 1000;

/**
 * Generates an id from the current Unix timestamp using a compact base64 alphabet.
 */

export const generateId = (prefix?: string): string => {
  let secondsSinceCustomEpoch = Math.floor(Date.now() / 1000) - CUSTOM_EPOCH_SECONDS;

  let base64Timestamp = "";

  for (let index = 0; index < ID_LENGTH; index += 1) {
    base64Timestamp =
      BASE64_ALPHABET[secondsSinceCustomEpoch % 64] + base64Timestamp;
    secondsSinceCustomEpoch = Math.floor(secondsSinceCustomEpoch / 64);
  }

  return `${prefix ? `${prefix}` : ""}${base64Timestamp}`;
};
