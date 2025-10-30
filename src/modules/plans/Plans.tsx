import { Suspense, useState } from "react";
import { Group, Select, Switch, useMantineTheme } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import ContainedLoader from "../../components/loaders/ContainedLoader";
import { APP_TITLE } from "../../constants/app";

export default function Plans() {
  useDocumentTitle(`${APP_TITLE} | Vacations & Plans`);
  const { primaryColor } = useMantineTheme();
  const [showClosed, setShowClosed] = useState(
    () => sessionStorage.getItem("showClosedPlans") === "true"
  );

  const { pathname } = useLocation();
  const view = pathname.endsWith("plans") ? "list" : pathname.split("/").at(-1);
  const navigate = useNavigate();

  const handleShowClosedToggle = (checked: boolean) => {
    setShowClosed(checked);
    sessionStorage.setItem("showClosedPlans", checked ? "true" : "false");
  };

  return (
    <>
      <Group gap="sm" align="center" mb="sm">
        <Select
          mb={0}
          value={view}
          onChange={(val) => {
            navigate(val ?? "list");
          }}
          data={[
            { value: "list", label: "List" },
            { value: "timeline", label: "Timeline" },
          ]}
          w={160}
          size="xs"
        />
        <Switch
          size="sm"
          color={primaryColor}
          checked={showClosed}
          onChange={(e) => handleShowClosedToggle(e.currentTarget.checked)}
          label={showClosed ? "Showing All Plans" : "Closed Plans Hidden"}
        />
      </Group>
      <Suspense fallback={<ContainedLoader size={50} />}>
        <Outlet
          context={{
            showClosed,
            onShowClosedClick: () => handleShowClosedToggle(true),
          }}
        />
      </Suspense>
    </>
  );
}
