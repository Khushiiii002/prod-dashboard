import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        const { email, password } = credentials
        if (!email || !password) return null

        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          const hashedPassword = await bcrypt.hash(password, 10)

          user = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
            },
          })

          return user
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return user
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}