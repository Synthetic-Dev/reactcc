local ____lualib = require("lualib_bundle")
local __TS__StringStartsWith = ____lualib.__TS__StringStartsWith
local __TS__Class = ____lualib.__TS__Class
local __TS__New = ____lualib.__TS__New
local __TS__StringSubstring = ____lualib.__TS__StringSubstring
local __TS__ObjectKeys = ____lualib.__TS__ObjectKeys
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local __TS__ArraySome = ____lualib.__TS__ArraySome
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__ArrayUnshift = ____lualib.__TS__ArrayUnshift
local __TS__ArrayIsArray = ____lualib.__TS__ArrayIsArray
local __TS__ObjectValues = ____lualib.__TS__ObjectValues
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local ____exports = {}
local ____symbols = require("symbols")
local CONSUMER_SYMBOL = ____symbols.CONSUMER_SYMBOL
local INTERNAL = ____symbols.INTERNAL
local INTERNAL_RECONCILER = ____symbols.INTERNAL_RECONCILER
local PROVIDER_SYMBOL = ____symbols.PROVIDER_SYMBOL
local ____types = require("types")
local INTRINSIC_ELEMENTS = ____types.INTRINSIC_ELEMENTS
local ____Hooks = require("lib.reconciler.Hooks")
local Hooks = ____Hooks.default
local ____types = require("lib.reconciler.types")
local Effect = ____types.Effect
local EffectHookExecution = ____types.EffectHookExecution
local propFilters
propFilters = {
    isEvent = function(____, key) return __TS__StringStartsWith(key, "on") end,
    isProperty = function(____, key) return key ~= "children" and not propFilters:isEvent(key) end,
    isNew = function(____, prev, next) return function(____, key) return prev[key] ~= next[key] end end,
    isGone = function(____, prev, next) return function(____, key) return not (next[key] ~= nil) end end,
    isChanged = function(____, prev, next) return function(____, key) return propFilters:isGone(prev, next)(nil, key) or propFilters:isNew(prev, next)(nil, key) end end
}
local function isExoticType(self, ____type)
    return not not (____type and type(____type) == "table" and ____type["$$typeof"])
end
____exports.default = __TS__Class()
local Reconciler = ____exports.default
Reconciler.name = "Reconciler"
function Reconciler.prototype.____constructor(self)
    self.reconciling = false
    self.committing = false
    self.shouldReconcile = false
    self.hooks = __TS__New(Hooks, self)
end
function Reconciler.prototype.updateElement(self, element, prevProps, nextProps)
    __TS__ArrayForEach(
        __TS__ArrayFilter(
            __TS__ArrayFilter(
                __TS__ObjectKeys(prevProps),
                propFilters.isEvent
            ),
            propFilters:isChanged(prevProps, nextProps)
        ),
        function(____, key)
            local eventName = __TS__StringSubstring(
                string.lower(key),
                2
            )
            element:removeListener(eventName, prevProps[key])
        end
    )
    local propsChanged = __TS__ArraySome(
        __TS__ArrayFilter(
            __TS__ObjectKeys(prevProps),
            propFilters.isProperty
        ),
        propFilters:isChanged(prevProps, nextProps)
    )
    if propsChanged or not element.initialized then
        local defaultProps = element:__defaultProps()
        local props = __TS__ObjectAssign({}, nextProps)
        __TS__ArrayForEach(
            __TS__ObjectKeys(defaultProps),
            function(____, key)
                local value = defaultProps[key]
                if props[key] == nil or props[key] == nil then
                    props[key] = value
                end
            end
        )
        element:__updateProps(props)
    end
    __TS__ArrayForEach(
        __TS__ArrayFilter(
            __TS__ArrayFilter(
                __TS__ObjectKeys(nextProps),
                propFilters.isEvent
            ),
            propFilters:isNew(prevProps, nextProps)
        ),
        function(____, key)
            local eventName = __TS__StringSubstring(
                string.lower(key),
                2
            )
            element:addListener(eventName, nextProps[key])
        end
    )
end
function Reconciler.prototype.createElement(self, fibre)
    return __TS__New(fibre.type)
