"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountBasicInfoPage from "./basic/page";

const AccountPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex flex-row h-screen">
        <div className="flex flex-col w-1/5 bg-gray-100 gap-4 p-4"></div>
        <div className="flex flex-col w-3/5 bg-gray-100 gap-4 p-4">
          <h1 className="text-2xl font-semibold">Account Details</h1>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="flex flex-row gap-1 w-full p-1 rounded-xs bg-gray-500 text-white">
              <TabsTrigger value="basic" className="p-4 rounded-xs">
                Basic Info
              </TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <AccountBasicInfoPage />
            </TabsContent>
          </Tabs>
        </div>
        <div className="flex flex-col w-1/5 bg-gray-100 gap-4 p-4"></div>
      </main>
    </div>
  );
};

export default AccountPage;
