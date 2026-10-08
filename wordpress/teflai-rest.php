<?php
/**
 * Plugin Name: TEFL.ai Headless REST
 * Description: Read-only REST endpoints for the headless Next.js front-end.
 *   Currently: public certificate verification wrapping the existing LearnDash
 *   / TEFL verification logic. Drop this file in wp-content/mu-plugins/.
 * Version: 1.0.0
 * Author: TEFL.ai
 *
 * Endpoint:
 *   GET /wp-json/teflai/v1/verify-certificate?number=TEFL-YYYY-XXXXX
 *   → { verified: bool, student_name, course_title, issue_date, certificate_number }
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'rest_api_init', function () {
	register_rest_route( 'teflai/v1', '/verify-certificate', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true', // public, read-only
		'args'                => array(
			'number' => array( 'required' => true, 'type' => 'string' ),
		),
		'callback'            => 'teflai_rest_verify_certificate',
	) );

	// Current-user / session state for the headless front-end header.
	register_rest_route( 'teflai/v1', '/me', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => 'teflai_rest_me',
	) );
} );

/**
 * Allowed-origin CORS for the teflai/v1 routes so the Next.js front-end can read
 * session state with credentials. Set TEFLAI_ALLOWED_ORIGINS in wp-config.php
 * (comma-separated) to add origins, e.g. the Vercel + production URLs.
 */
add_action( 'rest_api_init', function () {
	remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
	add_filter( 'rest_pre_serve_request', function ( $served ) {
		$origin = get_http_origin();
		$allowed = array( 'https://tefl.ai', 'https://www.tefl.ai', 'https://tefl-ai.vercel.app' );
		if ( defined( 'TEFLAI_ALLOWED_ORIGINS' ) ) {
			$allowed = array_merge( $allowed, array_map( 'trim', explode( ',', TEFLAI_ALLOWED_ORIGINS ) ) );
		}
		if ( $origin && in_array( $origin, $allowed, true ) ) {
			header( 'Access-Control-Allow-Origin: ' . $origin );
			header( 'Access-Control-Allow-Credentials: true' );
			header( 'Vary: Origin' );
			header( 'Access-Control-Allow-Methods: GET, OPTIONS' );
			header( 'Access-Control-Allow-Headers: Content-Type, X-WP-Nonce' );
		}
		return $served;
	} );
}, 15 );

/** Returns the logged-in user's basic profile (based on the WP auth cookie),
 *  or { logged_in: false }. Read-only, no sensitive data. */
function teflai_rest_me() {
	if ( ! is_user_logged_in() ) {
		return new WP_REST_Response( array( 'logged_in' => false ), 200 );
	}
	$u = wp_get_current_user();
	$account = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' );
	return new WP_REST_Response( array(
		'logged_in'    => true,
		'display_name' => $u->display_name ?: $u->user_login,
		'first_name'   => $u->first_name,
		'avatar'       => get_avatar_url( $u->ID, array( 'size' => 48 ) ),
		'account_url'  => $account,
		'logout_url'   => wp_logout_url( home_url() ),
	), 200 );
}

function teflai_rest_verify_certificate( WP_REST_Request $request ) {
	$number = sanitize_text_field( (string) $request->get_param( 'number' ) );
	if ( $number === '' ) {
		return new WP_REST_Response( array( 'verified' => false ), 200 );
	}

	// 1) Preferred: LearnDash Certificate Verify & Share plugin.
	if ( function_exists( 'ld_cvss_verify_certificate' ) ) {
		$result = ld_cvss_verify_certificate( $number );
		if ( $result && ! empty( $result['verified'] ) ) {
			return new WP_REST_Response( array(
				'verified'           => true,
				'student_name'       => $result['user_name'] ?? 'N/A',
				'course_title'       => $result['course_title'] ?? 'N/A',
				'issue_date'         => $result['issue_date'] ?? 'N/A',
				'certificate_number' => $number,
			), 200 );
		}
	}

	// 2) Fallback: the certificate_number postmeta written on certificate creation
	//    (format TEFL-YYYY-XXXXX — see child theme tefl_save_certificate_number()).
	global $wpdb;
	$post_id = $wpdb->get_var( $wpdb->prepare(
		"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = 'certificate_number' AND meta_value = %s LIMIT 1",
		$number
	) );

	if ( $post_id ) {
		$user_id      = get_post_meta( $post_id, 'user_id', true );
		$course_id    = get_post_meta( $post_id, 'course_id', true );
		$user         = $user_id ? get_userdata( $user_id ) : null;
		$course_title = $course_id ? get_the_title( $course_id ) : 'TEFL Certification Course';
		return new WP_REST_Response( array(
			'verified'           => true,
			'student_name'       => $user ? $user->display_name : 'N/A',
			'course_title'       => $course_title ?: 'TEFL Certification Course',
			'issue_date'         => get_the_date( 'F j, Y', $post_id ),
			'certificate_number' => $number,
		), 200 );
	}

	// 3) Fallback: usermeta lookup (learndash_certificate_* keys).
	$um = $wpdb->get_row( $wpdb->prepare(
		"SELECT user_id FROM {$wpdb->usermeta} WHERE meta_value = %s AND meta_key LIKE %s LIMIT 1",
		$number, 'learndash_certificate_%'
	) );
	if ( $um && $um->user_id ) {
		$user = get_userdata( $um->user_id );
		return new WP_REST_Response( array(
			'verified'           => true,
			'student_name'       => $user ? $user->display_name : 'N/A',
			'course_title'       => 'TEFL Certification Course',
			'issue_date'         => date_i18n( 'F j, Y' ),
			'certificate_number' => $number,
		), 200 );
	}

	return new WP_REST_Response( array( 'verified' => false ), 200 );
}
