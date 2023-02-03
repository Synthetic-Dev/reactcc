--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
____exports.Effect = Effect or ({})
____exports.Effect.PLACEMENT = 0
____exports.Effect[____exports.Effect.PLACEMENT] = "PLACEMENT"
____exports.Effect.UPDATE = 1
____exports.Effect[____exports.Effect.UPDATE] = "UPDATE"
____exports.Effect.DELETION = 2
____exports.Effect[____exports.Effect.DELETION] = "DELETION"
____exports.Effect.NONE = 3
____exports.Effect[____exports.Effect.NONE] = "NONE"
____exports.HookType = HookType or ({})
____exports.HookType.STATE = 0
____exports.HookType[____exports.HookType.STATE] = "STATE"
____exports.HookType.EFFECT = 1
____exports.HookType[____exports.HookType.EFFECT] = "EFFECT"
____exports.HookType.CONTEXT = 2
____exports.HookType[____exports.HookType.CONTEXT] = "CONTEXT"
____exports.HookType.MEMO = 3
____exports.HookType[____exports.HookType.MEMO] = "MEMO"
____exports.EffectHookExecution = EffectHookExecution or ({})
____exports.EffectHookExecution.IMMEDIATE = 0
____exports.EffectHookExecution[____exports.EffectHookExecution.IMMEDIATE] = "IMMEDIATE"
____exports.EffectHookExecution.DEFER = 1
____exports.EffectHookExecution[____exports.EffectHookExecution.DEFER] = "DEFER"
return ____exports
