local ____lualib = require("lualib_bundle")
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__Class = ____lualib.__TS__Class
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local ____exports = {}
local ____symbols = require("symbols")
local INTERNAL = ____symbols.INTERNAL
local ____types = require("lib.reconciler.types")
local Effect = ____types.Effect
local EffectHookExecution = ____types.EffectHookExecution
local HookType = ____types.HookType
local function haveDepsChanged(____, prevDeps, nextDeps)
    return not prevDeps or not nextDeps or #prevDeps ~= #nextDeps or __TS__ArraySome(
        prevDeps,
        function(____, dep, index) return dep ~= nextDeps[index + 1] end
    )
end
____exports.default = __TS__Class()
local Hooks = ____exports.default
Hooks.name = "Hooks"
function Hooks.prototype.____constructor(self, reconciler)
    self.reconciler = reconciler
end
function Hooks.prototype.findOldHook(self, name, ____type)
    local fibre = self.fibre
    local hookIndex = self.index
    local oldHook = fibre.alternate and fibre.alternate.hooks and fibre.alternate.hooks[hookIndex + 1]
    if oldHook and (oldHook.name ~= name or oldHook.type ~= ____type) then
        error(("Hook \"" .. name) .. "\" is called conditionally. Hooks must be called in the exact same order in every component render.", 4)
    end
    return oldHook
end
function Hooks.prototype.createStateHook(self, name, initial)
    local fibre = self.fibre
    local hookIndex = self.index
    local oldHook = self:findOldHook(name, HookType.STATE)
    local ____name_1 = name
    local ____HookType_STATE_2 = HookType.STATE
    local ____oldHook_0
    if oldHook then
        ____oldHook_0 = oldHook.state
    else
        ____oldHook_0 = initial
    end
    local hook = {name = ____name_1, type = ____HookType_STATE_2, state = ____oldHook_0, queue = {}}
    local ____oldHook_3
    if oldHook then
        ____oldHook_3 = oldHook.queue
    else
        ____oldHook_3 = hook.queue
    end
    local actions = ____oldHook_3
    __TS__ArrayForEach(
        actions,
        function(____, action)
            hook.state = action(nil, hook.state)
        end
    )
    fibre.hooks[hookIndex + 1] = hook
    self.index = self.index + 1
    return hook
end
function Hooks.prototype.createEffectHook(self, name, execution, effect, deps)
    local fibre = self.fibre
    local hookIndex = self.index
    local oldHook = self:findOldHook(name, HookType.EFFECT)
    local ____oldHook_4
    if oldHook then
        ____oldHook_4 = oldHook.deps
    else
        ____oldHook_4 = nil
    end
    local depsChanged = haveDepsChanged(nil, ____oldHook_4, deps)
    local ____name_6 = name
    local ____HookType_EFFECT_7 = HookType.EFFECT
    local ____execution_8 = execution
    local ____depsChanged_5
    if depsChanged then
        ____depsChanged_5 = effect
    else
        ____depsChanged_5 = nil
    end
    local hook = {
        name = ____name_6,
        type = ____HookType_EFFECT_7,
        execution = ____execution_8,
        effect = ____depsChanged_5,
        cancel = depsChanged and oldHook and oldHook.cancel,
        deps = deps
    }
    fibre.hooks[hookIndex + 1] = hook
    self.index = self.index + 1
    return hook
end
function Hooks.prototype.createMemoHook(self, name, compute, deps)
    local fibre = self.fibre
    local hookIndex = self.index
    local oldHook = self:findOldHook(name, HookType.MEMO)
    local ____oldHook_9
    if oldHook then
        ____oldHook_9 = oldHook.deps
    else
        ____oldHook_9 = nil
    end
    local depsChanged = haveDepsChanged(nil, ____oldHook_9, deps)
    local ____oldHook_10
    if oldHook then
        ____oldHook_10 = oldHook.value
    else
        ____oldHook_10 = nil
    end
    local value = ____oldHook_10
    if value == nil or depsChanged then
        value = compute(nil)
    end
    local hook = {name = name, type = HookType.MEMO, value = value, deps = deps}
    fibre.hooks[hookIndex + 1] = hook
    self.index = self.index + 1
    return hook
end
function Hooks.prototype.createContextHook(self, name, context)
    local fibre = self.fibre
    local hookIndex = self.index
    local oldHook = self:findOldHook(name, HookType.CONTEXT)
    if oldHook and oldHook.context ~= context then
        error(("Hook \"" .. name) .. "\" is called with a conditional context. Context hooks must be called with the same context each render.", 3)
    end
    local ____name_12 = name
    local ____HookType_CONTEXT_13 = HookType.CONTEXT
    local ____oldHook_11
    if oldHook then
        ____oldHook_11 = oldHook.context
    else
        ____oldHook_11 = context
    end
    local hook = {name = ____name_12, type = ____HookType_CONTEXT_13, context = ____oldHook_11}
    fibre.hooks[hookIndex + 1] = hook
    self.index = self.index + 1
    return hook
