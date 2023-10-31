import { useQuery } from "@tanstack/react-query";
import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { time20Min } from "../constants/app";

function getCategories() {
  return axios.get(ENDPOINTS.categories);
}

/** @param {import("@tanstack/react-query").UseQueryOptions} [options] */
export function useCategories(options) {
  return useQuery(["categories"], getCategories, {
    staleTime: time20Min,
    ...options,
  });
}
