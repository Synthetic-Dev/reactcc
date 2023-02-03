import IEventEmitter from "./IEventEmitter";
export default class EventEmitter implements IEventEmitter {
    private eventMap;
    private eventOnceMap;
    private maxListeners;
    private listenersCount;
    addListener(eventName: string | symbol, listener: (this: void, ...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (this: void, ...args: any[]) => void): this;
    once(eventName: string | symbol, listener: (this: void, ...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (this: void, ...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (this: void, ...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(eventName: string | symbol): Function[];
    emit(eventName: string | symbol, ...args: any[]): boolean;
    listenerCount(eventName: string | symbol): number;
    prependListener(eventName: string | symbol, listener: (this: void, ...args: any[]) => void): this;
    prependOnceListener(eventName: string | symbol, listener: (this: void, ...args: any[]) => void): this;
    eventNames(): (string | symbol)[];
}
