import { useMemo, useState } from "react";
import {
  Combobox,
  Pill,
  PillsInput,
  ThemeIcon,
  Tooltip,
  useCombobox,
  useMantineTheme,
} from "@mantine/core";
import { Icons } from "../../constants/categories";
import ClearField from "./ClearField";

type CategoryMultiSelectProps = {
  options: SelectOptionsGrouped;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
};

export default function CategoryMultiSelect(
  props: Readonly<CategoryMultiSelectProps>
) {
  const [search, setSearch] = useState("");

  const handleValueSelect = (val: string) => {
    const update = props.value.includes(val)
      ? props.value.filter((v) => v !== val)
      : [...props.value, val];
    props.onChange(update);
    setSearch("");
  };

  const handleValueRemove = (val: string) => {
    props.onChange(props.value.filter((v) => v !== val));
  };
  const flattenedOptions = useMemo(
    () => props.options.flatMap((gr) => gr.items),
    [props.options]
  );

  // Filter groups based on current search and exclude already selected values
  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    return props.options
      .map((group) => {
        const items = group.items.filter((item) => {
          if (props.value.includes(item.value)) return false;
          if (!query) return true;
          return item.label.toLowerCase().includes(query);
        });
        return { ...group, items };
      })
      .filter((g) => g.items.length > 0);
  }, [props.options, props.value, search]);

  const { colors } = useMantineTheme();

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
      <Combobox.DropdownTarget>
        <PillsInput
          onClick={() => combobox.openDropdown()}
          variant="filled"
          rightSection={
            <ClearField
              disabled={!props.value.length}
              onClick={() => props.onChange([])}
            />
          }
        >
          <Pill.Group>
            {props.value.map((item) => {
              const option = flattenedOptions.find((o) => o.value === item);
              const [icon, color] = option?.meta.split("::") ?? [];
              const Icon = Icons[icon];

              return (
                <Tooltip label={option?.label ?? ""} key={option?.value}>
                  <Pill
                    withRemoveButton
                    onRemove={() => handleValueRemove(item)}
                    style={{
                      border: "1px solid",
                      borderColor: colors[color][9],
                      backgroundColor: "transparent",
                    }}
                  >
                    <Icon
                      size={14}
                      style={{ marginBottom: -1, color: colors[color][5] }}
                    />
                  </Pill>
                </Tooltip>
              );
            })}
            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder={props.placeholder}
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Backspace" &&
                    search.length === 0 &&
                    props.value.length > 0
                  ) {
                    event.preventDefault();
                    handleValueRemove(props.value[props.value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
          {filteredGroups.length === 0 && (
            <Combobox.Empty>No matching categories</Combobox.Empty>
          )}
          {filteredGroups.map((group) => (
            <Combobox.Group key={group.group} label={group.group}>
              {group.items.map((item) => {
                const [icon, color] = item.meta.split("::");
                const Icon = Icons[icon];
                return (
                  <Combobox.Option
                    value={item.value}
                    key={item.value}
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    <ThemeIcon variant={"transparent"} color={color}>
                      <Icon size={16} />
                    </ThemeIcon>
                    {item.label}
                  </Combobox.Option>
                );
              })}
            </Combobox.Group>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
