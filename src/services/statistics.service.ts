import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody, YearStatsResponse } from "./response.type";

export function getYearStats(year: string) {
  return axios
    .get<ResponseBody<YearStatsResponse>>(ENDPOINTS.yearStats, {
      params: { year },
    })
    .then((res) => res.data);
}
