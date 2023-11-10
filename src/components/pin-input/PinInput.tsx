import { Box, PinInputProps, Text } from "@mantine/core";
import React from "react";
import { PinInput as MPinInput } from "@mantine/core";
import "./PinInput.scss";

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
}: EnhancedPinProps) {
  return (
    <Box mb="md" className={`pi-mod ${error ? "invalid" : ""}`}>
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
