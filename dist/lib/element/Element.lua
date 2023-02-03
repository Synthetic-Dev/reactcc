local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local ____exports = {}
local ____Drawable = require("lib.element.Drawable")
local Drawable = ____Drawable.default
____exports.default = __TS__Class()
local DrawableElement = ____exports.default
DrawableElement.name = "DrawableElement"
__TS__ClassExtends(DrawableElement, Drawable)
function DrawableElement.prototype.____constructor(self, parent)
    Drawable.prototype.____constructor(self, parent)
end
function DrawableElement.prototype.__defaultProps(self)
    return __TS__ObjectAssign(
        Drawable.prototype.__defaultProps(self),
        {bgColor = colors.black}
    )
end
function DrawableElement.prototype.__updateProps(self, props)
    Drawable.prototype.__updateProps(self, props)
    self.bgColor = props.bgColor
end
function DrawableElement.prototype.beforeDraw(self, window)
    Drawable.prototype.beforeDraw(self, window)
    window.setBackgroundColor(self.bgColor)
end
return ____exports
