import { useLocalStorage } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { primaryColor } from "../constants/app";
import { logoutUser } from "../services/user.service";

export const useLogoutHandler = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [, setPrimaryColor] = useLocalStorage({ key: "primary-color" });

  const { mutate: logout, isLoading: loggingOut } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      localStorage.clear();
      client.clear();
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
      setPrimaryColor(primaryColor);
    },
  });

  return { logout, loggingOut };
};
