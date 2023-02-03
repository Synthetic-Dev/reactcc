local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__New = ____lualib.__TS__New
local __TS__StringSubstring = ____lualib.__TS__StringSubstring
local ____exports = {}
local ____vectors = require("@ccts/vectors")
local Vector2 = ____vectors.Vector2
local ____Element = require("lib.element.Element")
local DrawableElement = ____Element.default
____exports.default = __TS__Class()
local TextElement = ____exports.default
TextElement.name = "TextElement"
__TS__ClassExtends(TextElement, DrawableElement)
function TextElement.prototype.____constructor(self, parent)
    DrawableElement.prototype.____constructor(self, parent)
    self.textOffset = Vector2.zero
end
function TextElement.prototype.__defaultProps(self)
    return __TS__ObjectAssign(
        DrawableElement.prototype.__defaultProps(self),
        {text = "", textColor = colors.white}
    )
end
function TextElement.prototype.__updateProps(self, props)
    DrawableElement.prototype.__updateProps(self, props)
    self.text = tostring(props.text)
    self.size = __TS__New(Vector2, #self.text, 1)
    self.textColor = props.textColor
end
function TextElement.prototype.beforeDraw(self, window)
    DrawableElement.prototype.beforeDraw(self, window)
    window.setTextColor(self.textColor)
end
function TextElement.prototype.draw(self, window)
    local position = self.absolutePosition:add(self.textOffset)
    local ____temp_0
    if position.x < 1 then
        ____temp_0 = -position.x + 1
    else
        ____temp_0 = 0
    end
    local shift = ____temp_0
    local line = {window.getLine(position.y)}
    local bg = __TS__StringSubstring(line[3], position.x + shift - 1, position.x + shift + (#self.text - shift) - 1)
    local length = #bg
    local text = __TS__StringSubstring(self.text, shift, length + shift)
    local fg = string.rep(
        colors.toBlit(self.textColor),
        math.floor(length)
    )
    window.blit(
        string.rep(
            " ",
            math.floor(shift)
        ) .. text,
        string.rep(
            " ",
            math.floor(shift)
        ) .. fg,
        string.rep(
            " ",
            math.floor(shift)
        ) .. bg
    )
end
return ____exports
