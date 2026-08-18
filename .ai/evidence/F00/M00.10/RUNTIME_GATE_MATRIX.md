# M00.10 runtime gate matrix

| Gate | Local | GitHub Actions required | Success marker |
|---|---|---|---|
| M00.9 Scalar real parser | blocked by npm DNS | yes | `PASS_REAL_OPENAPI_PARSER` |
| ExportIR/static parity | PASS | yes/repeated | `PASS_STATIC_PARITY` |
| Capacitor real CLI | unavailable dependency | yes | `PASS_REAL_CAPACITOR_SYNC` |
| LAMP Slim/PDO/CSRF/MySQL | PHP syntax only | yes | `PASS_REAL_LAMP` |
| WordPress wp-env | Docker unavailable | yes | `PASS_REAL_WORDPRESS` |
| Combined closure | pending | yes | `PASS_M00_10_CLOSURE_GATE` |

M00.10 cannot be accepted if any runtime gate is skipped or softened to a placeholder.
