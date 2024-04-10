import { Box, PinInput as MPinInput, PinInputProps, Text } from "@mantine/core";

interface EnhancedPinProps extends PinInputProps {
  label: string;
  errorMsg: string;
}

export default function PinInput({
  label,
  error,
  required,
  errorMsg,
  ...props
}: Readonly<EnhancedPinProps>) {
  return (
    <Box mb="md">
      <Text fz="sm" fw={500} mb={2}>
        {label}{" "}
        {required ? (
          <Text component="span" c="red">
            *
          </Text>
        ) : (
          ""
        )}
      </Text>
      <MPinInput {...props} error={error} type="number" inputMode="numeric" />
      {errorMsg && (
        <Text fz="xs" c="red" mt={2}>
          {errorMsg}
        </Text>
      )}
    </Box>
  );
}
