import { Alert, Button, Paper, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconFingerprint, IconInfoCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initializePasskey } from "../../../services/passkey.service";
import { checkPasskeySupport } from "../utils/passkey";
import { startRegistration } from "@simplewebauthn/browser";

const PasskeyLogin = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPlatformAvailable, setIsPlatformAvailable] = useState<boolean | null>(null);

  const passkeyMutation = useMutation({
    mutationFn: initializePasskey,
    onSuccess: async (data) => {      
      // notifications.show({
      //   title: data.message,
      //   message: "Please follow the prompts on your device to complete passkey registration.",
      //   color: "green",
      // });
      // console.log("Passkey initialization successful:", data);
      const registrationJSON = await startRegistration({ optionsJSON: data.response });
      console.log(registrationJSON);
      
    },
    onError: (error: any) => {
      notifications.show({
        title: "Passkey Registration Failed",
        message: error?.response?.data?.message || "Failed to initialize passkey registration. Please try again.",
        color: "red",
      });
      console.error("Passkey registration failed:", error);
    },
  });

  useEffect(() => {
    const initializeSupport = async () => {
      const support = await checkPasskeySupport();
      setIsSupported(support.isSupported);
      setIsPlatformAvailable(support.isPlatformAvailable);
    };

    initializeSupport();
  }, []);

  const handleRegisterPasskey = () => {
    passkeyMutation.mutate();
  };

  if (isSupported === null || isPlatformAvailable === null) {
    return (
      <Paper withBorder p="md" radius="md" mb="lg">
        <Title order={4} mb="md">Passwordless Login</Title>
        <Text size="sm" color="dimmed">
          Checking passkey support...
        </Text>
      </Paper>
    );
  }

  if (!isSupported) {
    return (
      <Paper withBorder p="md" radius="md" mb="lg">
        <Title order={4} mb="md">Passwordless Login</Title>
        <Alert icon={<IconInfoCircle size="1rem" />} title="Passkey Not Supported" color="yellow">
          <Text size="sm">
            Your browser doesn't support passkeys (WebAuthn). Please use a modern browser like 
            Chrome, Firefox, Safari, or Edge to enable passwordless login.
          </Text>
        </Alert>
      </Paper>
    );
  }

  if (!isPlatformAvailable) {
    return (
      <Paper withBorder p="md" radius="md" mb="lg">
        <Title order={4} mb="md">Passwordless Login</Title>
        <Alert icon={<IconInfoCircle size="1rem" />} title="Platform Authenticator Not Available" color="orange">
          <Text size="sm">
            While your browser supports passkeys, your device doesn't have a platform authenticator 
            (like Touch ID, Face ID, Windows Hello, or fingerprint scanner) available. 
            You may still be able to use external security keys.
          </Text>
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md" mb="lg">
      <Title order={4} mb="md">Passwordless Login</Title>
      <Stack spacing="md">
        <Text size="sm" color="dimmed">
          Your device supports passwordless login with passkeys. You can register a passkey 
          to sign in securely without entering your password.
        </Text>
        
        <Button
          leftIcon={<IconFingerprint size="1rem" />}
          onClick={handleRegisterPasskey}
          loading={passkeyMutation.isLoading}
          variant="light"
          color="blue"
        >
          {passkeyMutation.isLoading ? "Registering Passkey..." : "Register Passkey"}
        </Button>
        
        <Text size="xs" color="dimmed">
          This will use your device's built-in security features like fingerprint, 
          face recognition, or PIN to authenticate you.
        </Text>
      </Stack>
    </Paper>
  );
};

export default PasskeyLogin;
