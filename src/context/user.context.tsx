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
import { useLocalStorage } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import OverlayLoader from "../components/loaders/OverlayLoader";
import { _20Min } from "../constants/app";
import { useErrorHandler } from "../hooks/error-handler";
import { getUserData } from "../services/user.service";
import { isLoggedIn } from "../utils";

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
    const listener = () => {
      setLoggedIn(Boolean(isLoggedIn()));
    };
    setLoggedIn(Boolean(isLoggedIn()));
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  const { isFetching: loadingUser } = useQuery({
    queryKey: ["user-info"],
    enabled: loggedIn,
    staleTime: _20Min,
    queryFn: getUserData,
    onError: onError,
    retry: 0,
    onSuccess: (res) => {
      setUserData(res.response);
      setPrimaryColor(res.response.color);
    },
  });

  const ctx: UserCtx = useMemo(() => ({ userData, setUserData }), [userData]);

  return (
    <UserContext.Provider value={ctx}>
      {loadingUser ? <OverlayLoader visible /> : children}
    </UserContext.Provider>
  );
}
