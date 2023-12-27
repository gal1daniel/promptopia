import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@models/user";
import { connectToDB } from '@utils/database';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async session({ session }) {
            try {
                const sessionUser = await User.findOne({
                    email: session.user.email
                });

                if (sessionUser) {
                    session.user.id = sessionUser._id.toString();
                }

                return session;
            } catch (error) {
                console.error("Session callback error:", error);
                throw error;
            }
        },
        async signIn({ profile }) {
            try {
                await connectToDB();
                const userExists = await User.findOne({
                    email: profile.email,
                });

                if (!userExists) {
                    await User.create({
                        email: profile.email,
                        username: profile.name.replace(" ", "").toLowerCase(),
                        image: profile.picture
                    });
                }

                return true;
            } catch (error) {
                console.error("SignIn callback error:", error);
                return false;
            }
        }
    }
});

export { handler as GET, handler as POST };
