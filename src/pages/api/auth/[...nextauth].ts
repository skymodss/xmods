import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      // Samo ako profile postoji i nije već setovan u token
      if (profile && !token.sub) {
        token.sub = profile.sub;
        token.email = profile.email;
        token.name = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Samo ako još nije setovano
        if (!(session.user as any).sub) (session.user as any).sub = token.sub;
        if (!(session.user as any).email) (session.user as any).email = token.email;
        if (!(session.user as any).name) (session.user as any).name = token.name;
      }
      return session;
    },
  },
});
