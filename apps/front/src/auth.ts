
import { api } from "@/constants";
import axios from "axios";
import { Session ,User} from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions:NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt" as "jwt"
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        CredentialsProvider({

            credentials: {
                email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {

                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const data = {
                    email: credentials.email,
                    password: credentials.password
                }
                try {
                    const res = await axios.post(`${api}/auth/signin`, data,{
                        withCredentials:true
                    });

                    const cookies = res.headers["set-cookie"];
                    const tokenCookie = cookies?.find((c:string)=>c.startsWith("access_Token="));
                    const token = tokenCookie?.split("=")[1]?.split(';')[0];

                    if(!token) return null;


                    if (!res || !res?.data) {
                        return null
                    }

                    const user = res?.data;

                    return {
                        id:user?.id,
                        email: user?.email,
                        name: user?.name,
                        avatar:user?.avatar,
                        accessToken:token
                    }
                } catch (error) {
                    return null
                }


            },
            
        }),
    ],
    callbacks: {
        async signIn({ user, account, }) {

            if (account && account.provider === 'google') {

                // Send Google data to your backend for storage or verification
                let res = await axios.post(`${api}/auth/google-login`, {
                    name: user.name,
                    email: user.email,
                    avatar: user.image,
                },
                {
                    withCredentials: true
                }
            );

                const cookies = res.headers["set-cookie"];
                const tokenCookie = cookies?.find((c: string) => c.startsWith("access_Token="));
                const token = tokenCookie?.split("=")[1]?.split(';')[0];

                if (!token) return false;


                if (!res || !res?.data) {
                    return false
                }

                user.id =res.data.id;
                (user as any).accessToken =token;
                (user as any).avatar = res.data.avatar

            }
            return true;  // Allow sign in
        },
        async jwt({token,user}:{token:JWT,user:any}){
 
            if(user){
                token.accessToken = user?.accessToken;
                token.id = user.id as number;
                token.name = user.name;
                token.email = user.email;
                token.avatar = user.avatar
            }

            return token;
        },
        async session({ session, token }:{session:Session,token:JWT}) {

            if (session.user) {
                
                (session.user as any).id = token.id as number
                session.user.name = token?.name;
                session.user.email = token.email;
                (session.user as any).accessToken = token.accessToken;
                (session.user as any).avatar = token.avatar
            }

           
            return session;
        }
    },
    pages: {
        signIn: '/signin'
    },
}