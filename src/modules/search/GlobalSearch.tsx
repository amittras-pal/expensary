import {
  ActionIcon,
  Group,
  Loader,
  Modal,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { Suspense, lazy, useRef } from "react";
import { useMediaMatch } from "../../hooks/media-match";
import "./GlobalSearch.scss";

const FormAndResults = lazy(() => import("./FormAndResults"));

export default function GlobalSearchNew() {
  const theme = useMantineTheme();
  const button = useRef<HTMLButtonElement>(null);
  const [showSearch, searchForm] = useDisclosure(false);
  useHotkeys([["ctrl+k", searchForm.open]]);
  const isMobile = useMediaMatch();

  return (
    <>
      <Tooltip label="Search Expenses" position="bottom" withArrow color="dark">
        <ActionIcon
          ref={button}
          size="md"
          variant="default"
          radius="lg"
          color={theme.primaryColor}
          onClick={searchForm.open}
        >
          <IconSearch size={16} />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={showSearch}
        centered={false}
        title="Search Expenses"
        withCloseButton
        onClose={searchForm.close}
        closeOnClickOutside={false}
        size={isMobile ? "xl" : "80%"}
      >
        <Suspense
          fallback={
            <Group position="center">
              <Loader />
            </Group>
          }
        >
          <FormAndResults />
        </Suspense>
      </Modal>
    </>
  );
}
