import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { MRes } from "./response.type";

export function getUserData(): Promise<MRes<IUser>> {
  return axios.get(ENDPOINTS.userInfo).then((res) => res.data);
}

export function updateUserDetails(
  payload: Partial<IUser>
): Promise<MRes<IUser>> {
  return axios.put(ENDPOINTS.updateUser, payload).then((res) => res.data);
}
