import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../../utils";

export default function AuthGuard({ children }: GuardProps) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}
