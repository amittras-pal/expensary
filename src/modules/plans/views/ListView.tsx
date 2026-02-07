import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPlus, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import ContainedLoader from "../../../components/loaders/ContainedLoader";
import { _20Min } from "../../../constants/app";
import { useErrorHandler } from "../../../hooks/error-handler";
import { useMediaMatch } from "../../../hooks/media-match";
import {
  IExpensePlanAggregate,
  getPlans,
  updatePlan,
} from "../../../services/plans.service";
import DeletePlan from "../components/DeletePlan";
import { LoadingView, NoPlansView } from "../components/EmptyStates";
import ExpensePlan from "../components/ExpensePlan";
import ExpensePlanForm from "../components/ExpensePlanForm";
import { PlansViewContext } from "../types";

export default function ListView() {
  const props = useOutletContext<PlansViewContext>();

  const { primaryColor } = useMantineTheme();
  const isMobile = useMediaMatch();
  const { onError } = useErrorHandler();

  const [targetPlan, setTargetPlan] = useState<IExpensePlan | null>(null);

  const { data: closedPlansRes, isLoading: loadingClosedPlans } = useQuery({
    queryKey: ["plans-list", false],
    queryFn: () => getPlans("false"),
    enabled: props.showClosed,
    refetchOnMount: true,
    staleTime: _20Min,
    onError,
  });

  const { data: openPlansRes, isLoading: loadingOpenPlans } = useQuery({
    queryKey: ["plans-list", true],
    queryFn: () => getPlans("true"),
    refetchOnMount: true,
    staleTime: _20Min,
    onError,
  });

  const [showForm, formModal] = useDisclosure(false);
  const [confirm, deleteModal] = useDisclosure(false);
  useHotkeys([["N", formModal.open]]);

  const client = useQueryClient();

  const refreshList = () => {
    client.invalidateQueries(["plans-list", true]);
    if (props.showClosed) client.invalidateQueries(["plans-list", false]);
  };

  const handleModalClose = (refreshData: IExpensePlan | boolean) => {
    if (showForm) formModal.close();
    if (confirm) deleteModal.close();

    if (refreshData) refreshList();

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
    data: IExpensePlanAggregate,
    mode: "edit" | "delete" | "close"
  ) => {
    const planData: IExpensePlan = {
      _id: data._id,
      name: data.name,
      description: data.description,
      user: data.user,
      open: data.open,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      lastAction: data.lastAction,
      executionRange: data.executionRange,
    };
    setTargetPlan(planData);
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

  if (loadingOpenPlans) return <LoadingView />;

  if (
    (!openPlansRes?.response.length && !props.showClosed) ||
    (props.showClosed && !closedPlansRes?.response.length)
  )
    return (
      <NoPlansView
        loadingClosedPlans={loadingClosedPlans}
        onShowClosedClick={props.onShowClosedClick}
        closedPlans={closedPlansRes?.response.length ?? 0}
        showClosed={props.showClosed}
        refreshPlans={refreshList}
      />
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

      {props.showClosed && loadingClosedPlans && (
        <Group justify="center" mb="sm" pt={"xl"}>
          <ContainedLoader size={40} />
          <Text size="sm" c="dimmed">
            Loading closed plans...
          </Text>
        </Group>
      )}

      {props.showClosed && (closedPlansRes?.response?.length ?? 0) > 0 && (
        <>
          <Divider
            labelPosition="left"
            label={`Closed plans (${closedPlansRes?.response.length ?? 0})`}
          />
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
        </>
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
