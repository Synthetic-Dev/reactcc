local ____lualib = require("lualib_bundle")
local __TS__InstanceOf = ____lualib.__TS__InstanceOf
local __TS__Class = ____lualib.__TS__Class
local __TS__ClassExtends = ____lualib.__TS__ClassExtends
local __TS__New = ____lualib.__TS__New
local __TS__ArrayIndexOf = ____lualib.__TS__ArrayIndexOf
local __TS__ArraySplice = ____lualib.__TS__ArraySplice
local __TS__Delete = ____lualib.__TS__Delete
local __TS__ArrayFilter = ____lualib.__TS__ArrayFilter
local __TS__ArrayForEach = ____lualib.__TS__ArrayForEach
local ____exports = {}
local ____vectors = require("@ccts/vectors")
local Vector2 = ____vectors.Vector2
local ____Drawable = require("lib.element.Drawable")
local Drawable = ____Drawable.default
local ____DrawableBase = require("lib.element.DrawableBase")
local DrawableBase = ____DrawableBase.default
local function hasRegion(self, element)
    return __TS__InstanceOf(element, Drawable)
end
____exports.default = __TS__Class()
local Renderer = ____exports.default
Renderer.name = "Renderer"
__TS__ClassExtends(Renderer, Drawable)
function Renderer.prototype.____constructor(self, screen)
    Drawable.prototype.____constructor(self)
    self.renderBuffer = {}
    self.monitoring = {}
    self.screen = screen
    local w, h = screen.getSize()
    self.size = __TS__New(Vector2, w, h)
    self.window = window.create(
        screen,
        self.position.x,
        self.position.y,
        self.size.x,
        self.size.y,
        true
    )
    self:monitor(self)
end
function Renderer.prototype.monitor(self, element)
    if self.monitoring[element.id] then
        return
    end
    local details = {
        addedListener = function(child)
            self:childAdded(element, child)
        end,
        removedListener = function(child)
            self:childRemoved(element, child)
        end,
        dirtyListener = function()
            self:makeDirty()
        end
    }
    element:on("childAdded", details.addedListener)
    element:on("childRemoved", details.removedListener)
    if __TS__InstanceOf(element, DrawableBase) then
        element:on("dirty", details.dirtyListener)
    end
    self.monitoring[element.id] = details
end
function Renderer.prototype.childAdded(self, parent, child)
    self:monitor(child)
    if not __TS__InstanceOf(child, DrawableBase) then
        return
    end
    while parent and not __TS__InstanceOf(parent, DrawableBase) do
        parent = parent.parent
    end
    local index = __TS__ArrayIndexOf(self.renderBuffer, parent)
    if index < 0 then
        index = 0
    end
    while self.renderBuffer[index + 1] and self.renderBuffer[index + 1].zIndex <= child.zIndex do
        index = index + 1
    end
    __TS__ArraySplice(self.renderBuffer, index, 0, child)
    self:makeDirty()
end
function Renderer.prototype.childRemoved(self, parent, child)
    if self.monitoring[child.id] then
        local details = self.monitoring[child.id]
        child:off("childAdded", details.addedListener)
        child:off("childRemoved", details.removedListener)
        child:off("dirty", details.dirtyListener)
        __TS__Delete(self.monitoring, child.id)
    end
    if __TS__InstanceOf(child, DrawableBase) then
        self.renderBuffer = __TS__ArrayFilter(
            self.renderBuffer,
            function(____, e) return e ~= child end
        )
        self:makeDirty()
    end
end
function Renderer.prototype.defaults(self)
    term.setTextColor(colors.white)
    term.setBackgroundColor(colors.black)
    term.setCursorBlink(false)
    term.setCursorPos(1, 1)
end
function Renderer.prototype._clear(self)
    self:defaults()
    term.clear()
end
function Renderer.prototype.getElements(self)
    return self.renderBuffer
end
function Renderer.prototype.getWindow(self)
    return self.window
end
function Renderer.prototype.draw(self)
    if not self.isDirty then
        return false
    end
    local prevWindow = term.redirect(self.window)
    self.window.setVisible(false)
    self:_clear()
    for ____, element in ipairs(self.renderBuffer) do
        if element.visible then
            element:beforeDraw(self.window)
            element:draw(self.window)
            element:clean()
        end
    end
    self:clean()
    self.window.setVisible(true)
    term.redirect(prevWindow)
    return true
end
function Renderer.prototype.clear(self)
    local prevWindow = term.redirect(self.window)
    self.window.setVisible(false)
    self:_clear()
    self.window.setVisible(true)
    term.redirect(prevWindow)
end
function Renderer.prototype.emitEvents(self, events, event, position)
    __TS__ArrayForEach(
        self.renderBuffer,
        function(____, element)
            if not element.visible or not element.events then
                return
            end
            if position and (not hasRegion(nil, element) or hasRegion(nil, element) and not element.region:contains(position)) then
                return
            end
            __TS__ArrayForEach(
                events,
                function(____, eventName)
                    element:emit(eventName, event)
                end
            )
        end
    )
end
return ____exports
