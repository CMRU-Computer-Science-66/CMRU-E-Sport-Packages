/* eslint-disable unicorn/prevent-abbreviations */
import { deleteAsync } from "del";

const ignore = ["node_modules"],
	patterns = ["**/.next", "**/cjs", "**/esm", "**/dist", "**.tsbuildinfo"];

const deletedItems = await deleteAsync(patterns, { ignore });

console.info("Deleted Temp files:\n" + deletedItems.join("\n"));
