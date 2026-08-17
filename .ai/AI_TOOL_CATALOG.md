# AI TOOL CATALOG — ElectroCraft

AI SDK tools are generated from this allowlist.

# Read tools

- get_app_summary
- get_current_screen
- get_selected_nodes
- list_component_catalog
- get_component_contract
- get_theme_tokens
- get_navigation_definition
- get_data_models
- get_data_source_schema
- get_query_definition
- get_state_definitions
- get_action_graph
- get_admin_screen
- search_reusable_library
- get_media_metadata

Read tools return sanitized data only.

# Draft tools

Operate only on AIDraftWorkspace:

- draft_create_screen
- draft_patch_screen
- draft_create_block
- draft_create_component
- draft_create_template
- draft_create_theme
- draft_create_navigation_patch
- draft_create_data_model_patch
- draft_create_query
- draft_create_form
- draft_create_action_graph
- draft_create_admin_screen
- draft_create_app_template
- draft_create_extension
- draft_create_demo_records
- draft_stage_media

# Validation tools

- validate_draft
- analyze_compatibility
- render_draft_preview
- summarize_draft_diff

# Explicitly forbidden

Never expose as model tools:

- apply_to_project
- write_database
- execute_sql
- execute_javascript
- write_file
- install_package
- install_extension
- deploy
- delete_project
- access_secret
- read_entire_project_unfiltered

# Host execution

AI SDK receives tool definitions.
When the model proposes a tool:
1. AI SDK parses tool input;
2. ElectroCraft validates input schema;
3. checks tool allowlist;
4. checks user/project permission;
5. executes host function;
6. sanitizes result;
7. returns result to AI SDK/model.

The model never receives canonical service objects.
