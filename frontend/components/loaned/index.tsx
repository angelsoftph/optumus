"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { API_URL } from "@/lib/constants";
import { BookType } from "@/lib/types";
import { RootState } from "@/store";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/hooks/useAuthFetch";
import LoanHistoryBookComponent from "./book";

interface FetchBooksParams {
  offset: number;
}

interface FetchBooksResponse {
  history: BookType[];
  total: number;
}

const checkAuthToken = (): boolean => {
  const token = localStorage.getItem("optlib_auth_token");
  return !!token;
};

const LoanHistoryComponent: React.FC = () => {
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
      `${API_URL}/api/user-history?limit=${limit}&offset=${offset}&status=U`
    );

    if (!response || response.status === 401) {
      throw new Error("Token expired or unauthorized");
    }

    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }

    const data = await response.json();
    return {
      history: Array.isArray(data?.history) ? data.history : [],
      total: data?.total || 0,
    };
  };

  const { data, isLoading, isError, fetchNextPage, hasNextPage } =
    useInfiniteQuery<FetchBooksResponse, Error>({
      queryKey: ["history"],
      queryFn: ({ pageParam = 0 }) =>
        fetchBooks({ offset: pageParam as number }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const nextOffset = allPages.length * 10;
        return nextOffset < lastPage.total ? nextOffset : undefined;
      },
      enabled: !!user?.id,
    });

  const history = data?.pages.flatMap((page) => page.history) || [];

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
      {isLoading && (
        <p className="text-sm text-gray-500">Loading loan history...</p>
      )}
      {isError && (
        <p className="text-sm text-red-500">Error loading loan history.</p>
      )}

      <div className="flex flex-col gap-4">
        {history.map((book: BookType, index) => (
          <div key={index} className="w-full">
            <LoanHistoryBookComponent bookData={book} />
            {index === history.length - 1 && <div ref={observerRef} />}
          </div>
        ))}
      </div>
    </>
  );
};

export default LoanHistoryComponent;
