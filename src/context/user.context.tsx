import { useLocalStorage } from "@mantine/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import OverlayLoader from "../components/loaders/OverlayLoader";
import { time20Min } from "../constants/app";
import { useErrorHandler } from "../hooks/error-handler";
import { getUserData, updateUserDetails } from "../services/user.service";
import { getAuthToken } from "../utils";

type UserCtx = {
  userData: IUser | null;
  setUserData: Dispatch<SetStateAction<IUser | null>>;
};

const UserContext = createContext<UserCtx>({
  userData: null,
  setUserData: () => null,
});

export const useCurrentUser = () => useContext(UserContext);

export default function UserProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const { onError } = useErrorHandler();

  const [, setPrimaryColor] = useLocalStorage({ key: "primary-color" });

  useEffect(() => {
    const listener = () => setLoggedIn(Boolean(getAuthToken()));

    setLoggedIn(Boolean(getAuthToken()));
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  const { mutate: logSession } = useMutation({
    mutationFn: updateUserDetails,
    onError,
    onSuccess: (res) => {
      setUserData(res.response);
      sessionStorage.setItem("sessionTracked", "1");
    },
  });

  const { isFetching: loadingUser } = useQuery({
    queryKey: ["user-info"],
    enabled: loggedIn,
    staleTime: time20Min,
    refetchOnWindowFocus: false,
    queryFn: getUserData,
    onError: onError,
    retry: 0,
    onSuccess: (res) => {
      setUserData(res.response);
      setPrimaryColor(res.response.color);
      if (!sessionStorage.getItem("sessionTracked"))
        logSession({ lastActive: dayjs().toISOString() });
    },
  });

  const ctx: UserCtx = useMemo(() => ({ userData, setUserData }), [userData]);

  return (
    <UserContext.Provider value={ctx}>
      {loadingUser ? <OverlayLoader visible /> : children}
    </UserContext.Provider>
  );
}
