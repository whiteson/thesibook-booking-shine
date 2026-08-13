<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Validates short-lived HS256 SSO tokens from the ThesiBook control plane.
 */
class Thesibook_sso_token
{
    /**
     * @return array<string, mixed>|null
     */
    public function verify_token(string $token): ?array
    {
        $secret = $this->secret();

        if ($secret === '') {
            log_message('error', 'ThesiBook SSO secret is not configured.');

            return null;
        }

        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$encoded_header, $encoded_payload, $encoded_signature] = $parts;

        $signed = $encoded_header . '.' . $encoded_payload;
        $expected = $this->base64url_encode(hash_hmac('sha256', $signed, $secret, true));

        if (!hash_equals($expected, $encoded_signature)) {
            return null;
        }

        $payload = json_decode($this->base64url_decode($encoded_payload), true);

        if (!is_array($payload)) {
            return null;
        }

        if (($payload['purpose'] ?? '') !== 'ea_admin_sso') {
            return null;
        }

        $expires = (int) ($payload['exp'] ?? 0);

        if ($expires > 0 && $expires < time()) {
            return null;
        }

        $email = strtolower(trim((string) ($payload['email'] ?? '')));
        $slug = trim((string) ($payload['slug'] ?? ''));

        if ($email === '' || $slug === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        return [
            'email' => $email,
            'slug' => $slug,
        ];
    }

    protected function secret(): string
    {
        if (defined('THESIBOOK_SSO_SECRET') && THESIBOOK_SSO_SECRET !== '') {
            return (string) THESIBOOK_SSO_SECRET;
        }

        $from_env = getenv('BOOKING_JWT_SECRET');

        return is_string($from_env) ? $from_env : '';
    }

    protected function base64url_decode(string $value): string
    {
        $remainder = strlen($value) % 4;

        if ($remainder) {
            $value .= str_repeat('=', 4 - $remainder);
        }

        return (string) base64_decode(strtr($value, '-_', '+/'), true);
    }

    protected function base64url_encode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
