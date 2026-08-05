import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail, drcEmailTemplate } from "@/lib/email";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.dirtridecamp.com";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { membership: true },
        });

        if (!user || !user.passwordHash) return null;

        const valid = compareSync(credentials.password, user.passwordHash);
        if (!valid) return null;

        const isMember = !!(user.membership && user.membership.status === "active" && new Date(user.membership.endDate) > new Date());

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          isMember,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "rider";
        token.image = user.image || null;
        token.isMember = (user as { isMember?: boolean }).isMember || false;
      }
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { membership: true },
        });
        if (dbUser) {
          token.image = dbUser.image || null;
          token.role = dbUser.role;
          token.isMember = !!(dbUser.membership && dbUser.membership.status === "active" && new Date(dbUser.membership.endDate) > new Date());
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { image?: string | null }).image = token.image as string | null;
        (session.user as { isMember?: boolean }).isMember = token.isMember as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user }) {
      if (!user?.email || !user?.name) return;
      const email = user.email;
      const name = user.name;
      const role = (user as { role?: string }).role;
      if (role === "admin") return;

      // Notify admin about login
      try {
        const admins = await prisma.user.findMany({ where: { role: "admin" }, select: { id: true } });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: "system",
              title: "Rider Logged In",
              message: `${name} (${email}) just logged in.`,
              link: "/admin/riders",
            },
          });
        }
      } catch (err) {
        console.error("[ADMIN NOTIF] Login notification failed:", err);
      }

      try {
        await sendEmail({
          to: email,
          subject: "You're logged in to DRC!",
          html: drcEmailTemplate({
            title: "Welcome Back, Rider!",
            body: `
              <p style="color: #F1E9DD; font-size: 15px;">Hi ${name},</p>
              <p style="color: #B9A886; font-size: 14px;">You just logged in to your <strong style="color: #E8622C;">Dirt Ride Camp</strong> account.</p>
              <p style="color: #B9A886; font-size: 14px;">Check out upcoming rides, track your progress, or explore membership benefits.</p>
              <div style="background: #0D0D0D; border: 1px solid #E8622C; border-radius: 4px; padding: 16px; margin: 20px 0; text-align: center;">
                <p style="color: #F1E9DD; font-size: 14px; margin: 0 0 4px;">DRC Membership</p>
                <p style="color: #B9A886; font-size: 13px; margin: 0;">Welcome kit, priority booking & member-only rides — <strong style="color: #E8622C;">₹999/year</strong></p>
              </div>
              <p style="color: #666; font-size: 12px;">If this wasn't you, please change your password immediately.</p>
            `,
            ctaText: "Explore Membership",
            ctaUrl: `${baseUrl}/membership`,
          }),
        });
      } catch (err) {
        console.error("[EMAIL] Login email failed:", err instanceof Error ? err.message : String(err));
      }
    },
  },
};
