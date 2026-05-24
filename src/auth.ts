import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import prisma from "@/lib/prisma";

const GITHUB_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const ADMIN_IDS = (process.env.ADMIN_GITHUB_IDS || "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

function resolveRole(githubId: string | null): "admin" | "user" {
  return githubId && ADMIN_IDS.includes(githubId) ? "admin" : "user";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GitHub({
      clientId: GITHUB_ID,
      clientSecret: GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.id || account?.provider !== "github") {
        return true;
      }

      const role = resolveRole(account.providerAccountId || null);

      await prisma.user.updateMany({
        where: { id: user.id },
        data: { role },
      });

      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider === "github") {
        token.role = resolveRole(account.providerAccountId || null);
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      const sessionUser = session.user as { id?: string; role?: string };
      if (token.sub) {
        sessionUser.id = token.sub;
      }
      if (typeof token.role === "string") {
        sessionUser.role = token.role;
      }

      return session;
    },
  },
});
