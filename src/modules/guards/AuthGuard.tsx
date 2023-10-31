import React, { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../../utils";

export default function AuthGuard({ children }: PropsWithChildren) {
  return getAuthToken() ? children : <Navigate to="/login" />;
}
