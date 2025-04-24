"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { API_URL } from "@/lib/constants";
import Loading from "@/app/loading";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { BookFormDataType } from "@/lib/types";
import axiosWithAuth from "@/lib/axiosWithAuth";
import { useQueryClient } from "@tanstack/react-query";
import { AdminSidebar } from "../../sidebar";

export default function CreateBookForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<BookFormDataType>({
    title: "",
    author: "",
    content: "",
    category_id: 0,
    photo: null,
    status: "A",
  });
  const [showLoading, setShowLoading] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setShowLoading(true);
    setIsFormSubmitted(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("author", formData.author);
    data.append("content", formData.content);
    data.append("category_id", formData.category_id.toString());

    if (formData.photo) {
      data.append("photo", formData.photo);
    }

    try {
      const res = await axiosWithAuth.post(`${API_URL}/api/create-book`, data);

      setShowLoading(false);
      setIsFormSubmitted(false);

      setFormData({
        title: "",
        author: "",
        content: "",
        category_id: 0,
        photo: null,
        status: "A",
      });

      if (res) {
        toast("You have successfully created a new book.");
      }

      queryClient.invalidateQueries({ queryKey: ["books"] });
    } catch (error) {
      console.error("Creation error:", error);
      toast(
        "A problem was encountered while attempting to create a book. Please contact your developer."
      );
    }
  };

  return (
    <>
      <AdminSidebar />
      <main className="flex flex-col w-full h-screen">
        <SidebarTrigger className="text-black" />
        <div className="flex flex-col w-full h-screen gap-4 px-6 py-0 text-black">
          <h1 className="text-2xl font-semibold">Create Book</h1>
          <div className="flex flex-col w-full p-6 text-black">
            <Card>
              <CardHeader className="hidden">
                <CardTitle></CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent>
                <form encType="multipart/form-data" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-2 w-full xl:w-3/4">
                    <div className="flex flex-col w-full gap-1 mb-4">
                      <Label className="block mb-1">Title</Label>
                      <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full border border-gray-300 px-3 py-1 rounded-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col w-full gap-1 mb-4">
                      <Label className="block mb-1">Author</Label>
                      <Input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full border border-gray-300 px-3 py-1 rounded-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col w-full gap-1 mb-4">
                      <Label className="block mb-1">Content</Label>
                      <Textarea
                        name="content"
                        value={formData.content}
                        onChange={handleTextareaChange}
                        className="w-full border border-gray-300 px-3 py-1 rounded-xs"
                        required
                      />
                    </div>
                    <div className="flex flex-col w-full gap-1 mb-4">
                      <Label className="text-sm mb-1">
                        Category{" "}
                        <span className="text-red-500 font-semibold">*</span>
                      </Label>
                      <Select
                        name="category_id"
                        onValueChange={(value) =>
                          handleSelectChange("category_id", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Guides</SelectItem>
                          <SelectItem value="2">History</SelectItem>
                          <SelectItem value="3">Novels</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col w-full gap-1 mb-4">
                      <div className="flex flex-row items-center gap-2">
                        <Label className="block mb-1">Profile Photo</Label>
                      </div>
                      <Input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handleChange}
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

                    <Button
                      disabled={isFormSubmitted}
                      type="submit"
                      className="w-full bg-amber-950 text-white py-2 px-4 rounded-lg hover:bg-amber-900 cursor-pointer"
                    >
                      Create Book
                    </Button>
                  </div>
                </form>
              </CardContent>
              {showLoading && (
                <CardFooter className="flex flex-row items-center justify-center">
                  <Loading />
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
