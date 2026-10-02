const PREFIX = 'pong:';

export function readSetting(key, fallback) {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function writeSetting(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Private browsing and blocked storage must not break the game.
  }
}
