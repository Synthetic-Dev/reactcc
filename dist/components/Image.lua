local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local __TS__StringSplit = ____lualib.__TS__StringSplit
local __TS__New = ____lualib.__TS__New
local __TS__ObjectKeys = ____lualib.__TS__ObjectKeys
local ____exports = {}
local BLBFOR = require("@ccts/blbfor")
local ____vectors = require("@ccts/vectors")
local Vector2 = ____vectors.Vector2
local ____Element = require("lib.element.Element")
local DrawableElement = ____Element.default
____exports.IMAGE_FORMATS = {bimg = true, bbf = true}
____exports.default = __TS__Class()
local Image = ____exports.default
Image.name = "Image"
__TS__ClassExtends(Image, DrawableElement)
function Image.prototype.____constructor(self, parent)
    DrawableElement.prototype.____constructor(self, parent)
end
function Image.prototype.__defaultProps(self)
    return __TS__ObjectAssign(
        DrawableElement.prototype.__defaultProps(self),
        {src = "", allowPalette = false, frame = 1}
    )
end
function Image.prototype.__updateProps(self, props)
    DrawableElement.prototype.__updateProps(self, props)
    self.src = props.src
    self.allowPalette = props.allowPalette
    self.frame = props.frame
    local fileFormat = string.lower(table.remove(__TS__StringSplit(props.src, ".")))
    if props.format then
        self.format = props.format
    else
        if not ____exports.IMAGE_FORMATS[fileFormat] then
            error("No image format was provided to element and a valid format could not be found for file " .. self.src, 0)
        end
        self.format = fileFormat
    end
    self.blitLines = {}
    repeat
        local ____switch8 = self.format
        local image, meta, frame
        local ____cond8 = ____switch8 == "bbf"
        if ____cond8 then
            local ____self_handle_0 = self.handle
            if ____self_handle_0 == nil then
                ____self_handle_0 = BLBFOR.open(self.src, "r")
            end
            image = ____self_handle_0
            self.handle = image
            meta = image.meta
            if meta.palette then
                self.palette = meta.palette[1]
            end
            self.size = __TS__New(Vector2, image.width, image.height)
            frame = math.min(
                image.layers,
                math.max(1, self.frame)
            )
            if self.frame > frame and props.afterLastFrame then
                props:afterLastFrame()
            end
            do
                local y = 0
                while y < image.height do
                    local ____self_blitLines_1 = self.blitLines
                    ____self_blitLines_1[#____self_blitLines_1 + 1] = image.lines[frame][y]
                    y = y + 1
                end
            end
            break
        end
    until true
end
function Image.prototype.beforeDraw(self, window)
    DrawableElement.prototype.beforeDraw(self, window)
    if self.allowPalette and self.palette then
        for ____, color in ipairs(__TS__ObjectKeys(self.palette)) do
            window.setPaletteColor(
                math.pow(
                    2,
                    tonumber(color)
                ),
                self.palette[color]
            )
        end
    end
end
function Image.prototype.draw(self, window)
    do
        local y = 0
        while y < #self.blitLines do
            window.setCursorPos(
                math.ceil(self.absolutePosition.x),
                math.ceil(self.absolutePosition.y + y)
            )
            local line = self.blitLines[y + 1]
            if line[1] and line[2] and line[3] then
                window.blit(line[1], line[2], line[3])
            end
            y = y + 1
        end
    end
end
return ____exports
