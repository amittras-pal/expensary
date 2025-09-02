import { Container } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { APP_TITLE } from "../../constants/app";
import AccountInfo from "./components/AccountInfo";
import ChangePassword from "./components/ChangePassword";
import DeleteAccount from "./components/DeleteAccount";
import PasskeyLogin from "./components/PasskeyLogin";
import Preferences from "./components/Preferences";

export default function User() {
  useDocumentTitle(`${APP_TITLE} | My Account`);

  return (
    <Container size="lg" px={0}>
      {/* Account Info Section */}
      <AccountInfo />

      {/* Preferences Section */}
      <Preferences />

      {/* Passwordless Login Section */}
      <PasskeyLogin />

      {/* Change Password Section */}
      <ChangePassword />

      {/* Delete Account Section */}
      <DeleteAccount />
    </Container>
  );
}
