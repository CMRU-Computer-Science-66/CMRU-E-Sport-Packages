import database from "@cmru-comsci-66/e-sport-database";
import { nextAuthOptions } from "@cmru-comsci-66/e-sport-nextjs-server";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";

export default NextAuth(
	await nextAuthOptions(database, PrismaAdapter(database), {
		NextAuth: {
			Secret: process.env.NEXTAUTH_SECRET,
		},
		DiscordProvider: {
			clientId: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET,
		},
		GitHubProvider: {
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		},
		GoogleProvider: {
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		},
	}),
);
