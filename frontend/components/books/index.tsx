"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { API_URL } from "@/lib/constants";
import { BookType } from "@/lib/types";
import { RootState } from "@/store";
import BookComponent from "./book";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/hooks/useAuthFetch";

interface FetchBooksParams {
  offset: number;
}

interface FetchBooksResponse {
  books: BookType[];
  total: number;
}

const checkAuthToken = (): boolean => {
  const token = localStorage.getItem("optlib_auth_token");
  return !!token;
};

const BooksComponent: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!checkAuthToken()) {
      router.push("/login");
    }
  }, [router]);

  const fetchBooks = async ({
    offset,
  }: FetchBooksParams): Promise<FetchBooksResponse> => {
    const limit = 10;

    const response = await fetchWithAuth(
      `${API_URL}/api/show-books?limit=${limit}&offset=${offset}`
    );

    if (!response || response.status === 401) {
      throw new Error("Token expired or unauthorized");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    const data = await response.json();
    return {
      books: Array.isArray(data?.books) ? data.books : [],
      total: data?.total || 0,
    };
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useInfiniteQuery<FetchBooksResponse, Error>({
      queryKey: ["books"],
      queryFn: ({ pageParam = 0 }) =>
        fetchBooks({ offset: pageParam as number }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const nextOffset = allPages.length * 10;
        return nextOffset < lastPage.total ? nextOffset : undefined;
      },
      enabled: !!user?.id,
    });

  const books = data?.pages.flatMap((page) => page.books) || [];

  useEffect(() => {
    const target = observerRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [fetchNextPage, hasNextPage]);

  return (
    <>
      {isLoading && <p className="text-sm text-gray-500">Loading books...</p>}
      {isError && <p className="text-sm text-red-500">Error loading books.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 xl-grid-cols-4 gap-4">
        {books.map((book: BookType, index) => (
          <div key={index} className="mb-3">
            <BookComponent bookData={book} />
            {index === books.length - 1 && <div ref={observerRef} />}
          </div>
        ))}
      </div>
    </>
  );
};

export default BooksComponent;
