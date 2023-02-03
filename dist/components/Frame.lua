local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local ____exports = {}
local ____vectors = require("@ccts/vectors")
local Vector2 = ____vectors.Vector2
local ____Element = require("lib.element.Element")
local DrawableElement = ____Element.default
____exports.default = __TS__Class()
local Frame = ____exports.default
Frame.name = "Frame"
__TS__ClassExtends(Frame, DrawableElement)
function Frame.prototype.____constructor(self, parent)
    DrawableElement.prototype.____constructor(self, parent)
end
function Frame.prototype.draw(self, window)
    local startCorner = self.absolutePosition
    local endCorner = self.absolutePosition:add(self.size):sub(Vector2.one)
    paintutils.drawFilledBox(
        startCorner.x,
        startCorner.y,
        endCorner.x,
        endCorner.y,
        self.bgColor
    )
end
return ____exports
