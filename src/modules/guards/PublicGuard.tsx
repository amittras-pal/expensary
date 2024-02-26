import { Navigate } from "react-router-dom";
import { getAuthToken } from "../../utils";

export default function PublicGuard({ children }: GuardProps) {
  return getAuthToken() ? <Navigate to={"/"} /> : children;
}
