import { yupResolver } from "@hookform/resolvers/yup";
import {
  Accordion,
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  MultiSelect,
  ScrollArea,
  SimpleGrid,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { DatePickerInput, PickerBaseProps } from "@mantine/dates";
import { useDocumentTitle } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CategoryMultiSelectValue from "../../components/CategoryMultiSelectValue";
import CategorySelectItem from "../../components/CategorySelectItem";
import ExpenseCard from "../../components/ExpenseCard";
import ContainedLoader from "../../components/loaders/ContainedLoader";
import { APP_TITLE, _20Min } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { GlobalSearchForm, gSearchSchema } from "../../schemas/schemas";
import { getCategories } from "../../services/categories.service";
import { searchExpenses } from "../../services/expense.service";

interface CommonPickerProps extends PickerBaseProps<"range"> {
  minDate: Date;
  maxDate: Date;
}

export default function GlobalSearch2() {
  useDocumentTitle(`${APP_TITLE} | Search Expenses`);
  const isMobile = useMediaMatch();
  const { primaryColor } = useMantineTheme();

  const { onError } = useErrorHandler();
  const { userData } = useCurrentUser();

  const [filters, setFilters] = useState<ISearchReqBody>({});
  const [showFilter, setShowFilter] = useState<string | null>("show");

  const { data: categoryRes, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError,
    staleTime: _20Min,
  });

  const appliedFilter = useMemo(() => {
    let count = 0;
    if (filters.q) count++;
    if (filters.categories?.length) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  }, [filters]);

  const {
    data: expenses,
    mutate: search,
    isLoading,
    reset: clearResults,
  } = useMutation({
    mutationFn: searchExpenses,
    onError,
  });

  const pickerProps = useMemo(
    (): CommonPickerProps => ({
      type: "range",
      maxDate: dayjs().toDate(),
      minDate: userData
        ? dayjs(userData?.createdAt).toDate()
        : dayjs().toDate(),
    }),
    [userData]
  );

  const {
    watch,
    setValue,
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isValid },
  } = useForm<GlobalSearchForm>({
    defaultValues: {
      q: "",
      dateRange: [null, null],
      categories: [],
    },
    resolver: yupResolver(gSearchSchema),
  });

  const handleSearch: SubmitHandler<GlobalSearchForm> = (values) => {
    setShowFilter(null);
    const payload: ISearchReqBody = {};
    if (values.q) payload.q = values.q;
    if (values.categories?.length) payload.categories = values.categories;
    if (values.dateRange.every((v) => v !== null)) {
      payload.startDate = values.dateRange[0] ?? undefined;
      payload.endDate = values.dateRange[1] ?? undefined;
    }
    setFilters(payload);
    search(payload);
  };

  const handleClear = () => {
    setFilters({});
    clearResults();
    reset();
  };

  return (
    <Box>
      <Accordion
        variant="separated"
        value={showFilter}
        onChange={setShowFilter}
      >
        <Accordion.Item value="show">
          <Accordion.Control>
            Filters {appliedFilter > 0 ? `(${appliedFilter} applied)` : ""}
          </Accordion.Control>
          <Accordion.Panel>
            <Box
              component="form"
              onSubmit={handleSubmit(handleSearch)}
              onReset={handleClear}
            >
              <SimpleGrid cols={isMobile ? 1 : 3} gap="sm">
                <TextInput
                  mb={0}
                  rightSection={
                    <ClearField
                      onClick={() => setValue("q", "", { shouldDirty: true })}
                      disabled={!watch("q")?.length}
                    />
                  }
                  placeholder="Enter Title / Description"
                  {...register("q")}
                  autoFocus
                />
                <MultiSelect
                  searchable
                  mb={0}
                  disabled={loadingCategories}
                  value={watch("categories")}
                  disableSelectedItemFiltering
                  onChange={(e) =>
                    setValue("categories", e, { shouldDirty: true })
                  }
                  itemComponent={CategorySelectItem}
                  valueComponent={CategoryMultiSelectValue}
                  rightSection={
                    <ClearField
                      onClick={() =>
                        setValue("categories", [], { shouldDirty: true })
                      }
                      disabled={!watch("categories")?.length}
                    />
                  }
                  placeholder={
                    loadingCategories
                      ? "Loading Categories"
                      : "Select Categories"
                  }
                  data={
                    categoryRes?.response?.map((cat) => ({
                      ...cat,
                      value: cat._id ?? "",
                    })) ?? []
                  }
                />
                <DatePickerInput
                  {...pickerProps}
                  mb={0}
                  placeholder="Select Date Range"
                  defaultDate={watch("dateRange")[0] ?? new Date()}
                  onChange={(e) =>
                    setValue("dateRange", e, { shouldDirty: true })
                  }
                  value={[watch("dateRange")[0]!, watch("dateRange")[1]!]}
                  rightSection={
                    <ClearField
                      disabled={
                        !watch("dateRange")[0] || !watch("dateRange")[1]
                      }
                      onClick={() =>
                        setValue("dateRange", [null, null], {
                          shouldDirty: true,
                        })
                      }
                    />
                  }
                />
                <div></div>
                <div></div>
                <Group grow>
                  <Button type="reset" variant="outline">
                    Clear All
                  </Button>
                  <Button type="submit" disabled={!isDirty || !isValid}>
                    Search
                  </Button>
                </Group>
              </SimpleGrid>
            </Box>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Divider
        my="sm"
        color={primaryColor}
        labelPosition="center"
        label={
          <>
            {isLoading && (
              <>
                <ContainedLoader size={20} />
                <Text fz="sm" ml="xs">
                  Loading Expenses
                </Text>
              </>
            )}
            {expenses && (
              <Text fz="sm">{expenses?.response.length} Expenses Found</Text>
            )}
            {!expenses && !isLoading && (
              <Text fz="sm">Apply Filters Above</Text>
            )}
          </>
        }
      />
      <ScrollArea h="calc(100vh - 190px)" style={{ paddingBottom: "1px" }}>
        <SimpleGrid cols={isMobile ? 1 : 2} gap="xs">
          {expenses?.response.map((ex) => (
            <ExpenseCard
              hideMenu
              key={ex._id}
              data={ex}
              hideMonthIndicator
              highlight={filters.q ?? ""}
            />
          ))}
        </SimpleGrid>
      </ScrollArea>
    </Box>
  );
}

function ClearField(
  props: Readonly<{
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }>
) {
  if (props.disabled) return null;

  return (
    <ActionIcon size="sm" color="red" variant="light" onClick={props.onClick}>
      <IconX size={16} />
    </ActionIcon>
  );
}
