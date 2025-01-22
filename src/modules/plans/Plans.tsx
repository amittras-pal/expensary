import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Divider,
  Modal,
  SimpleGrid,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useDocumentTitle, useHotkeys } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconChecklist, IconPlus, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import ContainedLoader from "../../components/loaders/ContainedLoader";
import { APP_TITLE } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import { getPlans, updatePlan } from "../../services/plans.service";
import DeletePlan from "./components/DeletePlan";
import ExpensePlan from "./components/ExpensePlan";
import ExpensePlanForm from "./components/ExpensePlanForm";

interface PlanSegregation {
  active: IExpensePlan[];
  closed: IExpensePlan[];
}

export default function Plans() {
  useDocumentTitle(`${APP_TITLE} | Vacations & Plans`);
  const { primaryColor } = useMantineTheme();
  const { onError } = useErrorHandler();
  const { data, isLoading } = useQuery({
    queryKey: ["plans-list", false],
    queryFn: () => getPlans("false"),
    refetchOnMount: false,
    onError,
  });

  const plansList: PlanSegregation = useMemo(() => {
    if (!data) return { active: [], closed: [] };
    const groups: PlanSegregation = { active: [], closed: [] };

    data?.response?.forEach((plan) => {
      if (plan.open) groups.active.push(plan);
      else groups.closed.push(plan);
    });
    return groups;
  }, [data]);

  const [showForm, formModal] = useDisclosure(false);
  const [confirm, deleteModal] = useDisclosure(false);
  useHotkeys([["N", formModal.open]]);

  const [targetPlan, setTargetPlan] = useState<IExpensePlan | null>(null);

  const client = useQueryClient();

  const handleModalClose = (refreshData: IExpensePlan | boolean) => {
    if (showForm) formModal.close();
    if (confirm) deleteModal.close();

    if (refreshData)
      client.invalidateQueries({ queryKey: ["plans-list", false] });

    setTimeout(() => {
      setTargetPlan(null);
    }, 1000);
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
              <Text color="red">
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
            leftIcon: <IconX />,
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

  if (isLoading)
    return (
      <Box
        sx={{
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

  if (!plansList.active.length && !plansList.closed.length)
    return (
      <>
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <IconChecklist size={80} />
          <Text my="sm" align="center">
            No plans have been created!
          </Text>
          <Text size="sm" align="center" color="dimmed" mb="sm">
            Plans help you organize expenses which need to be tracked outside of
            your general monthly budget.
          </Text>
          <Button
            size="sm"
            mt="sm"
            leftIcon={<IconPlus size={16} />}
            onClick={formModal.open}
          >
            Create a plan
          </Button>
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
      {plansList.active?.length > 0 && (
        <>
          <Divider
            labelPosition="center"
            labelProps={{ color: "dimmed" }}
            label={`Open Plans (${plansList.active.length})`}
            mb="sm"
            color={primaryColor}
          />
          <SimpleGrid
            cols={2}
            spacing="lg"
            mb="sm"
            breakpoints={[
              { maxWidth: "md", cols: 2, spacing: "sm", verticalSpacing: "sm" },
              { maxWidth: "sm", cols: 1, spacing: "sm", verticalSpacing: "sm" },
            ]}
          >
            {plansList.active?.map((plan) => (
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
      {plansList.closed?.length > 0 && (
        <>
          <Divider
            labelPosition="center"
            labelProps={{ color: "dimmed" }}
            label={`Closed Plans (${plansList.closed.length})`}
            mb="sm"
            color="red"
          />
          <SimpleGrid
            cols={2}
            spacing="lg"
            mb="sm"
            breakpoints={[
              { maxWidth: "md", cols: 2, spacing: "sm", verticalSpacing: "sm" },
              { maxWidth: "sm", cols: 1, spacing: "sm", verticalSpacing: "sm" },
            ]}
          >
            {plansList.closed?.map((plan) => (
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
      <Tooltip label="Create new Plan" position="left" color="dark">
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color={primaryColor}
          onClick={formModal.open}
          sx={{ position: "fixed", bottom: "1rem", right: "1rem" }}
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
