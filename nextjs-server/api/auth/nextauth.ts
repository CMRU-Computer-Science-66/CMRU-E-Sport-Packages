// import type { NextApiRequest, NextApiResponse } from "next";
import type { User } from "@cmru-comsci-66/e-sport-database";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
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
	environment: { GitHubProvider?: { GITHUB_ID; GITHUB_SECRET }; GoogleProvider: { clientId; clientSecret }; NextAuth: { SECRET } },
): NextAuthOptions {
	return {
		providers: [
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