end
function Hooks.prototype.useState(self, initial, hookName)
    if hookName == nil then
        hookName = "useState"
    end
    local fibre = self.fibre
    local hook = self:createStateHook(hookName, initial)
    local function setState(____, value)
        if self.reconciler.reconciling then
            error("setState(...): Cannot update during an existing state transition (such as within a component's body). Components should be a pure function of props and initial state.", 2)
        end
        if fibre.effect == Effect.DELETION then
            error("setState(...): Cannot perform a state update on an unmounted component.", 2)
        end
        local action
        if type(value) ~= "function" then
            action = function()
                return value
            end
        else
            action = value
        end
        local ____hook_queue_14 = hook.queue
        ____hook_queue_14[#____hook_queue_14 + 1] = action
        self.reconciler.shouldReconcile = true
    end
    return hook.state, setState
end
function Hooks.prototype.useIncrement(self, initial)
    if initial == nil then
        initial = 0
    end
    local state, setState = self:useState(initial, "useIncrement")
    return state, function()
        setState(nil, state + 1)
    end
end
function Hooks.prototype.useReducer(self, reducer, initialValueOrArg, init)
    if not init then
        init = function(____, arg)
            return arg
        end
    end
    local fibre = self.fibre
    local hook = self:createStateHook(
        "useReducer",
        init(nil, initialValueOrArg)
    )
    local function dispatch(____, value)
        if self.reconciler.reconciling then
            error("dispatch(...): Cannot update during an existing state transition (such as within a component's body). Components should be a pure function of props and initial state.", 2)
        end
        if fibre.effect == Effect.DELETION then
            error("dispatch(...): Cannot perform a state update on an unmounted component.", 2)
        end
        local ____hook_queue_15 = hook.queue
        ____hook_queue_15[#____hook_queue_15 + 1] = function(____, oldState)
            return reducer(nil, oldState, value)
        end
        self.reconciler.shouldReconcile = true
    end
    return hook.state, dispatch
end
function Hooks.prototype.useEffect(self, effect, deps)
    self:createEffectHook("useEffect", EffectHookExecution.IMMEDIATE, effect, deps)
end
function Hooks.prototype.useDeferredEffect(self, effect, deps)
    self:createEffectHook("useDeferredEffect", EffectHookExecution.DEFER, effect, deps)
end
function Hooks.prototype.useContext(self, context)
    local hook = self:createContextHook("useContext", context)
    return hook.context.Consumer[INTERNAL]:getValue()
end
function Hooks.prototype.useMemo(self, compute, deps)
    local hook = self:createMemoHook("useMemo", compute, deps)
    return hook.value
end
function Hooks.prototype.useCallback(self, callback, deps)
    local hook = self:createMemoHook(
        "useCallback",
        function()
            return callback
        end,
        deps
    )
    return hook.value
end
function Hooks.prototype.runEffects(self, fibre, execution)
    if execution == nil then
        execution = EffectHookExecution.IMMEDIATE
    end
    if not fibre.hooks then
        return
    end
    __TS__ArrayForEach(
        __TS__ArrayFilter(
            __TS__ArrayFilter(
                fibre.hooks,
                function(____, hook) return hook.type == HookType.EFFECT end
            ),
            function(____, hook) return hook.execution == execution and hook.effect end
        ),
        function(____, effectHook)
            effectHook.cancel = effectHook:effect()
        end
    )
end
function Hooks.prototype.cancelEffects(self, fibre, execution)
    if execution == nil then
        execution = EffectHookExecution.IMMEDIATE
    end
    local ____temp_16
    if fibre.alternate and fibre.alternate.hooks then
        ____temp_16 = fibre.alternate.hooks
    else
        ____temp_16 = fibre.hooks
    end
    local hooks = ____temp_16
    if hooks == nil then
        hooks = {}
    end
    __TS__ArrayForEach(
        __TS__ArrayFilter(
            __TS__ArrayFilter(
                hooks,
                function(____, hook) return hook.type == HookType.EFFECT end
            ),
            function(____, hook) return hook.execution == execution and hook.cancel end
        ),
        function(____, effectHook)
            effectHook:cancel()
        end
    )
end
function Hooks.prototype.hasDeferredEffects(self, fibre)
    return fibre.hooks and __TS__ArraySome(
        fibre.hooks,
        function(____, hook) return hook.type == HookType.EFFECT and hook.execution == EffectHookExecution.DEFER end
    )
end
return ____exports
