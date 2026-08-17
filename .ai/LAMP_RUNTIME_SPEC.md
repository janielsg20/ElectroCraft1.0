# LAMP RUNTIME / EXPORT SPEC — Core

## Target

`lamp`

Visible:
`Publicar > Exportar > LAMP`.

LAMP is a first-class ElectroCraft target.

## OSS stack

Generated server runtime:

- PHP 8.x baseline verified at F00/release;
- Slim Framework 4;
- PSR-7 implementation (Slim-Psr7 or approved equivalent);
- Slim-CSRF;
- PDO;
- MySQL/MariaDB;
- Composer for build/dependency resolution;
- PHP sessions for local/session auth state where used.

Do not write a proprietary router or middleware stack.

## Why Slim

Slim provides focused routing and middleware without imposing a large application architecture.
ElectroCraft still generates its own domain/application services from ExportIR.

## Generated structure

```text
app/
  Controllers/
  Middleware/
  Services/
  Repositories/
  Policies/
  Actions/
  Queries/
  Views/
  Support/
config/
database/
  migrations/
public/
  index.php
  assets/
routes/
storage/
composer.json
.env.example
README.md
```

`vendor/` may be included in a deployable ZIP if the user selects `Incluir dependencias`.

## Routing

ElectroCraftRouteDefinition -> Slim routes.

- path params;
- route name;
- guards -> middleware;
- 404/error;
- redirects;
- REST endpoints.

## Data

Internal ElectroCraft Data -> MySQL/MariaDB schema.

Default strategy:
generic record tables + explicit relations/taxonomies + typed indexes, matching canonical semantics.

Exporter may offer an optimized dedicated-table strategy only when validation proves safe.

External REST/GraphQL:
- PHP server adapter when credentials/CORS require server;
- browser client adapter only when safe.

## Queries

ElectroCraftQueryDefinition -> parameterized PDO query or external connector adapter.

All user data values use prepared statements.
Identifiers/operators come only from validated compiler allowlists.

## State

Map scopes:
- request/component -> PHP/JS transient;
- screen -> request/JS;
- session -> PHP session;
- persistent user/app -> DB when configured;
- client interactive state -> generated JS module.

Do not pretend all Zustand state maps 1:1 to PHP.

## Forms

Server rendered or progressive-enhancement forms.

- Zod source schema compiles to server validation rules;
- CSRF via Slim-CSRF;
- uploads validated;
- ActionGraph submit target compiler;
- field errors in Spanish when app locale requires.

## Auth / Permissions

Generated:
- password hashing/verifying via PHP APIs;
- session middleware;
- role/capability policy service;
- route/service enforcement;
- login/logout/profile routes.

## Actions

ActionGraph compiles to:
- PHP service/action handlers for server operations;
- generated browser JS for UI/client actions;
- explicit bridge/endpoints where a flow crosses client/server.

## Rendering

ElectroCraft components compile to semantic HTML/CSS and minimal JS.

Do not ship React unless the chosen LAMP profile explicitly selects a React front-end.

## Security

- PDO prepared statements;
- Slim-CSRF;
- output escaping;
- validated uploads;
- secure sessions/cookies;
- permission middleware;
- `.env` secrets;
- production error details off.

## Verification

1. composer validate/install;
2. PHP syntax/static checks;
3. migration on clean MySQL/MariaDB fixture;
4. HTTP routing fixture;
5. CRUD/forms/auth/permission tests;
6. CSRF negative test;
7. SQL injection fixture;
8. same canonical app parity fixture.
