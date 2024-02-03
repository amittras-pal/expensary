import { LoadingOverlay } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { time20Min } from "../constants/app";
import { useErrorHandler } from "../hooks/error-handler";
import { getUserData } from "../services/user.service";
import { getAuthToken } from "../utils";

type UserCtx = {
  userData: IUser | null;
  budget: number | null;
  setUserData: React.Dispatch<React.SetStateAction<IUser | null>>;
  setBudget: React.Dispatch<React.SetStateAction<number | null>>;
};

const UserContext = React.createContext<UserCtx>({
  userData: null,
  setUserData: () => null,
  budget: null,
  setBudget: () => null,
});

export const useCurrentUser = () => React.useContext(UserContext);

export default function UserProvider({ children }: PropsWithChildren) {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const { onError } = useErrorHandler();

  useEffect(() => {
    const listener = () => {
      setLoggedIn(Boolean(getAuthToken()));
    };
    setLoggedIn(Boolean(getAuthToken()));
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  const { isLoading: loadingUser } = useQuery({
    queryKey: ["user-info"],
    enabled: loggedIn,
    staleTime: time20Min,
    refetchOnWindowFocus: false,
    queryFn: getUserData,
    onError: onError,
    onSuccess: (res) => {
      setUserData(res.response);
    },
  });

  if (loadingUser) return <LoadingOverlay visible overlayBlur={5} />;

  return (
    <UserContext.Provider value={{ userData, setUserData, budget, setBudget }}>
      {children}
    </UserContext.Provider>
  );
}
