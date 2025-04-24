"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Note: Username cannot be edited. It can only be set during registration

const AccountBasicInfoPage = () => {
  return (
    <div className="flex flex-col">
      <Card className="mt-3">
        <CardHeader>
          <CardTitle className="flex flex-col">
            <h2 className="text-[18px] font-semibold">Basic Info</h2>
          </CardTitle>
        </CardHeader>
        <CardDescription className="hidden"></CardDescription>
        <CardContent>
          <div className="flex flex-col w-3/4 gap-4">
            <div className="flex flex-row gap-5">
              <div className="flex flex-col w-full gap-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input
                  type="text"
                  id="fullname"
                  name="fullname"
                  className="rounded-sm"
                  placeholder="Full Name"
                />
              </div>
            </div>
            <div className="flex flex-row gap-5">
              <div className="flex flex-col w-1/2 gap-2">
                <Label htmlFor="email">E-mail Address</Label>
                <Input
                  type="text"
                  id="email"
                  name="email"
                  className="rounded-sm"
                  placeholder="Email Address"
                />
              </div>
              <div className="flex flex-col w-1/2 gap-2">
                <Label htmlFor="email">Phone Number</Label>
                <Input
                  type="text"
                  id="phone"
                  name="phone"
                  className="rounded-sm"
                  placeholder="Phone Number"
                />
              </div>
            </div>
            <div className="flex flex-row gap-5">
              <div className="flex flex-col w-full gap-2">
                <Label htmlFor="email">Intro Text</Label>
                <Input
                  type="text"
                  id="intro"
                  name="intro"
                  className="rounded-sm"
                  placeholder="A short bio about yourself"
                />
              </div>
            </div>
            <div className="flex flex-row gap-5 justify-end">
              <Button className="bg-amber-950 hover:bg-amber-900 cursor-pointer text-white">
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountBasicInfoPage;
