import { Alert, Button, Paper, Stack, Text, Title } from "@mantine/core";
import { IconFingerprint, IconInfoCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { checkPasskeySupport } from "../utils/passkey";

const PasskeyLogin = () => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isPlatformAvailable, setIsPlatformAvailable] = useState<boolean | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const initializeSupport = async () => {
      const support = await checkPasskeySupport();
      setIsSupported(support.isSupported);
      setIsPlatformAvailable(support.isPlatformAvailable);
    };

    initializeSupport();
  }, []);

  const handleRegisterPasskey = async () => {
    setIsRegistering(true);
    try {
      // TODO: Implement actual passkey registration logic here
      console.log("Starting passkey registration...");
      
      // Placeholder for registration logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      console.log("Passkey registration completed");
    } catch (error) {
      console.error("Passkey registration failed:", error);
    } finally {
      setIsRegistering(false);
    }
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
          loading={isRegistering}
          variant="light"
          color="blue"
        >
          {isRegistering ? "Registering Passkey..." : "Register Passkey"}
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
