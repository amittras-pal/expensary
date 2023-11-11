import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";

export function downloadReport(params: {
  startDate: Date;
  endDate: Date;
  includeList: boolean;
}): Promise<Blob> {
  return axios
    .get(ENDPOINTS.downloadReport, { params, responseType: "blob" })
    .then((res) => res.data);
}
