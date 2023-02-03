import IEventEmitter from "./IEventEmitter";

export default class EventEmitter implements IEventEmitter {
	private eventMap: {
		[eventName: string | symbol]: ((this: void, ...args: any[]) => void)[];
	} = {};
	private eventOnceMap: {
		[eventName: string | symbol]: ((this: void, ...args: any[]) => void)[];
	} = {};
	private maxListeners: number = 1000;
	private listenersCount: number = 0;

	addListener(
		eventName: string | symbol,
		listener: (this: void, ...args: any[]) => void
	): this {
		if (this.listenersCount >= this.maxListeners) {
			throw new Error("Exceeds max listeners");
		}

		this.eventMap[eventName] ??= [];
		this.eventMap[eventName].push(listener);
		this.emit("newListener", eventName, listener);
		this.listenersCount++;
		return this;
	}
	on(
		eventName: string | symbol,
		listener: (this: void, ...args: any[]) => void
	): this {
		return this.addListener(eventName, listener);
	}
	once(
		eventName: string | symbol,
		listener: (this: void, ...args: any[]) => void
	): this {
		this.eventOnceMap[eventName] ??= [];
		this.eventOnceMap[eventName].push(listener);
		return this.addListener(eventName, listener);
	}
	removeListener(
		eventName: string | symbol,
		listener: (this: void, ...args: any[]) => void
	): this {
		const listeners = this.eventMap[eventName] ?? [];
		const onceListeners = this.eventOnceMap[eventName];
		if (onceListeners) {
			this.eventOnceMap[eventName] = onceListeners.filter(
				(l) => l !== listener
			);
		}
		let removed = false;

		this.eventMap[eventName] = listeners.filter((l) => {
			if (l === listener) {
				removed = true;
				return false;
			}
			return true;
		});

		if (removed) this.emit("removeListener", eventName, listener);
		return this;
	}
	off(
		eventName: string | symbol,
		listener: (this: void, ...args: any[]) => void
	): this {
		return this.removeListener(eventName, listener);
	}
	removeAllListeners(event?: string | symbol): this {
		for (const ev of Object.keys(this.eventMap)) {
			if (!event || (event && ev === event)) {
				const listeners = this.eventMap[ev] ?? [];
				for (const listener of listeners) {
					this.removeListener(ev, listener);
				}
			}
		}

		return this;
	}
	setMaxListeners(n: number): this {
		this.maxListeners = n;
		return this;
	}
	getMaxListeners(): number {
		return this.maxListeners;
	}
	listeners(eventName: string | symbol): Function[] {
		return [...(this.eventMap[eventName] ?? [])];
	}
	emit(eventName: string | symbol, ...args: any[]): boolean {
		const listeners = this.eventMap[eventName] ?? [];
		const ran = listeners.length > 0;
		const onceListeners = this.eventOnceMap[eventName] ?? [];
		listeners.forEach((listener) => {
			coroutine.wrap(() => {
				listener(...args);
			})();
			if (onceListeners.includes(listener)) {
				this.removeListener(eventName, listener);
			}
		});
		return ran;
	}
	listenerCount(eventName: string | symbol): number {
		return (this.eventMap[eventName] ?? []).length;
	}
	prependListener(
		eventName: string | symbol,
		listener: (this: void, ...args: any[]) => void
	): this {
		if (this.listenersCount >= this.maxListeners) {
			throw new Error("Exceeds max listeners");
		}

		this.eventMap[eventName] ??= [];
		this.eventMap[eventName].unshift(listener);
		this.emit("newListener", eventName, listener);
		this.listenersCount++;
		return this;
	}
	prependOnceListener(
		eventName: string | symbol,
		listener: (this: void, ...args: any[]) => void
	): this {
		this.eventOnceMap[eventName] ??= [];
		this.eventOnceMap[eventName].push(listener);
		return this.prependListener(eventName, listener);
	}
	eventNames(): (string | symbol)[] {
		return Object.keys(this.eventMap);
	}
}
