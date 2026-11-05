/**
 * Type-safe event bus for cross-component communication.
 * Uses CustomEvent under the hood but provides type safety for event names and payloads.
 */

type EventKey<T> = string & keyof T;
type EventPayload<T, K extends EventKey<T>> = T[K];

type EventHandler<T, K extends EventKey<T>> = (
  payload: EventPayload<T, K>,
) => void;

/**
 * Create a type-safe event bus.
 *
 * @example
 * ```ts
 * // Define event types
 * type AppEvents = {
 *   'user:login': { userId: string };
 *   'notification:show': { message: string; type: 'info' | 'error' };
 * };
 *
 * // Create bus
 * const bus = createEventBus<AppEvents>();
 *
 * // Subscribe
 * const unsubscribe = bus.on('user:login', (payload) => {
 *   console.log(payload.userId); // type-safe
 * });
 *
 * // Publish
 * bus.emit('user:login', { userId: '123' });
 *
 * // Unsubscribe
 * unsubscribe();
 * ```
 */
export function createEventBus<T extends Record<string, unknown>>() {
  const target = new EventTarget();

  function on<K extends EventKey<T>>(
    event: K,
    handler: EventHandler<T, K>,
  ): () => void {
    const listener = (e: Event) => {
      handler((e as CustomEvent<EventPayload<T, K>>).detail);
    };
    target.addEventListener(event, listener);
    return () => target.removeEventListener(event, listener);
  }

  function emit<K extends EventKey<T>>(
    event: K,
    payload: EventPayload<T, K>,
  ): void {
    target.dispatchEvent(new CustomEvent(event, { detail: payload }));
  }

  return { on, emit };
}

/**
 * Global event bus for cross-component communication.
 * Define event types in AppEvents type below.
 */
export type AppEvents = {
  /** Insert text into the main chat editor */
  'editor:insert': { text: string };
};

export const globalEventBus = createEventBus<AppEvents>();
