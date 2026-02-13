import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { parseSiweMessage, validateSiweMessage } from "viem/siwe";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Ethereum",
            credentials: {
                message: { label: "Message", type: "text", placeholder: "0x0" },
                signature: { label: "Signature", type: "text", placeholder: "0x0" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.message || !credentials?.signature) {
                        return null;
                    }

                    const message = parseSiweMessage(credentials.message);

                    const nextAuthUrl = process.env.NEXTAUTH_URL
                        ? new URL(process.env.NEXTAUTH_URL)
                        : null;

                    if (!nextAuthUrl) {
                        throw new Error("NEXTAUTH_URL is not set");
                    }

                    const isValid = validateSiweMessage({
                        message,
                        domain: nextAuthUrl.host,
                        nonce: message.nonce,
                    });

                    if (!isValid) {
                        return null;
                    }

                    const verified = await publicClient.verifySiweMessage({
                        message: credentials.message,
                        signature: credentials.signature as `0x${string}`,
                    });

                    if (verified && message.address) {
                        return { id: message.address };
                    }
                    return null;
                } catch (e) {
                    console.error("NextAuth authorize error:", e);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async session({ session, token }) {
            session.user = {
                name: token.sub,
                image: `https://avatar.vercel.sh/${token.sub}`,
            } as any;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
