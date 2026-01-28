import {
  ChangeEventHandler,
  Fragment,
  MouseEventHandler,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActionIcon,
  Box,
  Button,
  Checkbox,
  Group,
  ScrollArea,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSelectAll, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { IFilterParams } from "ag-grid-community";
import { IFilterReactComp } from "ag-grid-react";
import { _20Min } from "../../../constants/app";
import { useErrorHandler } from "../../../hooks/error-handler";
import { getCategories } from "../../../services/categories.service";
import classes from "../../../theme/modules/grid.module.scss";
import ContainedLoader from "../../loaders/ContainedLoader";
import { SubCategoryOption } from "../interfaces";

function Category(props: IFilterParams<IExpense>, ref: any) {
  const { onError } = useErrorHandler();
  const checkbox = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const appliedSelection = useRef<string[]>([]);

  const { isLoading, data: catRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError,
    staleTime: _20Min,
  });

  const categoryOptions = useMemo(() => {
    const s = new Set<string>();
    const avCats = new Set<string>();
    props.api.forEachNode((node) => {
      avCats.add(node.data?.category?.group ?? "");
    });
    catRes?.response?.forEach((cat) => {
      if (avCats.has(cat.group)) s.add(cat.group);
    });
    return Array.from(s);
  }, [catRes?.response, props.api]);

  useImperativeHandle(ref, (): IFilterReactComp => {
    return {
      doesFilterPass(params) {
        return selection.length
          ? selection.includes(params.data.category.group)
          : true;
      },

      isFilterActive() {
        return selection.length > 0;
      },

      getModel() {
        return selection;
      },

      setModel(_model) {},

      afterGuiAttached() {
        checkbox.current?.focus();
      },

      afterGuiDetached() {
        setSelection(appliedSelection.current);
      }
    };
  });

  const cleanup = () => {
    props.api.destroyFilter("category._id");
    props.api.hidePopupMenu();
  };

  const apply = () => {
    appliedSelection.current = selection;
    props.filterChangedCallback();
    cleanup();
  };

  const clear = () => {
    appliedSelection.current = [];
    props.api.destroyFilter("category.group");
    cleanup();
  };

  const invertSelection = () => {
    setSelection((prev) =>
      categoryOptions.filter((opt) => !prev.includes(opt))
    );
  };

  return (
    <Box className={classes.wrapper}>
      <FilterHeader
        label="Filter Categories"
        disabled={!selection.length}
        onClick={invertSelection}
      />
      <Checkbox.Group value={selection} onChange={setSelection}>
        <Group gap="xs" className={classes.selectionGroup}>
          {isLoading ? (
            <ContainedLoader size={150} />
          ) : (
            categoryOptions.map((opt, i) => (
              <Checkbox
                ref={i === 0 ? checkbox : null}
                key={opt}
                label={opt}
                value={opt}
                style={{ cursor: "pointer" }}
              />
            ))
          )}
        </Group>
      </Checkbox.Group>
      <Group
        grow
        mt="sm"
        style={{ position: "sticky", bottom: 0, flexDirection: "row-reverse" }}
      >
        <Button size="xs" onClick={apply} disabled={!selection.length}>
          Apply
        </Button>
        <Button
          size="xs"
          variant="light"
          onClick={clear}
          disabled={!selection.length}
        >
          Clear
        </Button>
      </Group>
    </Box>
  );
}

