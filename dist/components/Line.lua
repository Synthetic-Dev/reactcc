local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local ____exports = {}
local ____vectors = require("@ccts/vectors")
local Vector2 = ____vectors.Vector2
local ____DrawableBase = require("lib.element.DrawableBase")
local DrawableBase = ____DrawableBase.default
____exports.default = __TS__Class()
local Line = ____exports.default
Line.name = "Line"
__TS__ClassExtends(Line, DrawableBase)
function Line.prototype.____constructor(self, parent)
    DrawableBase.prototype.____constructor(self, parent)
end
function Line.prototype.__defaultProps(self)
    return __TS__ObjectAssign(
        DrawableBase.prototype.__defaultProps(self),
        {from = Vector2.one, to = Vector2.one, color = colors.white}
    )
end
function Line.prototype.__updateProps(self, props)
    DrawableBase.prototype.__updateProps(self, props)
    self.from = props.from
    self.to = props.to
    self.color = props.color
end
function Line.prototype.beforeDraw(self, window)
    window.setBackgroundColor(self.color)
end
function Line.prototype.draw(self, window)
    paintutils.drawLine(
        self.from.x,
        self.from.y,
        self.to.x,
        self.to.y,
        self.color
    )
end
return ____exports
