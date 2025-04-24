"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { API_URL } from "@/lib/constants";

const SignInForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setShowLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      const token = data.token;
      const user = data.data;

      localStorage.setItem("optlib_auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(setUser({ user, token }));

      setSuccess("Logged in successfully!");

      router.push("/home");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-[360px] mt-4 py-4">
        <CardHeader>
          <CardTitle className="flex flex-col items-center">
            <Image src="/logo.png" height={100} width={100} alt="Optumus" />
            <h2 className="text-2xl">Login</h2>
          </CardTitle>
          <CardDescription className="flex flex-col items-center">
            Enter your login credentials below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="email" className="mb-2">
                Email:
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-xs"
                required
              />
            </div>

            <div className="mb-5">
              <Label htmlFor="password" className="mb-2">
                Password:
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-xs"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-950 text-white py-2 px-4 rounded-lg hover:bg-amber-900 cursor-pointer"
            >
              {showLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="flex flex-col items-center gap-2 mt-3">
              <Link href="/register" className="flex text-sm link ">
                No account yet? Click here to register
              </Link>
            </div>
          </form>
        </CardContent>
        {(success || error) && (
          <CardFooter className="flex flex-col items-center justify-center">
            {success && <p className="text-sm text-green-500">{success}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default SignInForm;