function SubCategory(props: IFilterParams<IExpense>, ref: any) {
  const [selection, setSelection] = useState<string[]>([]);
  const { onError } = useErrorHandler();
  const checkbox = useRef<HTMLInputElement>(null);
  const appliedSelection = useRef<string[]>([]);

  const { isLoading, data: catRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError,
    staleTime: _20Min,
  });

  const categoryOptions: SubCategoryOption[] = useMemo(() => {
    const categoryInst = props.api.getFilterInstance("category.group");
    if (!categoryInst?.isFilterActive()) return [];

    const selectedGroups = categoryInst.getModel() as string[];
    const avCats = new Set<string>();

    props.api.forEachNode((node) => {
      if (node.data) avCats.add(node.data.category?._id ?? "");
    });

    const filtered = catRes?.response.filter(
      (cat) => selectedGroups.includes(cat.group) && avCats.has(cat._id ?? "")
    );

    return (
      filtered?.reduce((grouping: SubCategoryOption[], current) => {
        const gI = grouping.findIndex((g) => g.group === current.group);
        if (gI > -1) grouping[gI].children.push(current);
        else grouping.push({ group: current.group, children: [current] });

        return grouping;
      }, []) ?? []
    );
  }, [catRes?.response, props.api]);

  useImperativeHandle(ref, (): IFilterReactComp => {
    return {
      doesFilterPass(params) {
        return selection.length
          ? selection.includes(params.data.category._id)
          : true;
      },

      isFilterActive() {
        return selection.length > 0;
      },

      getModel() {
        return selection;
      },

      setModel(_model) {},

      afterGuiAttached() {
        checkbox.current?.focus();
      },

      afterGuiDetached() {
        setSelection(appliedSelection.current);
      }
    };
  });

  const apply = () => {
    appliedSelection.current = selection;
    props.filterChangedCallback();
    props.api.hidePopupMenu();
  };

  const clear = () => {
    appliedSelection.current = [];
    props.api.destroyFilter("category._id");
    props.api.hidePopupMenu();
  };

  const invertSelection = () => {
    const items = categoryOptions.flatMap((grp) =>
      grp.children.map((v) => v._id ?? "")
    );
    setSelection((prev) => items.filter((opt) => !prev.includes(opt)));
  };

  return (
    <Box className={classes.wrapper}>
      <FilterHeader
        label="Filter Sub Categories"
        disabled={!selection.length}
        onClick={invertSelection}
      />
      <ScrollArea h={categoryOptions.length > 0 ? 200 : 75}>
        {categoryOptions.length > 0 ? (
          <Checkbox.Group value={selection} onChange={setSelection}>
            <Group gap="xs" className={classes.selectionGroup}>
              {isLoading ? (
                <ContainedLoader size={150} />
              ) : (
                categoryOptions.map((opt, i) => (
                  <Fragment key={opt.group}>
                    <Text fz="xs">{opt.group}</Text>
                    {opt.children.map((child, j) => (
                      <Checkbox
                        ref={i === 0 && j === 0 ? checkbox : null}
                        key={child._id}
                        label={child.label}
                        value={child._id}
                        ml="sm"
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Fragment>
                ))
              )}
            </Group>
          </Checkbox.Group>
        ) : (
          <Text ta="center" c="dimmed" fz="sm">
            Please select one or more categories first to filter by
            subcategories.
          </Text>
        )}
      </ScrollArea>
      {categoryOptions.length > 0 && (
        <Group
          grow
          mt="sm"
          style={{
            position: "sticky",
            bottom: 0,
            flexDirection: "row-reverse",
          }}
        >
          <Button size="xs" onClick={apply} disabled={!selection.length}>
            Apply
          </Button>
          <Button
            size="xs"
            variant="light"
            onClick={clear}
            disabled={!selection.length}
          >
            Clear
          </Button>
        </Group>
      )}
    </Box>
  );
}

function Title(props: IFilterParams<IExpense>, ref: any) {
  const [query, setQuery] = useState<string>("");
  const input = useRef<HTMLInputElement>(null);
  const appliedQuery = useRef<string>("");

  useImperativeHandle(ref, (): IFilterReactComp => {
    return {
      doesFilterPass(params) {
        console.log(query.length);
        return query.length
          ? params.data.title.toLowerCase().includes(query.toLowerCase())
          : true;
      },

      isFilterActive() {
        return query.length > 0;
      },

      getModel() {
        return query;
      },

      setModel(_model) {},
      afterGuiAttached() {
        input.current?.focus();
      },

      afterGuiDetached() {
        setQuery(appliedQuery.current);
      }
    };
  });

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const value = e.target.value;
    setQuery(value);
    appliedQuery.current = value;
    setTimeout(() => {
      props.filterChangedCallback();
    }, 0);
  };

  const handleClear = () => {
    setQuery("");
    appliedQuery.current = "";
    setTimeout(() => {
      props.filterChangedCallback();
    }, 0);
  };

  return (
    <Box className={classes.wrapper}>
      <TextInput
        variant="default"
        mb={0}
        ref={input}
        rightSection={
          <ActionIcon
            size="sm"
            variant="light"
            color="red"
            disabled={!query.length}
            onClick={handleClear}
          >
            <IconX size={18} />
          </ActionIcon>
        }
        label="Filter by Expense Title"
        placeholder="Enter Title"
        value={query}
        autoFocus
        onChange={handleChange}
      />
    </Box>
  );
}

const FilterHeader = (
  props: Readonly<{
    label: string;
    onClick: MouseEventHandler;
    disabled: boolean;
  }>
) => {
  return (
    <Group justify="space-between" mb="sm">
      <Text fw="bold" fz="sm">
        {props.label}
      </Text>
      <ActionIcon
        disabled={props.disabled}
        onClick={props.onClick}
        color="light"
        variant="subtle"
      >
        <IconSelectAll size={18} />
      </ActionIcon>
    </Group>
  );
};

export const CategoryFilter = forwardRef<any, IFilterParams<IExpense>>(
  Category
);
export const SubCategoryFilter = forwardRef<any, IFilterParams<IExpense>>(
  SubCategory
);
export const TitleFilter = forwardRef<any, IFilterParams<IExpense>>(Title);
