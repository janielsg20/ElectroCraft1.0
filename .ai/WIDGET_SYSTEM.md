# COMPONENT / PALETTE SYSTEM — ElectroCraft

Source:
PALETTE_CATALOG_MATRIX.md.

Every item declares:
- visible Spanish name;
- category;
- implementation kind;
- componentRef/preset/block;
- props/slots;
- bindings;
- events/actions;
- target capabilities;
- help descriptor.

Implementation kinds:
Core / Preset / Block / Binding / Alias / Action / Provider.

A new Core component requires proof a preset/block cannot represent the required semantics.

Puck component config maps to ElectroCraft component registry.
Puck is not canonical component ownership.

AI generation consumes the same registry and must prefer existing primitives before proposing a new component.
