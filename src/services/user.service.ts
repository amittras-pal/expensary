import axios from "../config/axios";
import { LogoutScope } from "../constants/auth";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export type LoginResponse = ResponseBody<IUser> & {
  sessionMeta?: {
    activeAccountId: string;
    maxDeviceAccounts: number;
  };
};

export function loginUser(payload: { email: string; pin: string }) {
  return axios.post<LoginResponse>(ENDPOINTS.login, payload).then((res) => res.data);
}

export function switchActiveAccount(payload: { accountId: string }) {
  return axios
    .post<ResponseBody<IUser>>(ENDPOINTS.switchActiveAccount, payload)
    .then((res) => res.data);
}

export function registerUser(payload: Partial<IUser>) {
  return axios
    .post<ResponseBody<undefined>>(ENDPOINTS.register, payload)
    .then((res) => res.data);
}

export function getUserData() {
  return axios
    .get<ResponseBody<IUser>>(ENDPOINTS.userInfo)
    .then((res) => res.data);
}

export function updateUserDetails(payload: Partial<IUser>) {
  return axios
    .put<ResponseBody<IUser>>(ENDPOINTS.updateUser, payload)
    .then((res) => res.data);
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

export function logoutUser(scope: LogoutScope = "current") {
  return axios
    .post<ResponseBody<{ remainingAccountIds: string[] }>>(ENDPOINTS.logout, {
      scope,
    })
    .then((res) => res.data);
}
