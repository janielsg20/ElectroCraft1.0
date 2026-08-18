<?php
/**
 * Plugin Name: ElectroCraft Companion POC
 * Description: M00.10 CPT, REST y bloque dinámico para Appointment.
 * Version: 0.0.1
 * Requires at least: 7.0
 * Requires PHP: 8.2
 * Text Domain: electrocraft-companion
 */
declare(strict_types=1);
if (!defined('ABSPATH')) { exit; }
function electrocraft_poc_register_content(): void { register_post_type('appointment',[ 'labels'=>['name'=>'Citas','singular_name'=>'Cita'], 'public'=>true, 'show_in_rest'=>true, 'supports'=>['title','custom-fields'], 'capability_type'=>'post', 'map_meta_cap'=>true ]); }
add_action('init','electrocraft_poc_register_content');
function electrocraft_poc_register_rest(): void { register_rest_route('electrocraft/v1','/appointments',[ [ 'methods'=>WP_REST_Server::READABLE, 'callback'=>'electrocraft_poc_rest_list', 'permission_callback'=>static fn(): bool => current_user_can('edit_posts') ], [ 'methods'=>WP_REST_Server::CREATABLE, 'callback'=>'electrocraft_poc_rest_create', 'permission_callback'=>static fn(): bool => current_user_can('edit_posts'), 'args'=>[ 'clientName'=>['type'=>'string','required'=>true,'sanitize_callback'=>'sanitize_text_field'], 'startsAt'=>['type'=>'string','required'=>true,'sanitize_callback'=>'sanitize_text_field'] ] ] ]); }
add_action('rest_api_init','electrocraft_poc_register_rest');
function electrocraft_poc_rest_list(WP_REST_Request $request): WP_REST_Response { $query=new WP_Query(['post_type'=>'appointment','post_status'=>'publish','posts_per_page'=>20,'orderby'=>'date','order'=>'ASC']); $data=array_map(static fn(WP_Post $post): array => ['id'=>$post->ID,'clientName'=>$post->post_title,'startsAt'=>(string)get_post_meta($post->ID,'starts_at',true)],$query->posts); return new WP_REST_Response(['data'=>$data,'meta'=>['irFingerprint'=>'01faceab0d9309d7']],200); }
function electrocraft_poc_rest_create(WP_REST_Request $request): WP_REST_Response|WP_Error { $client=(string)$request->get_param('clientName'); $starts=(string)$request->get_param('startsAt'); $id=wp_insert_post(['post_type'=>'appointment','post_status'=>'publish','post_title'=>$client],true); if (is_wp_error($id)) return $id; update_post_meta($id,'starts_at',sanitize_text_field($starts)); return new WP_REST_Response(['data'=>['id'=>$id,'clientName'=>$client,'startsAt'=>$starts]],201); }
function electrocraft_poc_render_form(): string { $nonce=wp_create_nonce('wp_rest'); return '<form class="electrocraft-appointment-form" data-rest-nonce="'.esc_attr($nonce).'" method="post"><label>Cliente <input name="clientName" required></label><label>Inicio <input name="startsAt" type="datetime-local" required></label><button type="submit">Crear cita</button></form>'; }
function electrocraft_poc_register_block(): void { register_block_type('electrocraft/appointment-form',['api_version'=>3,'render_callback'=>'electrocraft_poc_render_form']); }
add_action('init','electrocraft_poc_register_block');
function electrocraft_poc_activate(): void { electrocraft_poc_register_content(); update_option('electrocraft_poc_schema_version','0.0.1',false); flush_rewrite_rules(); }
register_activation_hook(__FILE__,'electrocraft_poc_activate');
function electrocraft_poc_deactivate(): void { flush_rewrite_rules(); }
register_deactivation_hook(__FILE__,'electrocraft_poc_deactivate');
