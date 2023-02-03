local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local Error = ____lualib.Error
local RangeError = ____lualib.RangeError
local ReferenceError = ____lualib.ReferenceError
local SyntaxError = ____lualib.SyntaxError
local TypeError = ____lualib.TypeError
local URIError = ____lualib.URIError
local __TS__New = ____lualib.__TS__New
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ObjectKeys = ____lualib.__TS__ObjectKeys
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local __TS__ArrayUnshift = ____lualib.__TS__ArrayUnshift
local ____exports = {}
____exports.default = __TS__Class()
local EventEmitter = ____exports.default
EventEmitter.name = "EventEmitter"
function EventEmitter.prototype.____constructor(self)
    self.eventMap = {}
    self.eventOnceMap = {}
    self.maxListeners = 1000
    self.listenersCount = 0
end
function EventEmitter.prototype.addListener(self, eventName, listener)
    if self.listenersCount >= self.maxListeners then
        error(
            __TS__New(Error, "Exceeds max listeners"),
            0
        )
    end
    local ____self_eventMap_0, ____eventName_1 = self.eventMap, eventName
    if ____self_eventMap_0[____eventName_1] == nil then
        ____self_eventMap_0[____eventName_1] = {}
    end
    local ____self_eventMap_eventName_2 = self.eventMap[eventName]
    ____self_eventMap_eventName_2[#____self_eventMap_eventName_2 + 1] = listener
    self:emit("newListener", eventName, listener)
    self.listenersCount = self.listenersCount + 1
    return self
end
function EventEmitter.prototype.on(self, eventName, listener)
    return self:addListener(eventName, listener)
end
function EventEmitter.prototype.once(self, eventName, listener)
    local ____self_eventOnceMap_3, ____eventName_4 = self.eventOnceMap, eventName
    if ____self_eventOnceMap_3[____eventName_4] == nil then
        ____self_eventOnceMap_3[____eventName_4] = {}
    end
    local ____self_eventOnceMap_eventName_5 = self.eventOnceMap[eventName]
    ____self_eventOnceMap_eventName_5[#____self_eventOnceMap_eventName_5 + 1] = listener
    return self:addListener(eventName, listener)
end
function EventEmitter.prototype.removeListener(self, eventName, listener)
    local ____self_eventMap_eventName_6 = self.eventMap[eventName]
    if ____self_eventMap_eventName_6 == nil then
        ____self_eventMap_eventName_6 = {}
    end
    local listeners = ____self_eventMap_eventName_6
    local onceListeners = self.eventOnceMap[eventName]
    if onceListeners then
        self.eventOnceMap[eventName] = __TS__ArrayFilter(
            onceListeners,
            function(____, l) return l ~= listener end
        )
    end
    local removed = false
    self.eventMap[eventName] = __TS__ArrayFilter(
        listeners,
        function(____, l)
            if l == listener then
                removed = true
                return false
            end
            return true
        end
    )
    if removed then
        self:emit("removeListener", eventName, listener)
    end
    return self
end
function EventEmitter.prototype.off(self, eventName, listener)
    return self:removeListener(eventName, listener)
end
function EventEmitter.prototype.removeAllListeners(self, event)
    for ____, ev in ipairs(__TS__ObjectKeys(self.eventMap)) do
        if not event or event and ev == event then
            local ____self_eventMap_ev_7 = self.eventMap[ev]
            if ____self_eventMap_ev_7 == nil then
                ____self_eventMap_ev_7 = {}
            end
            local listeners = ____self_eventMap_ev_7
            for ____, listener in ipairs(listeners) do
                self:removeListener(ev, listener)
            end
        end
    end
    return self
end
function EventEmitter.prototype.setMaxListeners(self, n)
    self.maxListeners = n
    return self
end
function EventEmitter.prototype.getMaxListeners(self)
    return self.maxListeners
end
function EventEmitter.prototype.listeners(self, eventName)
    local ____self_eventMap_eventName_8 = self.eventMap[eventName]
    if ____self_eventMap_eventName_8 == nil then
        ____self_eventMap_eventName_8 = {}
    end
    return {table.unpack(____self_eventMap_eventName_8)}
end
function EventEmitter.prototype.emit(self, eventName, ...)
    local args = {...}
    local ____self_eventMap_eventName_9 = self.eventMap[eventName]
    if ____self_eventMap_eventName_9 == nil then
        ____self_eventMap_eventName_9 = {}
    end
    local listeners = ____self_eventMap_eventName_9
    local ran = #listeners > 0
    local ____self_eventOnceMap_eventName_10 = self.eventOnceMap[eventName]
    if ____self_eventOnceMap_eventName_10 == nil then
        ____self_eventOnceMap_eventName_10 = {}
    end
    local onceListeners = ____self_eventOnceMap_eventName_10
    __TS__ArrayForEach(
        listeners,
        function(____, listener)
            coroutine.wrap(function()
                listener(table.unpack(args))
            end)()
            if __TS__ArrayIncludes(onceListeners, listener) then
                self:removeListener(eventName, listener)
            end
        end
    )
    return ran
end
function EventEmitter.prototype.listenerCount(self, eventName)
    local ____self_eventMap_eventName_11 = self.eventMap[eventName]
    if ____self_eventMap_eventName_11 == nil then
        ____self_eventMap_eventName_11 = {}
    end
    return #____self_eventMap_eventName_11
end
function EventEmitter.prototype.prependListener(self, eventName, listener)
    if self.listenersCount >= self.maxListeners then
        error(
            __TS__New(Error, "Exceeds max listeners"),
            0
        )
    end
    local ____self_eventMap_12, ____eventName_13 = self.eventMap, eventName
    if ____self_eventMap_12[____eventName_13] == nil then
        ____self_eventMap_12[____eventName_13] = {}
    end
    __TS__ArrayUnshift(self.eventMap[eventName], listener)
    self:emit("newListener", eventName, listener)
    self.listenersCount = self.listenersCount + 1
    return self
end
function EventEmitter.prototype.prependOnceListener(self, eventName, listener)
    local ____self_eventOnceMap_14, ____eventName_15 = self.eventOnceMap, eventName
    if ____self_eventOnceMap_14[____eventName_15] == nil then
        ____self_eventOnceMap_14[____eventName_15] = {}
    end
    local ____self_eventOnceMap_eventName_16 = self.eventOnceMap[eventName]
    ____self_eventOnceMap_eventName_16[#____self_eventOnceMap_eventName_16 + 1] = listener
    return self:prependListener(eventName, listener)
end
function EventEmitter.prototype.eventNames(self)
    return __TS__ObjectKeys(self.eventMap)
end
return ____exports
