import { ActionIcon, Button, Group } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function StepNavigation(
  props: Readonly<{
    step: number;
    changeStep: (dir: number) => void;
    nextEnabled?: boolean;
    loading?: boolean;
  }>
) {
  return (
    <Group position="apart" mt="auto">
      {props.step === 0 && (
        <>
          <Button component={Link} to="/login">
            Back to Login
          </Button>
          <ActionIcon
            variant="default"
            radius="lg"
            size="lg"
            ml="auto"
            data-dir="1"
            onClick={() => props.changeStep(1)}
            disabled={!props.nextEnabled}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </>
      )}

      {props.step === 1 && (
        <>
          <ActionIcon
            variant="default"
            radius="lg"
            size="lg"
            data-dir="-1"
            onClick={() => props.changeStep(-1)}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <ActionIcon
            variant="default"
            radius="lg"
            size="lg"
            ml="auto"
            data-dir="1"
            onClick={() => props.changeStep(1)}
            disabled={!props.nextEnabled}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </>
      )}

      {props.step === 2 && (
        <>
          <ActionIcon
            variant="default"
            radius="lg"
            size="lg"
            data-dir="-1"
            onClick={() => props.changeStep(-1)}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Button type="submit" loading={props.loading}>
            Create Account
          </Button>
        </>
      )}
    </Group>
  );
}
