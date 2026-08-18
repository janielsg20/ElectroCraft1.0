<?php
if (!defined('WP_UNINSTALL_PLUGIN')) { exit; }
// Intencionalmente no elimina contenido del usuario. Solo limpia metadata técnica del POC.
delete_option('electrocraft_poc_schema_version');
