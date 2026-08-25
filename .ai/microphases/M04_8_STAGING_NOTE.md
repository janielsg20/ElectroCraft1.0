# M04.8 staging dependency note

M04.8 se implementa en esta rama como trabajo dependiente mientras la PR #46 (M04.7 Workspace preferences) espera runner de GitHub Actions.

- Base funcional requerida: `64c16c9ffea3915d1a58f31b578e22ac8dab894d`.
- M04.8 no se considera `ACTIVE` ni `COMPLETADA` hasta que M04.7 cierre `GREEN` y se integre en `main`.
- Esta rama existe para validar anticipadamente contratos, migración v5, deduplicación de object versions, historial y Restore sin alterar el tracking canónico.
- No actualizar `.ai/TRACKING.md` ni `.ai/STATE.md` desde esta rama antes de cumplir la precondición anterior.
