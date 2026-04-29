import { QueryClient, QueryCache } from "@tanstack/react-query";

async function fetchJson(url: string) {
  const res = await fetch(url, {
    credentials: "include",
  });

  if (!res.ok) {
    let message = res.statusText;

    try {
      const error = await res.json();
      message = error.message || message;
    } catch {
      // Keep the HTTP status text when the response is not JSON.
    }

    throw new Error(message);
  }

  return res.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5000,
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey;

        if (typeof url !== "string") {
          throw new Error("A string URL query key is required.");
        }

        return fetchJson(url);
      },
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("Query error:", error);
    },
  }),
});

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || res.statusText);
  }

  return res;
}
