import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import {
  ResponseBody,
  RollingStatsResponse,
  YearStatsResponse,
} from "./response.type";

export function getYearStats(year: string) {
  return axios
    .get<ResponseBody<YearStatsResponse>>(ENDPOINTS.yearStats, {
      params: { year },
    })
    .then((res) => res.data);
}

export function getRollingStats(months: number = 6) {
  return axios
    .get<ResponseBody<RollingStatsResponse>>(ENDPOINTS.rollingStats, {
      params: { months: months.toString() },
    })
    .then((res) => res.data);
}
