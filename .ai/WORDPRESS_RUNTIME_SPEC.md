# WORDPRESS EXPORT SPEC — Core

Target:
`wordpress`.

Visible:
`Publicar > Exportar > WordPress`.

WordPress is a first-class ElectroCraft export target.

## Generated deliverables

1. **Block Theme ZIP**
2. **Companion Plugin ZIP**

Both are required for a project using dynamic ElectroCraft capabilities.

## Modern WordPress strategy

Do not generate a classic-theme architecture as the default.

Theme:
- `theme.json` current supported version;
- `/templates`;
- `/parts`;
- `/patterns`;
- `/styles`;
- `style.css`;
- optional `functions.php` only when theme-specific behavior is necessary.

Companion Plugin:
- content/data registrations;
- taxonomies;
- metadata;
- custom tables when justified;
- roles/capabilities;
- REST endpoints;
- forms/actions;
- migrations;
- administration features;
- custom dynamic blocks only when native/core blocks cannot represent semantics.

## Ownership

WordPress native APIs own:
- blocks;
- block templates;
- theme.json;
- CPTs;
- taxonomies;
- metadata;
- users/roles/capabilities;
- REST API;
- Media Library;
- Settings/Options;
- nonces;
- hooks;
- WP Cron where mapped.

ElectroCraft owns only the compiler/mapping from ExportIR.

## Content mapping

Data Model decision ladder:

1. built-in WordPress entity if semantically exact;
2. Custom Post Type;
3. taxonomy;
4. post/user/term metadata;
5. Options API for global singleton config;
6. custom table only for relations/high-volume/shape that is a poor fit for post/meta.

Custom Post Types live in the Companion Plugin, not the Theme.

## Visual mapping

Decision ladder:

1. core WordPress block;
2. block attributes/styles;
3. pattern;
4. template/template part;
5. theme.json token/style;
6. dynamic block;
7. custom block only when required.

Do not convert every ElectroCraft component into a custom WordPress block.

## Routes / Screens

Map:
- public content screens -> block templates/custom templates;
- archives -> archive templates;
- 404 -> 404 template;
- special app routes -> rewrite/REST/page template strategy according to capability;
- Administration -> WP Admin screens when semantics fit, otherwise plugin app screen.

## Queries

Use:
- WP_Query / term/user queries;
- REST API;
- custom-table repositories only when the data compiler selected custom tables.

Never emit raw SQL when native APIs cover the query.

## Forms / Actions

Forms:
- nonce;
- capability checks;
- validation/sanitization;
- REST route or admin-post strategy;
- ActionGraph compiler.

External data:
WordPress HTTP API server-side when secrets or server execution are required.

## Administration

Prefer native WordPress admin/data APIs and `@wordpress/*` packages for plugin UI.

Do not bundle a second React copy when WordPress-provided dependencies can be externalized.

## Security

Every mutation:
- nonce where applicable;
- capability check;
- sanitize input;
- validate;
- escape output;
- prepared `$wpdb` queries only for custom SQL.

## Lifecycle

Plugin:
- activation;
- versioned migration;
- deactivation;
- uninstall policy.

Uninstall never deletes user data without explicit generated policy.

## Verification

Use `wp-env` or approved current WordPress test environment:

1. start clean WordPress fixture;
2. install Theme ZIP;
3. install/activate Companion Plugin;
4. run migrations;
5. verify CPT/tax/meta/custom tables;
6. verify front-end templates;
7. verify forms/actions;
8. verify roles/capabilities/nonces;
9. verify REST endpoints;
10. deactivate/reactivate/upgrade;
11. test uninstall policy;
12. run same canonical app parity fixture.
