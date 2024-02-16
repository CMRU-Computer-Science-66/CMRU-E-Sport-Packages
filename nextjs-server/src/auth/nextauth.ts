/* eslint-disable unicorn/no-null */
import type { PrismaClient, RoleType, User } from "@cmru-comsci-66/e-sport-database";
import bcrypt from "bcrypt";
import { OAuth2Scopes as DiscordOAuth2Scopes } from "discord-api-types/v10";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";

import isValidCredentials from "../validation/credentials";

/**
 * Generates the NextAuth options object based on the provided adapter and environment configuration.
 * @param adapter - The adapter to be used for NextAuth.
 * @param environment - The environment configuration containing provider and secret information.
 * @returns The NextAuth options object.
 * @example
 * ```
 * nextAuthOptions(database ,PrismaAdapter(prisma), {
 *       NextAuth: {
 *          Secret: process.env.NEXTAUTH_SECRET,
 *       },
 *       DiscordProvider: {
 *          clientId: process.env.DISCORD_CLIENT_ID,
 *          clientSecret: process.env.DISCORD_CLIENT_SECRET
 *       },
 *       GitHubProvider: {
 *          clientId: process.env.GITHUB_CLIENT_ID,
 *          clientSecret: process.env.GITHUB_CLIENT_SECRET
 *       },
 *       GoogleProvider: {
 *          clientId: process.env.GOOGLE_CLIENT_ID,
 *          clientSecret: process.env.GOOGLE_CLIENT_SECRET
 *       }
 *    }
 * ```
 */
export function nextAuthOptions(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	database: PrismaClient,
	adapter: Adapter,
	environment: { DiscordProvider?: { clientId; clientSecret }; GitHubProvider?: { clientId; clientSecret }; GoogleProvider: { clientId; clientSecret }; NextAuth: { Secret } },
): NextAuthOptions {
	return {
		providers: [
			CredentialsProvider({
				name: "Username",
				id: "login-username",
				credentials: {
					username: { label: "Username", type: "text" },
					password: { label: "Password", type: "password" },
				},
				authorize: async (credentials) => {
					try {
						await isValidCredentials(credentials);

						const user = await database.user.findUnique({
							where: {
								username: credentials.username.toLowerCase(),
							},
						});

						if (!user) {
							throw new Error("User not found");
						}

						const passwordsMatch = await bcrypt.compare(credentials.password, user?.password);

						if (!passwordsMatch) {
							throw new Error("Password or Username is not correct");
						}

						if (user?.password) {
							delete user.password;
						}

						return user;
					} catch (error) {
						throw new Error(error);
					}
				},
			}),
			CredentialsProvider({
				id: "register-username",
				name: "Register",
				credentials: {
					username: { label: "Username", type: "text" },
					password: { label: "Password", type: "password" },
					confirmPassword: { label: "Confirm Password", type: "password" },
				},
				authorize: async (credentials) => {
					try {
						await isValidCredentials(credentials);

						const hashPassword = await bcrypt.hash(credentials.password, 10);
						const existingUser = await database.user.findUnique({
							where: {
								username: credentials.username.toLowerCase(),
							},
						});

						if (existingUser) {
							throw new Error("Username is already exists");
						}

						const user = await database.user.create({
							data: {
								role: "viewer",
								name: credentials.username,
								username: credentials.username.toLowerCase(),
								password: hashPassword,
							},
						});

						if (user?.password) {
							delete user.password;
						}

						return user ? Promise.resolve(user) : Promise.resolve(null);
					} catch (error) {
						throw new Error(error);
					}
				},
			}),
			DiscordProvider({
				clientId: environment.DiscordProvider.clientId || process.env.DISCORD_CLIENT_ID,
				clientSecret: environment.DiscordProvider.clientSecret || process.env.DISCORD_CLIENT_SECRET,
				authorization: { params: { scope: [DiscordOAuth2Scopes.Email, DiscordOAuth2Scopes.Identify, DiscordOAuth2Scopes.Guilds, DiscordOAuth2Scopes.GuildsJoin].join(" ") } },
			}),
			GitHubProvider({
				clientId: environment.GitHubProvider.clientId || process.env.GITHUB_CLIENT_ID,
				clientSecret: environment.GitHubProvider.clientSecret || process.env.GITHUB_CLIENT_SECRET,
			}),
			GoogleProvider({
				async profile(profile: GoogleProfile) {
					const user: User = {
						id: profile.sub,
						name: profile.name,
						role: "unknown",
						username: undefined,
						password: undefined,
						emailVerified: undefined,
						image: profile.picture,
						email: profile.email,
						created_at: new Date(),
						updateAt: new Date(),
					};

					if (profile.hd === "g.cmru.ac.th") {
						user.role = "user" as RoleType;
					}

					return {
						...user,
					};
				},
				httpOptions: {
					timeout: 10_000, // 10 Seconds,
				},
				clientId: environment.GoogleProvider.clientId || process.env.GOOGLE_CLIENT_ID,
				clientSecret: environment.GoogleProvider.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
			}),
		],
		session: {
			strategy: "jwt",
		},
		jwt: {
			secret: process.env.NEXTAUTH_SECRET || environment.NextAuth.Secret,
		},
		adapter,
		callbacks: {
			async session({ session, token, user }) {
				if (token?.sub) {
					const user = await database.user.findUnique({
						where: {
							id: token.sub,
						},
					});
					session.user = user;
				}

				session = {
					...session,
					user: {
						...user,
						...session.user,
						password: undefined,
					} as User,
				};
				return session;
			},
		},
		secret: process.env.NEXTAUTH_SECRET || environment.NextAuth.Secret,
	};
}
