local ____lualib = require("lualib_bundle")
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__SetDescriptor = ____lualib.__TS__SetDescriptor
local __TS__ObjectAssign = ____lualib.__TS__ObjectAssign
local ____exports = {}
local ____regions = require("@ccts/regions")
local Region2 = ____regions.Region2
local ____vectors = require("@ccts/vectors")
local Vector2 = ____vectors.Vector2
local ____DrawableBase = require("lib.element.DrawableBase")
local DrawableBase = ____DrawableBase.default
____exports.default = __TS__Class()
local Drawable = ____exports.default
Drawable.name = "Drawable"
__TS__ClassExtends(Drawable, DrawableBase)
function Drawable.prototype.____constructor(self, parent)
    DrawableBase.prototype.____constructor(self, parent)
    self.events = true
    self.relativePosition = Vector2.one
    self.region = Region2:rect(Vector2.one, Vector2.one)
end
__TS__SetDescriptor(
    Drawable.prototype,
    "parentPosition",
    {get = function(self)
        local ____table_parent_1
        if self.parent then
            local ____self_parent_absolutePosition_0 = self.parent.absolutePosition
            if ____self_parent_absolutePosition_0 == nil then
                ____self_parent_absolutePosition_0 = Vector2.one
            end
            ____table_parent_1 = ____self_parent_absolutePosition_0
        else
            ____table_parent_1 = Vector2.one
        end
        return ____table_parent_1
    end},
    true
)
__TS__SetDescriptor(
    Drawable.prototype,
    "position",
    {
        get = function(self)
            return self.relativePosition
        end,
        set = function(self, position)
            self.relativePosition = position:copy()
            self.region:setPosition(self.absolutePosition)
        end
    },
    true
)
__TS__SetDescriptor(
    Drawable.prototype,
    "absolutePosition",
    {get = function(self)
        return self.parentPosition:add(self.relativePosition):sub(Vector2.one)
    end},
    true
)
__TS__SetDescriptor(
    Drawable.prototype,
    "center",
    {get = function(self)
        return self.region:getCenter()
    end},
    true
)
__TS__SetDescriptor(
    Drawable.prototype,
    "absoluteCenter",
    {get = function(self)
        return self.parentPosition:add(self.center):sub(Vector2.one)
    end},
    true
)
__TS__SetDescriptor(
    Drawable.prototype,
    "size",
    {
        get = function(self)
            return self.region:getSize()
        end,
        set = function(self, size)
            self.region:setSize(size)
        end
    },
    true
)
function Drawable.prototype.__defaultProps(self)
    return __TS__ObjectAssign(
        DrawableBase.prototype.__defaultProps(self),
        {position = Vector2.one, size = Vector2.one}
    )
end
function Drawable.prototype.__updateProps(self, props)
    DrawableBase.prototype.__updateProps(self, props)
    self.position = props.position
    self.size = props.size
end
function Drawable.prototype.beforeDraw(self, window)
    window.setCursorPos(
        math.ceil(self.absolutePosition.x),
        math.ceil(self.absolutePosition.y)
    )
end
return ____exports
