"use client";

import clsx from "clsx";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/authSlice";
import { API_URL } from "@/lib/constants";
import { UserSignUpFormDataType } from "@/lib/types";
import SignUpFormStep1 from "./step1";
import SignUpFormStep2 from "./step2";
import Loading from "@/app/loading";

export default function SignUpForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserSignUpFormDataType>({
    fullname: "Jarjar Jynx",
    username: "jarjynx",
    email: "jarjar@jynx.com",
    password: "password",
    password_confirmation: "password",
    photo: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;

    if (name === "photo" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        photo: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setIsFormSubmitted(true);

    const data = new FormData();
    data.append("fullname", formData.fullname);
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("password_confirmation", formData.password_confirmation);

    if (formData.photo) {
      data.append("photo", formData.photo);
    }

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error("Failed to register user");
      }

      const result = await response.json();
      const token = result.token;
      const user = result.user;

      localStorage.setItem("optlib_auth_token", token);

      dispatch(setUser({ user, token }));

      setIsLoading(false);

      toast(
        "You have successfully signed up to Optumus Galactic Library Management System. You will now be redirected to the homepage."
      );

      setTimeout(() => {
        router.push("/home");
      }, 3000);
    } catch (error) {
      console.error("Sign up error:", error);
      toast(
        "A problem was encountered while attempting to register your account. The administrators have been notified of this issue."
      );
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === 1 && formData.password !== formData.password_confirmation) {
      alert("Password needs to be confirmed!");
      return;
    }

    setStep((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card
        className={clsx("my-4 py-4", step === 4 ? "w-[800px]" : "w-[480px]")}
      >
        <CardHeader>
          {step === 1 && (
            <CardTitle className="flex flex-col items-center">
              <Image src="/logo.png" height={100} width={100} alt="Optumus" />
              <h2 className="text-2xl text-center m-3">Sign Up</h2>
            </CardTitle>
          )}
          <CardDescription>
            <h3 className="text-black text-lg font-semibold">
              Please provide your account information below.
            </h3>
            <div className="flex flex-row gap-0.5 mt-3 mb-0 bg-red-950 border-2 border-red-950">
              <div
                className={clsx(
                  "w-1/2 h-[14px]",
                  step >= 1 ? "bg-emerald-700" : "bg-emerald-100"
                )}
              ></div>
              <div
                className={clsx(
                  "w-1/2 h-[14px]",
                  step >= 2 ? "bg-emerald-700" : "bg-emerald-50"
                )}
              ></div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            encType="multipart/form-data"
            onSubmit={step === 2 ? handleSubmit : handleNext}
          >
            {step === 1 && (
              <SignUpFormStep1
                formData={formData}
                onInputChange={handleChange}
              />
            )}
            {step === 2 && (
              <SignUpFormStep2
                formData={formData}
                onBack={handleBack}
                onInputChange={handleChange}
                isFormSubmitted={isFormSubmitted}
              />
            )}
          </form>

          <div className="flex flex-col gap-2 items-center mt-3">
            {step === 1 && (
              <>
                <Link href="/sign-in" className="flex text-sm link">
                  Already have an account? Sign in
                </Link>
                <Link href="/" className="flex text-sm link">
                  Back to the Homepage
                </Link>
              </>
            )}
          </div>
        </CardContent>
        {isLoading && (
          <CardFooter className="flex flex-row items-center justify-center">
            <Loading />
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
