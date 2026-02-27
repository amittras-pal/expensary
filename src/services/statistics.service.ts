import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import {
  ResponseBody,
  RollingStatsResponse,
} from "./response.type";

export function getRollingStats(months: number = 6) {
  return axios
    .get<ResponseBody<RollingStatsResponse>>(ENDPOINTS.rollingStats, {
      params: { months: months.toString() },
    })
    .then((res) => res.data);
}
