<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode Reset Password ISAC 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

                    {{-- Header --}}
                    <tr>
                        <td style="background-color: #0f172a; padding: 32px 40px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 1px;">
                                ISAC 2026
                            </h1>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="background-color: #ffffff; padding: 40px;">
                            <h2 style="margin: 0 0 8px; color: #0f172a; font-size: 20px; font-weight: 600;">
                                Kode Verifikasi Anda
                            </h2>
                            <p style="margin: 0 0 32px; color: #64748b; font-size: 14px; line-height: 1.5;">
                                Gunakan kode berikut untuk mereset password Anda. Jangan bagikan kode ini kepada siapa pun.
                            </p>

                            {{-- OTP Code Box --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 0 0 32px;">
                                        <div style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px 32px; display: inline-block;">
                                            <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; color: #0f172a; letter-spacing: 8px;">
                                                {{ $code }}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            {{-- Expiry Note --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 16px;">
                                        <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                                            Kode ini berlaku selama <strong>5 menit</strong>. Segera gunakan sebelum kedaluwarsa.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px 40px; border-top: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 13px; line-height: 1.5;">
                                Jika Anda tidak meminta reset password, abaikan email ini. Password Anda tidak akan berubah.
                            </p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 12px;">
                                &copy; {{ date('Y') }} ISAC 2026. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
