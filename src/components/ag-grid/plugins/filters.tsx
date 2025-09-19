import { Box, Button, Checkbox, Group, ScrollArea, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IFilterParams } from "ag-grid-community";
import { IFilterReactComp } from "ag-grid-react";
import {
  Fragment,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { _20Min } from "../../../constants/app";
import { useErrorHandler } from "../../../hooks/error-handler";
import { getCategories } from "../../../services/categories.service";
import { useCategoryFilterStyles } from "../../../theme/modules/grid.styles";
import ContainedLoader from "../../loaders/ContainedLoader";
import { SubCategoryOption } from "../interfaces";

function Category(props: IFilterParams<IExpense>, ref: any) {
  const { classes } = useCategoryFilterStyles();
  const { onError } = useErrorHandler();
  const [selection, setSelection] = useState<string[]>([]);

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
    };
  });

  const cleanup = () => {
    props.api.destroyFilter("category._id");
    props.api.hidePopupMenu();
  };

  const apply = () => {
    props.filterChangedCallback();
    cleanup();
  };

  const clear = () => {
    props.api.destroyFilter("category.group");
    cleanup();
  };

  return (
    <Box className={classes.wrapper}>
      <Text fw="bold" mb="sm">
        Filter Categories
      </Text>
      <Checkbox.Group value={selection} onChange={setSelection}>
        <Group gap="xs" className={classes.selectionGroup}>
          {isLoading ? (
            <ContainedLoader size={150} />
          ) : (
            categoryOptions.map((opt) => (
              <Checkbox
                key={opt}
                label={opt}
                value={opt}
                style={{ cursor: "pointer" }}
              />
            ))
          )}
        </Group>
      </Checkbox.Group>
      <Group grow mt="sm" style={{ position: "sticky", bottom: 0 }}>
        <Button
          size="xs"
          variant="light"
          onClick={clear}
          disabled={!selection.length}
        >
          Clear
        </Button>
        <Button size="xs" onClick={apply} disabled={!selection.length}>
          Apply
        </Button>
      </Group>
    </Box>
  );
}

function SubCategory(props: IFilterParams<IExpense>, ref: any) {
  const [selection, setSelection] = useState<string[]>([]);
  const { classes } = useCategoryFilterStyles();
  const { onError } = useErrorHandler();

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
    };
  });

  const apply = () => {
    props.filterChangedCallback();
    props.api.hidePopupMenu();
  };

  const clear = () => {
    props.api.destroyFilter("category._id");
    props.api.hidePopupMenu();
  };

  return (
    <Box className={classes.wrapper}>
      <Text fw="bold" mb="sm">
        Filter Sub Categories
      </Text>
      <ScrollArea h={categoryOptions.length > 0 ? 200 : 75}>
        {categoryOptions.length > 0 ? (
          <Checkbox.Group value={selection} onChange={setSelection}>
            <Group gap="xs" className={classes.selectionGroup}>
              {isLoading ? (
                <ContainedLoader size={150} />
              ) : (
                categoryOptions.map((opt) => (
                  <Fragment key={opt.group}>
                    <Text fz="xs">{opt.group}</Text>
                    {opt.children.map((child) => (
                      <Checkbox
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
          <Text ta="center" color="dimmed">
            Please select one or more categories first to filter by
            subcategories.
          </Text>
        )}
      </ScrollArea>
      {categoryOptions.length > 0 && (
        <Group grow mt="sm" style={{ position: "sticky", bottom: 0 }}>
          <Button
            size="xs"
            variant="light"
            onClick={clear}
            disabled={!selection.length}
          >
            Clear
          </Button>
          <Button size="xs" onClick={apply} disabled={!selection.length}>
            Apply
          </Button>
        </Group>
      )}
    </Box>
  );
}

export const CategoryFilter = forwardRef<IFilterParams<IExpense>, any>(
  Category
);
export const SubCategoryFilter = forwardRef<IFilterParams<IExpense>, any>(
  SubCategory
);
