import { tv } from "tailwind-variants";

export const link = tv({
  base: "font-medium text-sky-500 hover:text-sky-600 dark:hover:text-sky-400",
});

export const input = tv({
  base: "px-4 py-3 rounded bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700",
});

export const button = tv({
  base: "px-3 py-2 rounded max-w-max transition-all bg-neutral-300 dark:bg-neutral-700 hover:brightness-105 hover:scale-105 active:brightness-95 active:scale-95",
});
