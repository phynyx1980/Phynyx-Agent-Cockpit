import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

// Extend JWT to carry Google tokens
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?:            string;
    refreshToken?:           string;
    accessTokenExpiresAt?:   number;
    googleId?:               string;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken?:  string;
    refreshToken?: string;
    googleId?:     string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/tasks",
            "https://www.googleapis.com/auth/drive.readonly",
          ].join(" "),
          access_type:     "offline",
          prompt:          "consent",
          response_type:   "code",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      // Erster Login — Google-Tokens in JWT übernehmen
      if (account) {
        token.accessToken          = account.access_token;
        token.refreshToken         = account.refresh_token;
        token.accessTokenExpiresAt = account.expires_at;
        token.googleId             = account.providerAccountId;
      }
      return token;
    },

    async session({ session, token }) {
      // Access Token der Session verfügbar machen
      session.accessToken  = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.googleId     = token.googleId;
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});
