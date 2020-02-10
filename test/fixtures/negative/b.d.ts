interface EventsMap {
  [event: string]: any
}

interface DefaultEvents extends EventsMap {
  [event: string]: (...args: any) => void
}

declare class Emitter<Events extends EventsMap> {
  events: Partial<{ [E in keyof Events]: Events[E][] }>
  on <K extends keyof Events>(event: K, cb: Events[K]): () => void
  emit <K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void
}

declare function b<Events extends EventsMap = DefaultEvents> (
): Emitter<Events>

export = b
