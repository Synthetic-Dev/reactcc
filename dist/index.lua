local ____lualib = require("lualib_bundle")
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ArrayConcat = ____lualib.__TS__ArrayConcat
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local __TS__New = ____lualib.__TS__New
local __TS__ObjectKeys = ____lualib.__TS__ObjectKeys
local __TS__ArrayMap = ____lualib.__TS__ArrayMap
local ____exports = {}
local sanitizeChildren, createElement, createTextElement, createFragment
local ____Renderer = require("lib.Renderer")
local Renderer = ____Renderer.default
local ____types = require("types")
local INTRINSIC_ELEMENTS = ____types.INTRINSIC_ELEMENTS
local ____reconciler = require("lib.reconciler.index")
local Reconciler = ____reconciler.default
local ____symbols = require("symbols")
local CONSUMER_SYMBOL = ____symbols.CONSUMER_SYMBOL
local FRAGMENT_SYMBOL = ____symbols.FRAGMENT_SYMBOL
local INTERNAL = ____symbols.INTERNAL
local INTERNAL_RECONCILER = ____symbols.INTERNAL_RECONCILER
local PROVIDER_SYMBOL = ____symbols.PROVIDER_SYMBOL
local ____vectors = require("@ccts/vectors")
local Vector2 = ____vectors.Vector2
local expect = require("@NoResolution:cc/expect")
function sanitizeChildren(children)
    local sanitized = {}
    __TS__ArrayForEach(
        children,
        function(____, child)
            if __TS__ArrayIsArray(child) then
                sanitized = __TS__ArrayConcat(sanitized, child)
                return
            end
            if type(child) == "function" then
                sanitized[#sanitized + 1] = createElement(nil, child)
                return
            end
            if type(child) == "table" then
                sanitized[#sanitized + 1] = child
                return
            end
            sanitized[#sanitized + 1] = createTextElement(
                nil,
                tostring(child)
            )
        end
    )
    return sanitized
end
function createElement(self, ____type, props, ...)
    local children = {...}
    if type(____type) == "table" and ____type["$$typeof"] then
        repeat
            local ____switch10 = ____type["$$typeof"]
            local ____cond10 = ____switch10 == FRAGMENT_SYMBOL
            if ____cond10 then
                return createFragment(nil, ...)
            end
            ____cond10 = ____cond10 or ____switch10 == CONSUMER_SYMBOL
            if ____cond10 then
                break
            end
            ____cond10 = ____cond10 or ____switch10 == PROVIDER_SYMBOL
            if ____cond10 then
                break
            end
            do
                error("Unknown Symbol or ExoticComponent passed into ReactCC.createElement", 2)
            end
        until true
    end
    if type(____type) == "string" then
        ____type = INTRINSIC_ELEMENTS[____type]
    end
    if props == nil then
        props = {}
    end
    if type(props) ~= "table" then
        error("Props must be a table of keys and values", 2)
    end
    return {
        type = ____type,
        props = __TS__ObjectAssign(
            {},
            props,
            {children = sanitizeChildren(children)}
        )
    }
end
function createTextElement(self, text)
    return createElement(
        nil,
        "text",
        {text = tostring(text)}
    )
end
function createFragment(self, ...)
    local children = {...}
    return {table.unpack(sanitizeChildren(children))}
end
local ____ = expect
local function createExoticComponent(symbol, properties)
    if properties == nil then
        properties = {}
    end
    return __TS__ObjectAssign({["$$typeof"] = symbol}, properties)
end
local function createContext(self, defaultValue)
    local context = {Provider = nil, Consumer = nil, displayName = nil, [INTERNAL] = {valueStack = {defaultValue}, defaultValue = defaultValue, globalName = nil}}
    context.Provider = createExoticComponent(PROVIDER_SYMBOL, {[INTERNAL] = {context = context}})
    context.Consumer = createExoticComponent(
        CONSUMER_SYMBOL,
        {[INTERNAL] = {
            context = context,
            getValue = function()
                return context[INTERNAL].valueStack[1]
            end
        }}
    )
    return context
end
local function build(element, screen, monitorSide)
    if monitorSide == nil then
        monitorSide = nil
    end
    local renderer = __TS__New(Renderer, screen)
    local reconciler = __TS__New(Reconciler)
    reconciler:reconcile(element, renderer)
    return {[INTERNAL] = {renderer = renderer, reconciler = reconciler, monitorSide = monitorSide}}
end
local function destroy(...)
    local trees = {...}
    for ____, tree in ipairs(trees) do
        local renderer = tree[INTERNAL].renderer
        renderer:clear()
    end
end
local function render(...)
    local trees = {...}
    local treesRerendered = {}
    for ____, tree in ipairs(trees) do
        local renderer = tree[INTERNAL].renderer
        local reconciler = tree[INTERNAL].reconciler
        reconciler:update()
        local drawn = renderer:draw()
        treesRerendered[#treesRerendered + 1] = drawn
    end
    return treesRerendered
end
local function update(tree, element)
    local renderer = tree[INTERNAL].renderer
    local reconciler = tree[INTERNAL].reconciler
    reconciler:reconcile(element, renderer)
end
local function createInternalEvent(name, flags)
    if flags == nil then
        flags = {}
    end
    local flagMap = {}
    __TS__ArrayForEach(
        flags,
        function(____, flag)
            flagMap[flag] = true
        end
    )
    return {name = name, flags = flagMap, rawFlags = flags}
end
local INTERNAL_EVENT_MAP = {
    mouse_click = createInternalEvent("click", {"mouse", "click"}),
    mouse_up = createInternalEvent("clickend", {"mouse"}),
    mouse_scroll = createInternalEvent("scroll", {"mouse"}),
    mouse_drag = createInternalEvent("draw", {"mouse"}),
    monitor_touch = createInternalEvent("monitortouch", {"mouse", "monitor"}),
    key = createInternalEvent("keydown", {"keyboard"}),
    key_up = createInternalEvent("keyup", {"keyboard"}),
    paste = createInternalEvent("keyup", {"keyboard", "paste"}),
    term_resize = createInternalEvent("resize")
}
local MOUSE_BUTTONS = {"left", "right", "middle"}
local function onEvent(self, eventName, rawEvent, ...)
    local trees = {...}
    if eventName == "term_resize" then
        __TS__ArrayForEach(
            trees,
            function(____, tree)
                local renderer = tree[INTERNAL].renderer
                local window = renderer:getWindow()
                local x, y = window.getPosition()
                local w, h = renderer.screen.getSize()
                window.reposition(x, y, w, h)
                renderer:makeDirty()
            end
        )
        return
    end
    local internalEvent = INTERNAL_EVENT_MAP[eventName]
    if not internalEvent then
        return
    end
    if internalEvent.flags.mouse then
        local event = rawEvent
        local pos = __TS__New(Vector2, event.x, event.y)
        local events = {internalEvent.name}
        if internalEvent.flags.monitor then
            events[#events + 1] = "click"
        end
        local ____internalEvent_flags_monitor_1
        if internalEvent.flags.monitor then
            ____internalEvent_flags_monitor_1 = "left"
        else
            local ____internalEvent_flags_click_0
            if internalEvent.flags.click then
                ____internalEvent_flags_click_0 = MOUSE_BUTTONS[event.button]
            else
                ____internalEvent_flags_click_0 = nil
            end
            ____internalEvent_flags_monitor_1 = ____internalEvent_flags_click_0
        end
        local button = ____internalEvent_flags_monitor_1
        if button then
            events[#events + 1] = button .. "click"
        end
        __TS__ArrayForEach(
            trees,
            function(____, tree)
                local renderer = tree[INTERNAL].renderer
                local monitorSide = tree[INTERNAL].monitorSide
                local isMonitor = not not monitorSide
                if not not internalEvent.flags.monitor ~= isMonitor then
                    return
                end
                if isMonitor and event.side ~= monitorSide then
                    return
                end
                renderer:emitEvents(events, event, pos)
            end
        )
    elseif internalEvent.flags.keyboard then
    end
end
local function processEvents(events, ...)
    local trees = {...}
    parallel.waitForAny(table.unpack(__TS__ArrayMap(
        __TS__ObjectKeys(INTERNAL_EVENT_MAP),
        function(____, eventName)
            return function()
                local event = events:pullEventRaw(eventName)
                onEvent(
                    nil,
                    eventName,
                    event,
                    table.unpack(trees)
                )
            end
        end
    )))
end
local ReactCC = {
    createElement = createElement,
    createTextElement = createTextElement,
    createFragment = createFragment,
    createContext = createContext,
    build = build,
    render = render,
    update = update,
    destroy = destroy,
    processEvents = processEvents,
    Fragment = createExoticComponent(FRAGMENT_SYMBOL)
}
____exports.default = ReactCC
local function throwTopLevelHookError(hook)
    error(("Hook " .. hook) .. "() cannot be called at the top level. Hooks must be called in a function component or a custom Hook function.", 3)
end
local function getHooks(hook)
    local env = getfenv(3)
    local reconciler = env[INTERNAL_RECONCILER]
    if not reconciler then
        throwTopLevelHookError(hook)
    end
    return reconciler.hooks
end
local function useState(initial)
    local hooks = getHooks("useState")
    return hooks:useState(initial)
end
local function useIncrement(initial)
    local hooks = getHooks("useIncrement")
    return hooks:useIncrement(initial)
end
local function useReducer(reducer, initialValueOrArg, init)
    local hooks = getHooks("useReducer")
    return hooks:useReducer(reducer, initialValueOrArg, init)
end
local function useEffect(effect, deps)
    local hooks = getHooks("useEffect")
    hooks:useEffect(effect, deps)
end
local function useDeferredEffect(effect, deps)
    local hooks = getHooks("useDeferredEffect")
    hooks:useDeferredEffect(effect, deps)
end
local function useMemo(compute, deps)
    local hooks = getHooks("useMemo")
    return hooks:useMemo(compute, deps)
end
local function useCallback(callback, deps)
    local hooks = getHooks("useCallback")
    return hooks:useCallback(callback, deps)
end
local function useContext(context)
    local hooks = getHooks("useContext")
    return hooks:useContext(context)
end
____exports.useState = useState
____exports.useIncrement = useIncrement
____exports.useReducer = useReducer
____exports.useEffect = useEffect
____exports.useDeferredEffect = useDeferredEffect
____exports.useContext = useContext
____exports.useMemo = useMemo
____exports.useCallback = useCallback
return ____exports
