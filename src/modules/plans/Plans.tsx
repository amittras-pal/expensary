import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Switch,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useDocumentTitle, useHotkeys } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconChecklist, IconPlus, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ContainedLoader from "../../components/loaders/ContainedLoader";
import { APP_TITLE } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { getPlans, updatePlan } from "../../services/plans.service";
import DeletePlan from "./components/DeletePlan";
import ExpensePlan from "./components/ExpensePlan";
import ExpensePlanForm from "./components/ExpensePlanForm";

export default function Plans() {
  useDocumentTitle(`${APP_TITLE} | Vacations & Plans`);
  const { primaryColor } = useMantineTheme();
  const isMobile = useMediaMatch();
  const { onError } = useErrorHandler();

  const [showClosed, setShowClosed] = useState(
    () => sessionStorage.getItem("showClosedPlans") === "true"
  );
  const [targetPlan, setTargetPlan] = useState<IExpensePlan | null>(null);

  const { data: closedPlansRes, isLoading: loadingClosedPlans } = useQuery({
    queryKey: ["plans-list", false],
    queryFn: () => getPlans("false"),
    enabled: showClosed,
    refetchOnMount: false,
    onError,
  });

  const { data: openPlansRes, isLoading: loadingOpenPlans } = useQuery({
    queryKey: ["plans-list", true],
    queryFn: () => getPlans("true"),
    refetchOnMount: false,
    onError,
  });

  const [showForm, formModal] = useDisclosure(false);
  const [confirm, deleteModal] = useDisclosure(false);
  useHotkeys([["N", formModal.open]]);

  const client = useQueryClient();

  const refreshList = () => {
    client.invalidateQueries(["plans-list", true]);
    if (showClosed) client.invalidateQueries(["plans-list", false]);
  };

  const handleModalClose = (refreshData: IExpensePlan | boolean) => {
    if (showForm) formModal.close();
    if (confirm) deleteModal.close();

    if (refreshData) refreshList();

    setTimeout(() => {
      setTargetPlan(null);
    }, 1000);
  };

  const handleShowClosedToggle = (checked: boolean) => {
    setShowClosed(checked);
    sessionStorage.setItem("showClosedPlans", checked ? "true" : "false");
  };

  const { mutate: update } = useMutation({
    mutationFn: updatePlan,
    onSuccess: (res) => {
      notifications.show({
        message: res.message,
        color: "green",
        icon: <IconCheck />,
      });
      handleModalClose(true);
    },
    onError,
  });

  const handlePlanAction = (
    data: IExpensePlan,
    mode: "edit" | "delete" | "close"
  ) => {
    setTargetPlan(data);
    switch (mode) {
      case "edit":
        formModal.open();
        break;
      case "delete":
        deleteModal.open();
        break;
      case "close":
        modals.openConfirmModal({
          title: "Are you sure you want to close this expense plan?",
          closeOnCancel: true,
          withCloseButton: false,
          children: (
            <>
              <Text c="red">
                Once closed, no more expenses can be added to the plan and
                existing expenses cannot be modified.
              </Text>
              <Alert title="Copying Expense" color={primaryColor} p="sm" mt={6}>
                After closing the plan will be able to select and copy expenses
                from this plan into your monthly budget.
              </Alert>
            </>
          ),
          labels: {
            confirm: "Close",
            cancel: "Cancel",
          },
          confirmProps: {
            color: "red",
            leftSection: <IconX />,
          },
          onConfirm: () => {
            update({ ...data, open: false });
          },
        });
        break;
      default:
        break;
    }
  };

  if (loadingOpenPlans)
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

  if (
    !openPlansRes?.response.length ||
    (showClosed && !loadingClosedPlans && !closedPlansRes?.response.length)
  )
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
              loading={loadingClosedPlans}
              disabled={showClosed && !closedPlansRes?.response.length}
              onClick={() => setShowClosed(true)}
            >
              Show Closed Plans
            </Button>
          </Group>
          {showClosed && !closedPlansRes?.response.length && (
            <Text size="sm" ta="center" c="dimmed" mt="sm">
              You do not have any closed plans either.
            </Text>
          )}
        </Box>
        <Modal
          opened={showForm || confirm}
          withCloseButton={false}
          onClose={() => handleModalClose(false)}
        >
          {showForm && (
            <ExpensePlanForm data={targetPlan} onComplete={handleModalClose} />
          )}
          {confirm && (
            <DeletePlan data={targetPlan} onComplete={handleModalClose} />
          )}
        </Modal>
      </>
    );

  return (
    <>
      {(openPlansRes?.response?.length ?? 0) > 0 && (
        <>
          <Divider
            labelPosition="left"
            label={`Open Plans (${openPlansRes?.response.length ?? 0})`}
            mb="sm"
          />
          <SimpleGrid cols={isMobile ? 1 : 2} spacing="sm" mb="sm">
            {openPlansRes?.response.map((plan) => (
              <ExpensePlan
                hideMenu={false}
                data={plan}
                key={plan._id}
                onPlanAction={handlePlanAction}
              />
            ))}
          </SimpleGrid>
        </>
      )}
      <Divider
        labelPosition="left"
        label={
          <Switch
            size="sm"
            color={primaryColor}
            checked={showClosed}
            onChange={(e) => handleShowClosedToggle(e.currentTarget.checked)}
            label={
              showClosed
                ? `Closed plans (${closedPlansRes?.response.length ?? 0})`
                : "Show closed plans"
            }
          />
        }
      />
      {showClosed && loadingClosedPlans && (
        <Group justify="center" mb="sm" pt={"xl"}>
          <ContainedLoader size={40} />
          <Text size="sm" c="dimmed">
            Loading closed plans...
          </Text>
        </Group>
      )}

      {showClosed && (closedPlansRes?.response?.length ?? 0) > 0 && (
        <SimpleGrid cols={isMobile ? 1 : 2} spacing="sm" mt="sm">
          {closedPlansRes?.response?.map((plan) => (
            <ExpensePlan
              hideMenu={false}
              data={plan}
              key={plan._id}
              onPlanAction={handlePlanAction}
            />
          ))}
        </SimpleGrid>
      )}
      <Tooltip label="Create new Plan" position="left" color="dark">
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color={primaryColor}
          onClick={formModal.open}
          style={{ position: "fixed", bottom: "1rem", right: "1rem" }}
        >
          <IconPlus size={24} />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={showForm || confirm}
        withCloseButton={false}
        onClose={() => handleModalClose(false)}
      >
        {showForm && (
          <ExpensePlanForm data={targetPlan} onComplete={handleModalClose} />
        )}
        {confirm && (
          <DeletePlan data={targetPlan} onComplete={handleModalClose} />
        )}
      </Modal>
    </>
  );
}
