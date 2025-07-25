"use client";
import { signIn } from "next-auth/react";

export default function GoogleLoginButton() {
  return (
    <button className="inline-flex dark:zeleni zabut bg-zelena items-center transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-25 justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-input bg-background hover:text-accent-foreground h-10 px-4 py-2 col-span-2 transition-colors duration-200 hover:bg-accent" onClick={() => signIn("google")}>
         <span className="flex items-center gap-2">
           <svg
             xmlns="http://www.w3.org/2000/svg"
             width="24"
             height="24"
             viewBox="0 0 24 24"
             fill="none"
             stroke="currentColor"
             strokeWidth="2"
             strokeLinecap="round"
             strokeLinejoin="round"
             className="lucide lucide-download h-4 w-4"
           >
             <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
             <polyline points="7 10 12 15 17 10"></polyline>
             <line x1="12" x2="12" y1="15" y2="3"></line>
           </svg>
           Free Download
           </span>
    </button>
  );
}
