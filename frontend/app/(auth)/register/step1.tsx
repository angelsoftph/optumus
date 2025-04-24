"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserSignUpFormDataType } from "@/lib/types";

interface FormProps {
  formData: UserSignUpFormDataType;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SignUpFormStep1: React.FC<FormProps> = ({ formData, onInputChange }) => {
  return (
    <>
      <div className="flex flex-row gap-4 mb-4">
        <div className="w-full">
          <Label className="block mb-1">Full Name</Label>
          <Input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={onInputChange}
            className="w-full border border-gray-300 px-3 py-1 rounded-xs"
            required
          />
        </div>
      </div>

      <div className="flex flex-row gap-4 mb-4">
        <div className="w-full">
          <Label className="block mb-1">Email Address</Label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={onInputChange}
            className="w-full border border-gray-300 px-3 py-1 rounded-xs"
            required
          />
        </div>
      </div>

      <div className="flex flex-row gap-4 mb-5">
        <div className="w-1/2">
          <Label className="block mb-1">Create Password</Label>
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={onInputChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-xs"
            required
          />
        </div>
        <div className="w-1/2">
          <Label className="block mb-1">Confirm Password</Label>
          <Input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={onInputChange}
            className="w-full border border-gray-300 px-3 py-2 rounded-xs"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-emerald-700 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 cursor-pointer"
      >
        Next
      </Button>
    </>
  );
};

export default SignUpFormStep1;
