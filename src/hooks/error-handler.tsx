import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { isAxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/user.service";

export function useErrorHandler(func?: () => void) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onError = async (err: unknown) => {
    if (isAxiosError(err)) {
      if (err.response?.status === 401 && pathname !== "/login") {
        await logoutUser().then(() => {
          localStorage.clear();
          notifications.hide("invalid_session");
          notifications.show({
            id: "invalid_session",
            title: "Session Expired / Invalid Session",
            message: "Please login again to continue",
            color: "red",
            icon: <IconX />,
          });
          navigate("/login");
        });
      } else {
        notifications.show({
          message: err?.response?.data?.message,
          color: "red",
          icon: <IconX />,
        });
      }
    }
    func?.();
  };
  return { onError };
}
