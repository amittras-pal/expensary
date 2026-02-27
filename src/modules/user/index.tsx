import { Container, Paper, Title } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { APP_TITLE } from "../../constants/app";
import classes from "../../theme/modules/account.module.scss";
import AccountInfo from "./AccountInfo";
import ChangePassword from "./ChangePassword";
import Preferences from "./Preferences";
import RecurringExpenses from "./RecurringExpenses";

export default function User() {
  useDocumentTitle(`${APP_TITLE} | My Account`);

  return (
    <Container
      size={"lg"}
      px={0}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <Paper className={classes.tile}>
        <Title order={4} mb="xs">
          Account Info
        </Title>
        <AccountInfo />
      </Paper>
      <Paper className={classes.tile}>
        <Title order={3} mb="xs">
          Preferences
        </Title>
        <Preferences />
      </Paper>
      <Paper className={classes.tile}>
        <Title order={3} mb="xs">
          Recurring Expenses
        </Title>
        <RecurringExpenses />
      </Paper>
      <Paper className={classes.tile}>
        <Title order={3} mb="xs">
          Change Pin
        </Title>
        <ChangePassword />
      </Paper>
    </Container>
  );
}
