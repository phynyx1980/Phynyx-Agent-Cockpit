import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #8B0000 0%, #CC1100 40%, #FF2020 100%)",
              boxShadow: "0 0 20px rgba(204,17,0,0.4), 0 0 40px rgba(204,17,0,0.2)",
            }}
          >
            🧠
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            PHYNYX AGENT COCKPIT
          </h1>
          <p className="text-sm text-[#999999] mt-1">
            Jarvis wartet auf dich, Philip.
          </p>
        </div>

        {/* Sign In Card */}
        <div className="rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] p-6 space-y-4">
          <p className="text-xs uppercase tracking-widest text-[#999999] text-center font-semibold">
            Zugang
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-[#1A1A1A] text-sm font-semibold hover:bg-[#f0f0f0] transition-all active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Mit Google anmelden
            </button>
          </form>

          <p className="text-[10px] text-center text-[#555555]">
            Nur für Philip Trost · Phynyx Trust Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
