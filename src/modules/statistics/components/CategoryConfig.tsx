import { Button, Checkbox, Divider, Popover } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import ReactECharts from "echarts-for-react";
import { ChangeEventHandler, Fragment, useState } from "react";
import { Selection } from "../types";

export default function CategoryConfig(
  props: Readonly<{ chart: ReactECharts | null }>
) {
  const [selection, setSelection] = useState<Selection>([]);

  const updateSelection = () => {
    const instance = props.chart?.getEchartsInstance();
    if (instance) {
      const { legend } = instance.getOption();

      const selection: Selection = Object.entries((legend as any)[0].selected);
      setSelection(selection);
    }
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const newSelection = Object.fromEntries(selection);
    newSelection[event.target.name] = event.target.checked;
    const instance = props.chart?.getEchartsInstance();
    if (instance) {
      instance.setOption({ legend: { selected: newSelection } });
      updateSelection();
    }
  };

  return (
    <Popover position="bottom-start" trapFocus onOpen={updateSelection}>
      <Popover.Target>
        <Button
          variant="default"
          size="xs"
          rightSection={<IconChevronDown size={14} />}
        >
          Categories
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        {selection.map(([label, checked], index) => (
          <Fragment key={label}>
            <Checkbox
              mb="xs"
              label={label}
              name={label}
              checked={checked}
              onChange={handleChange}
              disabled={index < 2}
            />
            {index === 1 && <Divider variant="dashed" my="xs" />}
          </Fragment>
        ))}
      </Popover.Dropdown>
    </Popover>
  );
}
