// TODO: Implementation here!!

import React from "react";
import { useCurrentUser } from "../../context/user.context";

export default function User() {
  const { userData } = useCurrentUser();
  return <pre>{JSON.stringify(userData, null, 2)}</pre>;
}
