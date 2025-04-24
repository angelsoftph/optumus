"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserSignUpFormDataType } from "@/lib/types";
import { CircleHelp } from "lucide-react";

interface FormProps {
  formData: UserSignUpFormDataType;
  onBack: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isFormSubmitted: boolean;
}

const SignUpFormStep2: React.FC<FormProps> = ({
  formData,
  onBack,
  onInputChange,
  isFormSubmitted,
}) => {
  return (
    <>
      <div className="mb-4">
        <p className="text-sm">
          Now, let&apos;s create your profile! Your profile helps brands and
          other creators discover you inside the community!
        </p>
      </div>
      <div className="mb-4">
        <div className="flex flex-row items-center gap-2">
          <Label className="block mb-1">Profile Photo</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp
                  height={18}
                  width={18}
                  className="mb-1 cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  This will be your public profile image inside the community
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          onChange={onInputChange}
          className="w-full border border-gray-300 px-3 py-2 rounded-sm"
        />
        {formData.photo && (
          <div className="bg-black mt-3 px-3 py-2 rounded-sm">
            <p className="text-white text-sm">
              Selected file: {formData.photo.name}
            </p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex flex-row items-center gap-2">
          <Label className="block mb-1">Username</Label>{" "}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CircleHelp
                  height={18}
                  width={18}
                  className="mb-1 cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>This will be your URL</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          type="text"
          name="username"
          value={formData.username}
          onChange={onInputChange}
          className="w-full border border-gray-300 px-3 py-2 rounded-sm"
        />
      </div>

      <div className="flex flex-row gap-4">
        <div className="w-1/2">
          <Button
            type="button"
            onClick={onBack}
            className="w-full bg-gray-700 text-white py-2 px-4 rounded-sm hover:bg-gray-600 cursor-pointer"
          >
            Back
          </Button>
        </div>
        <div className="w-1/2">
          <Button
            disabled={isFormSubmitted}
            type="submit"
            className="w-full bg-emerald-700 text-white py-2 px-4 rounded-sm hover:bg-emerald-600 cursor-pointer"
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
};

export default SignUpFormStep2;
