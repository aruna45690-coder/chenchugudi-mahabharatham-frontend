"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0f1e] via-[#0d1a2e] to-[#0a0f1e] relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-500 opacity-10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-yellow-400 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Back to home link */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-orange-300 hover:text-orange-100 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 text-center z-10">
        <div className="text-5xl mb-3">🏮</div>
        <h1 className="text-3xl font-bold text-white mb-1">
          చెంచుగుడి మహాభారతం
        </h1>
        <p className="text-orange-300 text-sm tracking-widest uppercase">
          Chenchugudi Mahabharatham
        </p>
      </div>

      {/* Clerk Sign In — real Google Login */}
      <div className="z-10">
        <SignIn
          path="/login"
          forceRedirectUrl="/admin"
          signUpForceRedirectUrl="/admin"
          appearance={{
            elements: {
              rootBox: "shadow-2xl",
              card: "bg-[#0d1a2e]/90 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl",
              headerTitle: "text-white text-xl font-bold",
              headerSubtitle: "text-orange-200/70 text-sm",
              socialButtonsBlockButton:
                "bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all duration-200",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-white/40 text-xs",
              formFieldLabel: "text-orange-100/80 text-sm",
              formFieldInput:
                "bg-white/5 border border-white/10 text-white rounded-lg focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all",
              formButtonPrimary:
                "bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg",
              footerActionLink: "text-orange-400 hover:text-orange-300",
              identityPreviewText: "text-white/80",
              identityPreviewEditButton: "text-orange-400",
              alertText: "text-red-300",
            },
            layout: {
              socialButtonsPlacement: "top",
            },
          }}
        />
      </div>

      {/* Footer note */}
      <p className="mt-6 text-white/30 text-xs z-10">
        Admins — your access level is granted after sign-in
      </p>
    </div>
  );
}
