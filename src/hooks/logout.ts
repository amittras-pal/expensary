import { useLocalStorage } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { primaryColor } from "../constants/app";

export const useLogoutHandler = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [, setPrimaryColor] = useLocalStorage({ key: "primary-color" });

  const logoutUser = () => {
    localStorage.clear();
    client.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
    setPrimaryColor(primaryColor);
  };

  return { logoutUser };
};
