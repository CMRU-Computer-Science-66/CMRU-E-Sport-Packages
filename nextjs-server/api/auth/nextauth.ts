// import type { NextApiRequest, NextApiResponse } from "next";
import type { User } from "@cmru-comsci-66/e-sport-database";
import { OAuth2Scopes as DiscordOAuth2Scopes } from "discord-api-types";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";

/**
 * Generates the NextAuth options object based on the provided adapter and environment configuration.
 * @param adapter - The adapter to be used for NextAuth.
 * @param environment - The environment configuration containing provider and secret information.
 * @returns The NextAuth options object.
 * @example
 * ```
 * nextAuthOptions(PrismaAdapter(prisma), {
 *       NextAuth: {
 *          SECRET: process.env.NEXTAUTH_SECRET,
 *       },
 *       DiscordProvider: {
 *          clientId: process.env.DISCORD_CLIENT_ID,
 *          clientSecret: process.env.DISCORD_CLIENT_SECRET
 *       },
 *       GitHubProvider: {
 *          clientId: process.env.GITHUB_ID,
 *          clientSecret: process.env.GITHUB_SECRET
 *       },
 *       GoogleProvider: {
 *          clientId: process.env.GOOGLE_CLIENT_ID,
 *          clientSecret: process.env.GOOGLE_CLIENT_SECRET
 *       }
 *    }
 * ```
 */
export function nextAuthOptions(
	adapter: Adapter,
	environment: { DiscordProvider?: { clientId; clientSecret }; GitHubProvider?: { GITHUB_ID; GITHUB_SECRET }; GoogleProvider: { clientId; clientSecret }; NextAuth: { SECRET } },
): NextAuthOptions {
	return {
		providers: [
			DiscordProvider({
				clientId: environment.DiscordProvider.clientId || process.env.DISCORD_CLIENT_ID,
				clientSecret: environment.DiscordProvider.clientSecret || process.env.DISCORD_CLIENT_SECRET,
				authorization: { params: { scope: [DiscordOAuth2Scopes.Email, DiscordOAuth2Scopes.Identify, DiscordOAuth2Scopes.Guilds, DiscordOAuth2Scopes.GuildsJoin].join(" ") } },
			}),
			GitHubProvider({
				clientId: environment.GitHubProvider.GITHUB_ID || process.env.GITHUB_ID,
				clientSecret: environment.GitHubProvider.GITHUB_SECRET || process.env.GITHUB_SECRET,
			}),
			GoogleProvider({
				async profile(profile: GoogleProfile) {
					const user: User = {
						id: profile.sub,
						name: profile.name,
						emailVerified: undefined,
						image: profile.picture,
						email: profile.email,
						created_at: new Date(),
						updateAt: new Date(),
					};

					return {
						...user,
					};
				},
				clientId: environment.GoogleProvider.clientId || process.env.GOOGLE_CLIENT_ID,
				clientSecret: environment.GoogleProvider.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
			}),
		],
		adapter,
		secret: process.env.NEXTAUTH_SECRET || environment.NextAuth.SECRET,
	};
}
