import axios from "axios";
import { getBaseURL } from "../environment";

const instance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

export default instance;
