import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";

type RangeExportParams = {
  startDate: Date;
  endDate: Date;
  includeList: boolean;
};

type PlanExportParams = {
  plan: string;
};

export function exportRange(params: RangeExportParams) {
  return axios
    .get<Blob>(ENDPOINTS.exportRange, { params, responseType: "blob" })
    .then((res) => res.data);
}

export function exportPlan(params: PlanExportParams) {
  return axios
    .get<Blob>(ENDPOINTS.exportPlan, { params, responseType: "blob" })
    .then((res) => res.data);
}
