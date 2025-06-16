callbacks: {
  async jwt({ token, profile }) {
    if (profile) {
      token.sub = profile.sub;
      token.email = profile.email;
      token.name = profile.name;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      // @ts-ignore
      session.user.sub = token.sub;
      // @ts-ignore
      session.user.email = token.email;
      // @ts-ignore
      session.user.name = token.name;
    }
    return session;
  },
},
