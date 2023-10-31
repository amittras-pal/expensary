import React, { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { getAuthToken } from "../../utils";

export default function PublicGuard({ children }: PropsWithChildren) {
  return getAuthToken() ? <Navigate to={"/"} /> : children;
}
