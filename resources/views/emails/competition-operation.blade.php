@php
    $team = data_get($payload, 'team', []);
    $competition = data_get($payload, 'competition', []);
    $announcement = data_get($payload, 'announcement', []);
    $title = $announcement['title'] ?? 'Pembaruan Kompetisi ISAC 2026';
    $message = $announcement['message'] ?? 'Terdapat pembaruan pada perjalanan kompetisi Team Anda.';
    $dashboardUrl = rtrim(config('app.url'), '/').'/dashboard';
    $logoUrl = rtrim(config('app.url'), '/').'/logo.png';
@endphp
<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;background:#090b15;color:#eff2ff;font-family:Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#090b15;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#151827;border:1px solid #30364f;border-radius:24px;overflow:hidden;">
<tr><td style="padding:30px 32px 20px;background:linear-gradient(135deg,#23155f,#151827);">
<img src="{{ $logoUrl }}" alt="ISAC 2026" width="160" style="display:block;border:0;max-width:160px;height:auto;">
<p style="margin:18px 0 0;color:#b9b5ff;font-size:12px;font-weight:700;letter-spacing:1.2px;">INFORMATION SYSTEMS AIRLANGGA COMPETITION 2026</p>
<h1 style="margin:10px 0 0;color:#ffffff;font-size:26px;line-height:1.25;">{{ $title }}</h1>
</td></tr>
<tr><td style="padding:30px 32px;color:#e4e7f4;font-size:15px;line-height:1.65;">
<p style="margin:0 0 16px;">Halo, <strong>{{ $team['name'] ?? 'Team ISAC' }}</strong>.</p>
<p style="margin:0 0 22px;">{!! nl2br(e($message)) !!}</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #30364f;border-radius:16px;background:#0f1220;">
<tr><td style="padding:16px;">
<p style="margin:0 0 6px;color:#aeb6cf;font-size:12px;">KOMPETISI</p>
<p style="margin:0;color:#ffffff;font-weight:700;">{{ $competition['name'] ?? 'ISAC 2026' }}</p>
<p style="margin:10px 0 6px;color:#aeb6cf;font-size:12px;">BATCH</p>
<p style="margin:0;color:#ffffff;font-weight:700;">{{ $competition['batch'] ?? '—' }}</p>
<p style="margin:10px 0 6px;color:#aeb6cf;font-size:12px;">TAHAP</p>
<p style="margin:0;color:#ffffff;font-weight:700;">{{ data_get($payload, 'statusAfter') ?? data_get($payload, 'currentStage') ?? '—' }}</p>
</td></tr></table>
<p style="margin:26px 0 0;"><a href="{{ $dashboardUrl }}" style="display:inline-block;border-radius:999px;background:#a7ff5a;color:#141a0c;padding:12px 20px;text-decoration:none;font-weight:700;">Buka Team Dashboard</a></p>
<p style="margin:26px 0 0;color:#aeb6cf;font-size:12px;">Jika membutuhkan bantuan, hubungi panitia melalui kanal resmi ISAC 2026.</p>
</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid #30364f;color:#8d95ae;font-size:11px;text-align:center;">© Information Systems Airlangga Competition 2026 · HIMSI UNAIR</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
