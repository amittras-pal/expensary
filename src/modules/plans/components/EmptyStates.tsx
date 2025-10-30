import { Box, Button, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChecklist } from "@tabler/icons-react";
import ContainedLoader from "../../../components/loaders/ContainedLoader";
import ExpensePlanForm from "./ExpensePlanForm";

export function LoadingView() {
  return (
    <Box
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ContainedLoader size={150} />
    </Box>
  );
}

export function NoPlansView(
  props: Readonly<{
    showClosed: boolean;
    closedPlans: number;
    loadingClosedPlans: boolean;
    onShowClosedClick: () => void;
    refreshPlans: () => void;
  }>
) {
  const [showForm, formModal] = useDisclosure(false);
  return (
    <>
      <Box
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <IconChecklist size={80} />
        <Text my="sm" ta="center">
          No currently active plans.
        </Text>
        <Text size="sm" ta="center" c="dimmed" mb="sm">
          Plans help you organize expenses which need to be tracked outside of
          your general monthly budget.
        </Text>
        <Group gap="sm">
          <Button size="sm" mt="sm" onClick={formModal.open}>
            Create New Plan
          </Button>
          <Button
            size="sm"
            mt="sm"
            variant="subtle"
            loading={props.showClosed && props.loadingClosedPlans}
            disabled={props.showClosed && !props.closedPlans}
            onClick={props.onShowClosedClick}
          >
            Show Closed Plans
          </Button>
        </Group>
        {props.showClosed && !props.closedPlans && (
          <Text size="sm" ta="center" c="dimmed" mt="sm">
            You do not have any closed plans either.
          </Text>
        )}
      </Box>
      <Modal
        opened={showForm}
        withCloseButton={false}
        onClose={formModal.close}
      >
        {showForm && (
          <ExpensePlanForm
            data={null}
            onComplete={(e) => {
              if (e) props.refreshPlans();
              else formModal.close();
            }}
          />
        )}
      </Modal>
    </>
  );
}
