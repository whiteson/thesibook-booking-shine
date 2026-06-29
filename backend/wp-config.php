<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'thesibook_booking_shine_backend' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'password' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
define('AUTH_KEY',         'OVgvaR{F$R-Kp|&AKz7PJ.)KZ2Fb+s9+5!G61]z,i8N9nvA>Y|+~`Dw!dFhtazO%');
define('SECURE_AUTH_KEY',  'btWt}*G?]{,b|A58di)6+KVYwVj|kX[YCl~F8$Sl1y #QSL[9$krec?hG.W2Bn)6');
define('LOGGED_IN_KEY',    '%Nts&Lg`N26ESP)2Dn=:` 5Vets!j.}EEZ_GI}p$o(!Uw4(#PgNl^1L5ghwUt hm');
define('NONCE_KEY',        '1#M0)-S:y5&Op/u-P9W6%iH-(I~0xdg+79oZ[{HU|X(_4oTp,Yp;ai5lcvj<PKHW');
define('AUTH_SALT',        'f?r#H48jD$b5KK[S]vciS{oZ|@l+OHBm<{m5UVYZ-Kk#|+rjVeJzb$w>cx;(:B`+');
define('SECURE_AUTH_SALT', '1Z8+kcawpNL_KfQT.HAOCd.,:~0j><pjm`Ue{IZHcv!b1VqY4dm*idSVrFYC6RVZ');
define('LOGGED_IN_SALT',   'GKd$$Y8|cTT|LjMYd.^Wi$J|v8n#1/>Mk357Fa4JH`^+hxBY_Em_7/;)C`[_f=x3');
define('NONCE_SALT',       '8^v,I0^<6^aMW-@*mXfl--dW@q,|~zW0%h3GAS7gGDFl,0zKKxc,,* jyIJ<=NLs');
