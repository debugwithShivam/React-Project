type LocationResult = {
  latitude: number;
  longitude: number;
  address?: string;
};

type Listener = (result: LocationResult) => void;

const listeners: Record<string, Listener[]> = {};

export function onLocationPicked(type: string, listener: Listener) {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(listener);
  return () => {
    listeners[type] = listeners[type].filter((l) => l !== listener);
  };
}

export function emitLocationPicked(type: string, result: LocationResult) {
  (listeners[type] || []).forEach((l) => l(result));
}
