local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__SetDescriptor = ____lualib.__TS__SetDescriptor
local __TS__ArrayIncludes = ____lualib.__TS__ArrayIncludes
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local ____exports = {}
local ____EventEmitter = require("lib.events.EventEmitter")
local EventEmitter = ____EventEmitter.default
____exports.default = __TS__Class()
local ElementBase = ____exports.default
ElementBase.name = "ElementBase"
__TS__ClassExtends(ElementBase, EventEmitter)
function ElementBase.prototype.____constructor(self, parent)
    EventEmitter.prototype.____constructor(self)
    self.children = {}
    self._initialized = false
    self._destroyed = false
    local ____exports_default_0, ____nextId_1 = ____exports.default, "nextId"
    local ____exports_default_nextId_2 = ____exports_default_0[____nextId_1]
    ____exports_default_0[____nextId_1] = ____exports_default_nextId_2 + 1
    self.id = ____exports_default_nextId_2
    if parent then
        parent:add(self)
    end
end
__TS__SetDescriptor(
    ElementBase.prototype,
    "destroyed",
    {get = function(self)
        return self._destroyed
    end},
    true
)
__TS__SetDescriptor(
    ElementBase.prototype,
    "initialized",
    {get = function(self)
        return self._initialized
    end},
    true
)
function ElementBase.prototype.add(self, element)
    if element.parent == self and __TS__ArrayIncludes(self.children, element) then
        return
    end
    if element.parent then
        element.parent:remove(element)
    end
    local ____self_children_3 = self.children
    ____self_children_3[#____self_children_3 + 1] = element
    element.parent = self
    self:emit("childAdded", element)
end
function ElementBase.prototype.remove(self, element)
    if not element then
        return
    end
    self.children = __TS__ArrayFilter(
        self.children,
        function(____, child)
            if child == element then
                child:destroy()
                self:emit("childRemoved", child)
                return false
            end
            return true
        end
    )
end
function ElementBase.prototype.removeAllChildren(self)
    __TS__ArrayForEach(
        self.children,
        function(____, child)
            self:remove(child)
        end
    )
end
function ElementBase.prototype.destroy(self)
    self.parent = nil
    self._destroyed = true
    self:removeAllChildren()
end
function ElementBase.prototype.__defaultProps(self)
    return {}
end
function ElementBase.prototype.__updateProps(self, props)
    self._initialized = true
end
ElementBase.nextId = 0
return ____exports
