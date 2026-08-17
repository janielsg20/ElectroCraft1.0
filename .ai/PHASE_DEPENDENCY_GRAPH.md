# PHASE DEPENDENCY GRAPH — ElectroCraft Eighth Final

- `F00` <- START
- `F01` <- F00
- `F02` <- F01
- `F03` <- F02
- `F04` <- F03
- `F05` <- F04
- `F06` <- F05
- `F07` <- F06
- `F08` <- F07
- `F09` <- F08
- `F10` <- F09
- `F11` <- F10
- `F12` <- F11
- `F13` <- F12
- `F14` <- F13
- `F15` <- F14
- `F16` <- F15
- `F17` <- F16
- `F18` <- F17
- `F19` <- F18
- `F20` <- F19
- `F21` <- F20
- `F22` <- F21
- `F23` <- F22
- `F24` <- F23
- `F25` <- F24
- `F26` <- F25
- `F27` <- F26

## Export critical chain
`F20 TargetRegistry -> F21 Web/Local/Static/PWA -> F22/F23 Expo Android/iOS -> F24 Capacitor -> F25 LAMP -> F26 WordPress -> F27 parity/release`.

Every export destination is Core and participates in F27.
