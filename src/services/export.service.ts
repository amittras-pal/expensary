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

export function exportRange(params: RangeExportParams): Promise<Blob> {
  return axios
    .get(ENDPOINTS.exportRange, { params, responseType: "blob" })
    .then((res) => res.data);
}

export function exportPlan(params: PlanExportParams): Promise<Blob> {
  return axios
    .get(ENDPOINTS.exportPlan, { params, responseType: "blob" })
    .then((res) => res.data);
}
