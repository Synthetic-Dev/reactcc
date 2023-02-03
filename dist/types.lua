--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____Frame = require("components.Frame")
local Frame = ____Frame.default
local ____Image = require("components.Image")
local Image = ____Image.default
local ____Line = require("components.Line")
local Line = ____Line.default
local ____Text = require("components.Text")
local Text = ____Text.default
local ____symbols = require("symbols")
local INTERNAL = ____symbols.INTERNAL
____exports.TextAlignment = TextAlignment or ({})
____exports.TextAlignment.LEFT = 0
____exports.TextAlignment[____exports.TextAlignment.LEFT] = "LEFT"
____exports.TextAlignment.CENTER = 1
____exports.TextAlignment[____exports.TextAlignment.CENTER] = "CENTER"
____exports.TextAlignment.RIGHT = 2
____exports.TextAlignment[____exports.TextAlignment.RIGHT] = "RIGHT"
____exports.INTRINSIC_ELEMENTS = {line = Line, frame = Frame, text = Text, image = Image}
return ____exports
