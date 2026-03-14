import { humanId } from "human-id";

export const generateId = (): string => {
  const readablePart = humanId({
    separator: "-",
    capitalize: false,
  });
  const randomPart = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");

  return `${readablePart}-${randomPart}`;
};
