local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local ____exports = {}
local ____ElementBase = require("lib.element.ElementBase")
local ElementBase = ____ElementBase.default
____exports.default = __TS__Class()
local DrawableBase = ____exports.default
DrawableBase.name = "DrawableBase"
__TS__ClassExtends(DrawableBase, ElementBase)
function DrawableBase.prototype.____constructor(self, parent)
    ElementBase.prototype.____constructor(self, parent)
    self.zIndex = 0
    self.visible = true
    self.isDirty = false
    self.events = false
end
function DrawableBase.prototype.__defaultProps(self)
    return __TS__ObjectAssign(
        ElementBase.prototype.__defaultProps(self),
        {zIndex = 0, visible = true}
    )
end
function DrawableBase.prototype.__updateProps(self, props)
    ElementBase.prototype.__updateProps(self, props)
    self.zIndex = props.zIndex
    self.visible = props.visible
    self:makeDirty(true)
end
function DrawableBase.prototype.makeDirty(self, emit)
    if emit == nil then
        emit = false
    end
    self.isDirty = true
    if emit then
        self:emit("dirty")
    end
end
function DrawableBase.prototype.clean(self)
    self.isDirty = false
end
function DrawableBase.prototype.beforeDraw(self, window)
end
function DrawableBase.prototype.draw(self, window)
end
function DrawableBase.prototype.afterDrawn(self, window)
end
return ____exports
