'use client'

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from 'next/navigation'
import Image from "next/image";

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const router = useRouter()
    const handleLogin = async (path:string) => {

        let res;

        if (path === "credential"){
             res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });


            if (res?.ok) {

                router.push('/')

            } else {
                // error
                setError(res?.error || "Problem in signin in try again")
            }
        }

        else if(path=="google"){
            res =await signIn("google",{
                redirect:false,
                callbackUrl:'http://localhost:3000'
            });

            if (res?.ok) {
                router.push("/"); // Redirect to home if successful
            } else {
                setError(res?.error || "Problem signing in with Google. Try again.");
            }
        }
        
    };

    return (
        <section className="fixed inset-0 bg-white">
            <div className="w-full min-w-[300px] max-w-md flex flex-col items-center gap-4 absolute absolute-center bg-black/10 backdrop-blur-md pt-8 pb-10 px-4 rounded-md border-[1px] border-black/20">
                <h1 className="text-2xl font-bold pb-4">Login</h1>
                <input
                    className="w-full h-10 px-5 bg-white/60 rounded-full"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                />
                <input
                    className="w-full h-10 px-5 bg-white/60 rounded-full"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <button onClick={() => handleLogin("credential")} className="w-full mt-4 bg-black h-10 rounded-full text-white font-semibold cursor-pointer">
                    Submit
                </button>
                {/* Google Sign-in Button */}
                <button
                    onClick={() => handleLogin("google")}
                    className="w-full mt-4 bg-white h-10 rounded-full text-black font-semibold px-2 flex flex-row items-center cursor-pointer border-[1px] border-black/50"
                >
                    <span><Image src="/google-logo.webp" height={20} width={30} alt="google-logo" /></span> 
                    <span className="w-full text-center -ml-8">Continue with Google</span>
                </button>
            </div>
            
        </section>
    );
}
