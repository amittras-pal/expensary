import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function loginUser(payload: {
  email: string;
  pin: string;
}) {
  return axios.post<ResponseBody<IUser>>(ENDPOINTS.login, payload).then((res) => res.data);
}

export function registerUser(
  payload: Partial<IUser>
) {
  return axios.post<ResponseBody<undefined>>(ENDPOINTS.register, payload).then((res) => res.data);
}

export function getUserData() {
  return axios.get<ResponseBody<IUser>>(ENDPOINTS.userInfo).then((res) => res.data);
}

export function updateUserDetails(
  payload: Partial<IUser>
) {
  return axios.put<ResponseBody<IUser>>(ENDPOINTS.updateUser, payload).then((res) => res.data);
}

export function changeUserPassword(payload: {
  email: string;
  currentPin: number;
  newPin: number;
  confirmNewPin: number;
}) {
  return axios
    .post<ResponseBody<undefined>>(ENDPOINTS.changePassword, payload)
    .then((res) => res.data);
}

export function logoutUser() {
  return axios.post<ResponseBody<undefined>>(ENDPOINTS.logout);
}
