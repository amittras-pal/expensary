import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getChangelog() {
  return axios
    .get<ResponseBody<IReleaseResponse>>(ENDPOINTS.changelog)
    .then((res) => res.data);
}

export function getContributor(params: { username: string }) {
  return axios
    .get<ResponseBody<IContributorInfo>>(ENDPOINTS.contributor, { params })
    .then((res) => res.data);
}

export function getAboutFile(): Promise<string> {
  return fetch("/about.md").then((res) => res.text());
}
