import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getChangelog(): Promise<ResponseBody<IReleaseResponse>> {
  return axios.get(ENDPOINTS.changelog).then((res) => res.data);
}

export function getContributor(params: {
  username: string;
}): Promise<ResponseBody<IContributorInfo>> {
  return axios.get(ENDPOINTS.contributor, { params }).then((res) => res.data);
}
