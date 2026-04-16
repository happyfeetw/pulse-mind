import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

const GITHUB_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const ADMIN_IDS = (process.env.ADMIN_GITHUB_IDS || "").split(",").filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GitHub({
      clientId: GITHUB_ID,
      clientSecret: GITHUB_SECRET,
    }),
  ],
  trustHost: true,
  callbacks: {
    async session({ session, user }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true },
        });
        (session.user as { role?: string }).role = dbUser?.role || "user";
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubId = String(profile.id || "");
        if (ADMIN_IDS.includes(githubId)) {
          await prisma.user.update({
            where: { email: user.email || "" },
            data: { role: "admin" },
          });
        }
      }
      return true;
    },
  },
});
