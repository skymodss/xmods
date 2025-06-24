import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    // Kada korisnik potvrdi signIn, traži backend token i stavi ga u JWT
    async jwt({ token, account, profile, user }) {
      // Samo prilikom prvog logina
      if (account && profile) {
        try {
          // ZAMENI URL ispod sa pravim endpointom
          const res = await axios.post("https://your-backend.com/api/faust/auth/token", {
            email: profile.email,
            google_id: profile.sub,
            // Dodaj još polja ako backend traži
          });
          token.backendToken = res.data.token; // backend JWT token
          token.user_id = res.data.user_id;
          token.displayname = res.data.displayname;
        } catch (err) {
          console.error("Failed to get backend token:", err);
          // Opciono: možeš baciti error da blokira login
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Token iz JWT-a stavljaš u session, dostupan je u frontendu
      session.backendToken = token.backendToken;
      session.user_id = token.user_id;
      session.displayname = token.displayname;
      return session;
    },
  },
});
