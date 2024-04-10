import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  ColorSwatch,
  Divider,
  Group,
  Text,
  TextInput,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useCurrentUser } from "../../context/user.context";
import { PreferenceForm, preferencesSchema } from "../../schemas/schemas";
import { updateUserDetails } from "../../services/user.service";

export default function Preferences() {
  const { userData } = useCurrentUser();
  const { primaryColor, colors } = useMantineTheme();

  const {
    formState: { errors, isValid, isDirty },
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<PreferenceForm>({
    defaultValues: { editWindow: 7, color: primaryColor },
    shouldFocusError: true,
    mode: "onChange",
    resolver: yupResolver(preferencesSchema),
  });

  useEffect(() => {
    setValue("editWindow", userData?.editWindow ?? 0);
    setValue("color", userData?.color ?? primaryColor);
  }, [primaryColor, setValue, userData]);

  const client = useQueryClient();
  const { mutate: updatePreferences, isLoading } = useMutation({
    mutationFn: updateUserDetails,
    onSuccess: (res) => {
      notifications.show({
        message: res?.message,
        color: "green",
        icon: <IconCheck />,
      });

      setTimeout(() => {
        client.invalidateQueries({ queryKey: ["user-info"] });
      }, 1000);
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((values) => {
        updatePreferences(values);
      })}
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.sm,
      })}
    >
      <Box>
        <Text fw="bold" fz="sm" mb="sm">
          Expense Editing Window
        </Text>
        <Text fz="sm" color="dimmed">
          The Edit Window determines how far behind the current date expenses
          can be added/edited in your record. This will impact the expense
          adding/editing window.
        </Text>
        <Divider my="sm" />
        <TextInput
          {...register("editWindow")}
          required
          label="Expense Edit Window"
          type="number"
          inputMode="numeric"
          description="Value is in days..."
          min={7}
          max={25}
          step={1}
          error={errors?.editWindow?.message}
        />
      </Box>
      <Divider color={primaryColor} />
      <Box>
        <Text fw="bold" fz="sm" mb="sm">
          Color Theme
        </Text>
        <Text fz="sm" color="dimmed" mb="md">
          Set the colors of action buttons and certain other aspects of the
          application to your preference.
        </Text>
        <Divider my="sm" />
        <Group position="center" spacing="xs">
          {Object.keys(colors).map((color) => (
            <Tooltip position="top" label={color} key={color}>
              <ColorSwatch
                color={colors[color][6]}
                component="button"
                sx={{ cursor: "pointer" }}
                type="button"
                onClick={() =>
                  setValue("color", color, {
                    shouldTouch: true,
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                {watch("color") === color && <IconCheck size={18} stroke={2} />}
              </ColorSwatch>
            </Tooltip>
          ))}
        </Group>
      </Box>
      <Group position="right">
        <Button
          type="submit"
          loading={isLoading}
          disabled={!isDirty || !isValid}
        >
          Save
        </Button>
      </Group>
    </Box>
  );
}
