const trimTrailingSlash = (value) => value.replace(/\/$/, '');

export const getDefaultConsoleBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_REACT_APP_DEFAULT_CONSOLE_URL;
  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (import.meta.env.DEV) {
    return `${window.location.protocol}//${window.location.hostname}:5173`;
  }

  return '';
};

export const getDefaultConsoleUrl = (path) =>
  `${getDefaultConsoleBaseUrl()}${path}`;
