import type { HealthResponse } from "@ai-ops-studio/shared";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl }),
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => "/health"
    })
  })
});

export const { useGetHealthQuery } = api;
