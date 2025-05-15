'use client'

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import '../../globals.css'
export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (path: string) => {


        try {
            if (path === "credential") {
                await signIn('credentials', {
                    email,
                    password,
                    callbackUrl: '/'
                });
            }

            else if (path == "google") {
                await signIn("google", {
                    redirect: false,
                    callbackUrl: 'http://localhost:3000'
                });
            }
        } catch (error: any) {
            toast.error(error.message || "Problem in signin in try again")
        }

    };

    return (
        <section className="fixed inset-0 auth-page">
            <div className="w-full min-w-[300px] max-w-md flex flex-col items-center gap-4 absolute absolute-center bg-black/10 backdrop-blur-md pt-8 pb-10 px-4 rounded-md border-[1px] border-white/50 shadow-md shadow-black/40">
                <h1 className="text-3xl font-bold pb-4">Login</h1>

                <input
                    className="w-full h-10 px-5 bg-white/80 rounded-full text-black"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <input
                    className="w-full h-10 px-5 bg-white/80 rounded-full text-black"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"

                />
                <div className="w-full mt-8 flex flex-col gap-2">
                    <Button className="w-full bg-black h-10 rounded-full text-white font-semibold cursor-pointer" onClick={() => handleLogin("credential")}>
                        Submit
                    </Button>
                    {/* Google Sign-in Button */}
                    <Button className="w-full bg-white h-10 rounded-full text-black font-semibold px-2 flex flex-row items-center cursor-pointer border-[1px] border-black/50" onClick={() => handleLogin("google")}>
                        <span><Image src="/google-logo.webp" height={20} width={30} alt="google-logo" /></span>
                        <span className="w-full text-center -ml-8">Continue with Google</span>
                    </Button>
                </div>
            </div>

        </section>
    );
}
