import { Box, Container, Divider, Text, useMantineTheme } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { Link } from "react-router-dom";
import AppInfo from "../../components/app-info/AppInfo";
import { APP_TITLE } from "../../constants/app";
import classes from "../../theme/modules/auth.module.scss";
import PublicGuard from "../guards/PublicGuard";

export default function RegistrationHold() {
  const { primaryColor } = useMantineTheme();

  useDocumentTitle(`${APP_TITLE} | Register`);

  return (
    <PublicGuard>
      <Box className={classes.wrapper}>
        <Container
          size="lg"
          className={classes.paper}
          style={{ maxWidth: 560, textAlign: "center" }}
        >
          <Text fz="lg" fw="bold" mb="sm">
            Creating Accounts is Suspended.
          </Text>
          <Divider mb="sm" />
          <Text fs="italic">
            Due to certain technical issues, we are suspending creating new
            accounts in {APP_TITLE} for an indefinite period of time.{" "}
          </Text>
          <Text fs="italic" mt="sm">
            If you'd still like to create an account and use the application for
            your personal use, please contact the developer at the given contact
            information available at the{" "}
            <Text component={Link} to="/about" c={primaryColor} td="underline">
              about page
            </Text>
          </Text>
          <Text ta="center" c={primaryColor} td="underline" mt="lg">
            <Text component={Link} to="/login">
              Login to existing account.
            </Text>
          </Text>
        </Container>
        <AppInfo mt="auto" type="text" />
      </Box>
    </PublicGuard>
  );
}
