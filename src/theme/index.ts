import { createTheme } from "@mantine/core";
import { primaryColor } from "../constants/app";

const theme = createTheme({
  primaryColor,
  defaultRadius: "sm",
  fontFamily: "'Poppins', sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  components: {
    TextInput: { defaultProps: { mb: "sm", variant: "filled" } },
    Textarea: { defaultProps: { mb: "sm", variant: "filled" } },
    Select: { defaultProps: { mb: "sm", variant: "filled" } },
    MultiSelect: { defaultProps: { mb: "sm", variant: "filled" } },
    DateTimePicker: { defaultProps: { mb: "sm", variant: "filled" } },
    DatePickerInput: { defaultProps: { mb: "sm", variant: "filled" } },
    PasswordInput: { defaultProps: { mb: "sm", variant: "filled" } },
    Divider: { defaultProps: { variant: "dashed" } },
    ScrollArea: { defaultProps: { scrollbarSize: 6 } },
    Tooltip: {
      defaultProps: { events: { hover: true, touch: true, focus: true } },
    },
    Modal: {
      defaultProps: {
        centered: true,
        lockScroll: true,
        withOverlay: true,
        overlayProps: { blur: 6 },
      },
    },
  },
});

export default theme;
