"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-md space-y-4">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
          Oops! Something went wrong.
        </h2>
        <p className="text-gray-500 dark:text-gray-400">{error.message}</p>
        <a
          className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-6 text-sm font-medium text-gray-50 shadow transition-colors hover:cursor-pointer hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
          onClick={() => reset()}
        >
          Try again
        </a>
      </div>
    </div>
  );
}
