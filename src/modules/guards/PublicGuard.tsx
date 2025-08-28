import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../utils";

export default function PublicGuard({ children }: GuardProps) {
  return isLoggedIn() ? <Navigate to={"/"} /> : children;
}
