import { browserSupportsWebAuthn, platformAuthenticatorIsAvailable } from "@simplewebauthn/browser";

export interface PasskeySupport {
  isSupported: boolean;
  isPlatformAvailable: boolean;
}

export const checkPasskeySupport = async (): Promise<PasskeySupport> => {
  // Check if WebAuthn is supported
  const webAuthnSupported = browserSupportsWebAuthn();
  
  let platformAvailable = false;
  if (webAuthnSupported) {
    // Check if platform authenticator (biometrics, Windows Hello, etc.) is available
    platformAvailable = await platformAuthenticatorIsAvailable();
  }

  return {
    isSupported: webAuthnSupported,
    isPlatformAvailable: platformAvailable,
  };
};
