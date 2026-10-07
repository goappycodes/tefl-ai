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
} );

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
