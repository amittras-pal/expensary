import { Box, PinInput as MPinInput, PinInputProps, Text } from "@mantine/core";

interface EnhancedPinProps extends PinInputProps {
  label: string;
  errorMsg: string;
  required?: boolean;
  onEnterDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function PinInput({
  label,
  error,
  required,
  errorMsg,
  onEnterDown,
  ...props
}: Readonly<EnhancedPinProps>) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") onEnterDown?.(event);
  };

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
      <MPinInput
        {...props}
        error={error}
        type="number"
        inputMode="numeric"
        onKeyDown={handleKeyDown}
      />
      {errorMsg && (
        <Text fz="xs" c="red" mt={2}>
          {errorMsg}
        </Text>
      )}
    </Box>
  );
}
