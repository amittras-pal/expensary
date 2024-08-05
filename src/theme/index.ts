import { MantineThemeOverride } from "@mantine/core";
import { primaryColor } from "../constants/app";

const theme: MantineThemeOverride = {
  colorScheme: "dark",
  primaryColor,
  defaultRadius: "sm",
  fontFamily: "'Montserrat', sans-serif;",
  activeStyles: { transform: "scale(0.95)" },
  components: {
    TextInput: { defaultProps: { mb: "sm", variant: "filled" } },
    Textarea: { defaultProps: { mb: "sm", variant: "filled" } },
    Select: { defaultProps: { mb: "sm", variant: "filled" } },
    MultiSelect: { defaultProps: { mb: "sm", variant: "filled" } },
    DateTimePicker: { defaultProps: { mb: "sm", variant: "filled" } },
    DatePickerInput: { defaultProps: { mb: "sm", variant: "filled" } },
    PasswordInput: { defaultProps: { mb: "sm", variant: "filled" } },
    Button: { defaultProps: { loaderPosition: "right" } },
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
};

export default theme;
