import { useEffect, useState } from 'react';

const useGoogleAuth = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
      };
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  const handleGoogleLogin = (onSuccess, onError) => {
    if (!window.google || !window.google.accounts) {
      console.error('Google Identity Services not loaded');
      if (onError) onError('Google Identity Services not loaded');
      return;
    }

    // Get Google Client ID from environment
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

    if (!clientId) {
      console.error('Google Client ID not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in .env file');
      if (onError) onError('Google Client ID not configured');
      return;
    }

    try {
      // Initialize Google Identity Services with callback
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            if (onSuccess) onSuccess(response.credential);
          } else {
            if (onError) onError('No credential received from Google');
          }
        },
      });

      // Use One Tap prompt first
      window.google.accounts.id.prompt((notification) => {
        const logPromptState = (state) => {
          const getReason = () => {
            if (notification.isNotDisplayed?.()) return notification.getNotDisplayedReason?.();
            if (notification.isSkippedMoment?.()) return notification.getSkippedReason?.();
            if (notification.isDismissedMoment?.()) return notification.getDismissedReason?.();
            return undefined;
          };
          const info = {
            state,
            moment: notification.getMomentType?.(),
            reason: getReason(),
          };
          console.warn('[Google One Tap]', info);
          return info;
        };

        // If One Tap is not displayed or was dismissed, use popup flow
        if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
          logPromptState('fallback_to_popup');
          // Create a hidden button and trigger it
          const buttonContainer = document.createElement('div');
          buttonContainer.id = 'google-signin-hidden';
          buttonContainer.style.position = 'absolute';
          buttonContainer.style.left = '-9999px';
          buttonContainer.style.top = '-9999px';
          document.body.appendChild(buttonContainer);

          // Render Google button
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            locale: 'he',
          });

          // Try to click the button
          setTimeout(() => {
            const googleButton = buttonContainer.querySelector('div[role="button"]');
            if (googleButton) {
              googleButton.click();
            } else {
              // If button click doesn't work, show error
              document.body.removeChild(buttonContainer);
              if (onError) onError('Unable to initiate Google sign-in. Please try again.');
            }
          }, 200);
        } else {
          logPromptState('one_tap_displayed');
        }
      });
    } catch (error) {
      console.error('Google login error:', error);
      if (onError) onError(error.message || 'שגיאה בהתחברות עם גוגל');
    }
  };

  return { isLoaded, handleGoogleLogin };
};

export default useGoogleAuth;
