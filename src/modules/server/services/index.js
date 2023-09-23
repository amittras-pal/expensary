import axios from "../../../config/axios";
import { ENDPOINTS } from "../../../constants/endpoints";
import { useQuery } from "@tanstack/react-query";

function pingServer() {
  return axios.get(ENDPOINTS.ping);
}

export function useServerPing(options) {
  return useQuery(["wake"], pingServer, options);
}
