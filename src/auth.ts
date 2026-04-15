import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

// Your GitHub OAuth credentials - replace with actual values
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

// Admin GitHub IDs - replace with your actual GitHub ID
const ADMIN_GITHUB_IDS = process.env.ADMIN_GITHUB_IDS?.split(",") || [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GitHub({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Check if user is admin
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });

      if (session.user) {
        (session.user as { role?: string }).role = dbUser?.role || "user";
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubId = profile.id?.toString() || "";
        
        // Check if this GitHub user is an admin
        if (ADMIN_GITHUB_IDS.includes(githubId)) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "admin" },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