end
function Reconciler.prototype.reconcileChildren(self, wipFibre, elements)
    local index = 0
    local oldFibre = wipFibre.alternate and wipFibre.alternate.child
    local prevSibling = nil
    while index < #elements or oldFibre ~= nil do
        local element = elements[index + 1]
        local newFibre = nil
        local sameType = oldFibre and element and element.type == oldFibre.type
        if sameType then
            newFibre = {
                type = oldFibre.type,
                props = element.props,
                element = oldFibre.element,
                parent = wipFibre,
                alternate = oldFibre,
                effect = Effect.UPDATE
            }
        end
        if element and not sameType then
            newFibre = {
                type = element.type,
                props = element.props,
                element = nil,
                parent = wipFibre,
                alternate = nil,
                effect = Effect.PLACEMENT
            }
        end
        if oldFibre and not sameType then
            oldFibre.effect = Effect.DELETION
            local ____self_deletions_0 = self.deletions
            ____self_deletions_0[#____self_deletions_0 + 1] = oldFibre
        end
        if oldFibre then
            oldFibre = oldFibre.sibling
        end
        if index == 0 then
            wipFibre.child = newFibre
        elseif element then
            prevSibling.sibling = newFibre
        end
        prevSibling = newFibre
        index = index + 1
    end
end
function Reconciler.prototype.performUnitOfWork(self, fibre)
    if isExoticType(nil, fibre.type) then
        self:updateExoticComponent(fibre)
    elseif type(fibre.type) == "function" then
        self:updateFunctionalComponent(fibre)
    else
        self:updateHostComponent(fibre)
    end
    if fibre.child then
        return fibre.child
    end
    local nextFibre = fibre
    while nextFibre do
        if nextFibre.sibling then
            return nextFibre.sibling
        end
        nextFibre = nextFibre.parent
        if nextFibre and isExoticType(nil, nextFibre.type) and nextFibre.type["$$typeof"] == PROVIDER_SYMBOL then
            local provider = nextFibre.type
            local context = provider[INTERNAL].context
            table.remove(context[INTERNAL].valueStack, 1)
        end
    end
    return nil
end
function Reconciler.prototype.updateHostComponent(self, fibre)
    if not fibre.element then
        fibre.element = self:createElement(fibre)
    end
    local ____fibre_props_children_1 = fibre.props.children
    if ____fibre_props_children_1 == nil then
        ____fibre_props_children_1 = {}
    end
    local children = ____fibre_props_children_1
    self:reconcileChildren(fibre, children)
end
function Reconciler.prototype.updateExoticComponent(self, fibre)
    if isExoticType(nil, fibre.type) then
        repeat
            local ____switch39 = fibre.type["$$typeof"]
            local provider, context, props
            local ____cond39 = ____switch39 == PROVIDER_SYMBOL
            if ____cond39 then
                provider = fibre.type
                context = provider[INTERNAL].context
                props = fibre.props
                __TS__ArrayUnshift(context[INTERNAL].valueStack, props.value)
                break
            end
            ____cond39 = ____cond39 or ____switch39 == CONSUMER_SYMBOL
            if ____cond39 then
                break
            end
            do
                error("An unknown Symbol or ExoticComponent appeared in fibre tree", 0)
            end
        until true
    end
    local ____fibre_props_children_2 = fibre.props.children
    if ____fibre_props_children_2 == nil then
        ____fibre_props_children_2 = {}
    end
    local children = ____fibre_props_children_2
    self:reconcileChildren(fibre, children)
end
function Reconciler.prototype.updateFunctionalComponent(self, fibre)
    self.hooks.fibre = fibre
    self.hooks.index = 0
    fibre.hooks = {}
    local func = fibre.type
    local env = getfenv(func)
    env[INTERNAL_RECONCILER] = self
    setfenv(func, env)
    local renderer = self.wipVirtualRoot.element
    local prevWindow = term.redirect(renderer:getWindow())
    local result
    local ____fibre_parent_3
    if fibre.parent then
        ____fibre_parent_3 = fibre.parent.type
    else
        ____fibre_parent_3 = nil
    end
    local parentType = ____fibre_parent_3
    if isExoticType(nil, parentType) and parentType["$$typeof"] == CONSUMER_SYMBOL then
        local consumer = parentType
        local value = consumer[INTERNAL]:getValue()
        result = func(value)
    else
        result = func(nil, fibre.props)
    end
    term.redirect(prevWindow)
    self.hooks.fibre = nil
    local ____Array_isArray_result_4
    if __TS__ArrayIsArray(result) then
        ____Array_isArray_result_4 = {table.unpack(result)}
    else
        ____Array_isArray_result_4 = {result}
    end
    local children = ____Array_isArray_result_4
    self:reconcileChildren(fibre, children)
end
function Reconciler.prototype.performWork(self)
    if self.reconciling then
        return
    end
    self.reconciling = true
    while self.nextUnitOfWork do
        self.nextUnitOfWork = self:performUnitOfWork(self.nextUnitOfWork)
    end
    self.reconciling = false
    if not self.nextUnitOfWork and self.wipVirtualRoot then
        self:commitRoot()
    end
end
function Reconciler.prototype.getComponentNameFromElement(self, element)
    if not element then
        return "?"
    end
    return element.constructor.name
end
function Reconciler.prototype.getComponentNameFromFibre(self, fibre)
    if not fibre.type then
        return self:getComponentNameFromElement(fibre.element)
    end
    local function getContextName(self, context)
        local ____context_displayName_5 = context.displayName
        if ____context_displayName_5 == nil then
            ____context_displayName_5 = "Context"
        end
        return ____context_displayName_5
    end
    if isExoticType(nil, fibre.type) then
        local context
        repeat
            local ____switch53 = fibre.type["$$typeof"]
            local ____cond53 = ____switch53 == PROVIDER_SYMBOL
            if ____cond53 then
                context = fibre.type[INTERNAL].context
                return getContextName(nil, context) .. ".Provider"
            end
            ____cond53 = ____cond53 or ____switch53 == CONSUMER_SYMBOL
            if ____cond53 then
                context = fibre.type[INTERNAL].context
                return getContextName(nil, context) .. ".Consumer"
            end
            do
                return "ExoticComponent"
            end
        until true
    end
    local intrinsicElementIndex = __TS__ArrayIndexOf(
        __TS__ObjectValues(INTRINSIC_ELEMENTS),
        fibre.type
    )
    if intrinsicElementIndex >= 0 then
        local key = __TS__ObjectKeys(INTRINSIC_ELEMENTS)[intrinsicElementIndex + 1]
        return key
    end
    if type(fibre.type) == "function" then
        local ____fibre_parent_6
        if fibre.parent then
            ____fibre_parent_6 = fibre.parent.type
        else
            ____fibre_parent_6 = nil
        end
        local parentType = ____fibre_parent_6
        if isExoticType(nil, parentType) and parentType["$$typeof"] == CONSUMER_SYMBOL then
            return "ConsumerChildNode"
        end
        return "FuncNode"
    end
    return self:getComponentNameFromElement(fibre.element)
end
function Reconciler.prototype.commitRoot(self)
    self.committing = true
    __TS__ArrayForEach(
        self.deletions,
        function(____, fibre) return self:commitWork(fibre) end
    )
    self:commitWork(self.wipVirtualRoot.child)
    self.committing = false
    __TS__ArrayForEach(
        self.deferredEffects,
        function(____, fibre)
            self.hooks:cancelEffects(fibre, EffectHookExecution.DEFER)
            self.hooks:runEffects(fibre, EffectHookExecution.DEFER)
        end
    )
    self.currentVirtualRoot = self.wipVirtualRoot
    self.wipVirtualRoot = nil
end
function Reconciler.prototype.commitWork(self, fibre)
    if not fibre then
        return
    end
    local parentFibre = fibre.parent
    while not parentFibre.element do
        parentFibre = parentFibre.parent
    end
    local elementParent = parentFibre.element
    local ____fibre_effect_7 = fibre.effect
    if ____fibre_effect_7 == nil then
        ____fibre_effect_7 = Effect.NONE
    end
    local effect = ____fibre_effect_7
    if effect ~= Effect.NONE and self.hooks:hasDeferredEffects(fibre) then
        local ____self_deferredEffects_8 = self.deferredEffects
        ____self_deferredEffects_8[#____self_deferredEffects_8 + 1] = fibre
    end
    repeat
        local ____switch64 = effect
        local ____cond64 = ____switch64 == Effect.PLACEMENT
        if ____cond64 then
            if fibre.element ~= nil then
                elementParent:add(fibre.element)
                self:updateElement(fibre.element, {}, fibre.props)
            end
            self.hooks:runEffects(fibre)
            break
        end
        ____cond64 = ____cond64 or ____switch64 == Effect.UPDATE
        if ____cond64 then
            self.hooks:cancelEffects(fibre)
            if fibre.element ~= nil then
                self:updateElement(fibre.element, fibre.alternate.props, fibre.props)
            end
            self.hooks:runEffects(fibre)
            break
        end
        ____cond64 = ____cond64 or ____switch64 == Effect.DELETION
        if ____cond64 then
            self.hooks:cancelEffects(fibre)
            self:commitDeletion(fibre, elementParent)
            return
        end
    until true
    self:commitWork(fibre.child)
    self:commitWork(fibre.sibling)
end
function Reconciler.prototype.commitDeletion(self, fibre, elementParent)
    if fibre.element then
        elementParent:remove(fibre.element)
    else
        self:commitDeletion(fibre.child, elementParent)
    end
end
function Reconciler.prototype.beginWork(self, root)
    self.wipVirtualRoot = root
    self.deletions = {}
    self.deferredEffects = {}
    self.nextUnitOfWork = self.wipVirtualRoot
    self:performWork()
end
function Reconciler.prototype.reconcile(self, element, renderer)
    local ____self_beginWork_11 = self.beginWork
    local ____renderer_10 = renderer
    local ____Array_isArray_result_9
    if __TS__ArrayIsArray(element) then
        ____Array_isArray_result_9 = {table.unpack(element)}
    else
        ____Array_isArray_result_9 = {element}
    end
    ____self_beginWork_11(self, {element = ____renderer_10, props = {children = ____Array_isArray_result_9}, alternate = self.currentVirtualRoot})
end
function Reconciler.prototype.update(self)
    if not self.shouldReconcile then
        return
    end
    self.shouldReconcile = false
    self:beginWork({element = self.currentVirtualRoot.element, props = self.currentVirtualRoot.props, alternate = self.currentVirtualRoot})
end
return ____exports
