import { PrismaClient } from "../client";

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		interface Global {
			prisma: PrismaClient;
		}
	}
}

/**
 * @example
 * ```
 * import database from "@cmru-comsci-66/e-sport-database";
 *
 * database.user.findMany()
 * ```
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
let prisma: PrismaClient;

if (typeof window === "undefined") {
	if (process.env.NODE_ENV === "production") {
		prisma = new PrismaClient();
	} else {
		if (!global.prisma) {
			global.prisma = new PrismaClient();
		}
		prisma = global.prisma;
	}
}

export default prisma;
export type * from "../client";
