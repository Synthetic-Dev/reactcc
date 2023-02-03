local ____lualib = require("lualib_bundle")
local __TS__SymbolRegistryFor = ____lualib.__TS__SymbolRegistryFor
local __TS__SymbolRegistryKeyFor = ____lualib.__TS__SymbolRegistryKeyFor
local ____exports = {}
____exports.INTERNAL = __TS__SymbolRegistryFor("ReactCC_INTERNAL_ACCESS_KEY")
____exports.INTERNAL_RECONCILER = __TS__SymbolRegistryFor("ReactCC_INTERNAL_COMPONENT_RECONCILER_KEY")
____exports.FRAGMENT_SYMBOL = __TS__SymbolRegistryFor("ReactCC.Fragment")
____exports.PROVIDER_SYMBOL = __TS__SymbolRegistryFor("ReactCC.ContextProvider")
____exports.CONSUMER_SYMBOL = __TS__SymbolRegistryFor("ReactCC.ContextConsumer")
return ____exports
