// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { login } from "@/components/actions/login-action";
// import { useActionState, useEffect } from "react";
// import { SubmitButton } from "@/components/ui/submitButton";
// import { FieldError, FormError } from "@/components/ui/FormError";
// import { Heart } from "lucide-react";

// export default function Page() {
//   const router = useRouter();
//   const [state, dispatch] = useActionState(login, undefined);

//   // Check if login was successful and redirect
//   useEffect(() => {
//     if (state?.success) {
//       // Store user info in localStorage
//       localStorage.setItem("access_token", state.access_token);
//       localStorage.setItem("user_role", state.role || "patient");
//       localStorage.setItem("user_email", state.email || "");
      
//       // Redirect based on role
//       if (state.role === "clinician") {
//         router.push("/clinician/dashboard");
//       } else {
//         router.push("/patient/dashboard");
//       }
//     }
//   }, [state, router]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center px-4">
//       {/* Back to Home Link */}
//       <Link 
//         href="/" 
//         className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
//       >
//         <Heart className="w-5 h-5 text-red-500" />
//         <span className="font-medium">Salama AI</span>
//       </Link>

//       <form action={dispatch} className="w-full max-w-md">
//         <Card className="rounded-2xl shadow-xl border border-blue-100 bg-white">
//           <CardHeader className="text-center">
//             {/* Logo */}
//             <div className="flex justify-center mb-4">
//               <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-3 rounded-2xl">
//                 <Heart className="w-8 h-8 text-red-500 fill-red-500" />
//               </div>
//             </div>
//             <CardTitle className="text-2xl font-bold text-slate-800">
//               Welcome Back
//             </CardTitle>
//             <CardDescription className="text-slate-500">
//               Login to check your heart health
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="grid gap-6 p-6">
//             <div className="grid gap-3">
//               <Label htmlFor="username" className="text-slate-700 font-medium">
//                 Email Address
//               </Label>
//               <Input
//                 id="username"
//                 name="username"
//                 type="email"
//                 placeholder="you@example.com"
//                 required
//                 className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg"
//               />
//               <FieldError state={state} field="username" />
//             </div>
            
//             <div className="grid gap-3">
//               <div className="flex justify-between items-center">
//                 <Label htmlFor="password" className="text-slate-700 font-medium">
//                   Password
//                 </Label>
//                 <Link
//                   href="/password-recovery"
//                   className="text-sm text-blue-600 hover:text-blue-700"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <Input
//                 id="password"
//                 name="password"
//                 type="password"
//                 placeholder="••••••••"
//                 required
//                 className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg"
//               />
//               <FieldError state={state} field="password" />
//             </div>

//             <SubmitButton text="Sign In" />
//             <FormError state={state} />

//             <div className="text-center text-sm text-slate-500">
//               Don't have an account?{" "}
//               <Link
//                 href="/register"
//                 className="text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Create account
//               </Link>
//             </div>

//             {/* Demo Credentials Hint (for testing) */}
//             <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
//               <p className="text-xs text-slate-500 text-center">
//                 Demo: patient@example.com / any password
//               </p>
//             </div>
//           </CardContent>
//         </Card>
//       </form>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submitButton";
import { Heart } from "lucide-react";

export default function Page() {
  const router = useRouter();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-login as patient for development
    localStorage.setItem("access_token", "dev_token");
    localStorage.setItem("user_role", "patient");
    localStorage.setItem("user_email", "patient@salama.ai");
    
    router.push("/patient/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center px-4">
      {/* Back to Home Link */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition"
      >
        <Heart className="w-5 h-5 text-red-500" />
        <span className="font-medium">Salama AI</span>
      </Link>

      <form onSubmit={handleSignIn} className="w-full max-w-md">
        <Card className="rounded-2xl shadow-xl border border-blue-100 bg-white">
          <CardHeader className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-blue-100 to-teal-100 p-3 rounded-2xl">
                <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-slate-500">
              Login to check your heart health
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 p-6">
            <div className="grid gap-3">
              <Label htmlFor="username" className="text-slate-700 font-medium">
                Email Address
              </Label>
              <Input
                id="username"
                name="username"
                type="email"
                placeholder="you@example.com"
                className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg"
              />
            </div>
            
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-slate-700 font-medium">
                  Password
                </Label>
                <Link
                  href="/password-recovery"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="border-slate-200 focus:border-blue-400 focus:ring-blue-400 rounded-lg"
              />
            </div>

            <SubmitButton text="Sign In" />

            <div className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}