import React from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../../utils";

export default function AuthGuard({ children }: GuardProps) {
  return getAuthToken() ? children! : <Navigate to="/login" />;
}
