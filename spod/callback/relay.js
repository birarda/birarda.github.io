"use strict";

// Whether `host` (a URL's hostname) is on a local network: a private,
// loopback, link-local or CGNAT (Tailscale) address, or a name that public
// DNS doesn't have. This page follows nothing else, so it can't be used to
// send people to an arbitrary site.
function isLocal(host) {
  host = host.toLowerCase();
  if (host.startsWith("[")) {
    const ip = host.slice(1, -1);
    return ip === "::1" || /^f[cd]/.test(ip) || /^fe[89ab]/.test(ip);
  }
  const v4 = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 169 && b === 254) || (a === 100 && b >= 64 && b <= 127);
  }
  return !host.includes(".") || /\.(local|lan|home\.arpa|internal)$/.test(host);
}

// The callback of the spod plugin the sign-in started on, from the state,
// or null. Only a plugin's callback, `/plugins/<id>/callback`, on a local
// network, so this page can't open any other page.
function returnAddress(state) {
  const at = state.indexOf("~");
  if (at < 0) return null;
  try {
    const url = new URL(state.slice(at + 1));
    if ((url.protocol === "http:" || url.protocol === "https:") && isLocal(url.hostname) &&
        /^\/plugins\/[a-z0-9-]+\/callback$/.test(url.pathname)) {
      return url.origin + url.pathname;
    }
  } catch (e) {}
  return null;
}

const params = new URLSearchParams(location.search);
const target = returnAddress(params.get("state") || "");

// Shown if there's nowhere to go, and after coming back to this page from a
// spod page that didn't open.
function showManual(why) {
  document.getElementById("why").textContent = why;
  document.getElementById("address").value = location.href;
  document.getElementById("going").hidden = true;
  document.getElementById("manual").hidden = false;
}
document.getElementById("copy").addEventListener("click", () => {
  const field = document.getElementById("address");
  field.select();
  (navigator.clipboard ? navigator.clipboard.writeText(field.value) : Promise.reject())
    .catch(() => document.execCommand("copy"));
});

if (!params.has("code") && !params.has("error")) {
  showManual("This page is for coming back to spod after signing in, but nothing was sent back.");
} else if (!target) {
  showManual("This page couldn’t tell which spod to go back to.");
} else if (sessionStorage.getItem("spod-relayed") === location.href) {
  // Back here after going on: spod's page probably didn't open.
  showManual("If spod’s page didn’t open, this phone or computer may not be on the same network as spod.");
} else {
  const next = target + location.search;
  document.getElementById("target").textContent = new URL(target).host;
  document.getElementById("go").href = next;
  document.getElementById("going").hidden = false;
  try { sessionStorage.setItem("spod-relayed", location.href); } catch (e) {}
  // assign, not replace, so Back returns here with the address to copy.
  location.assign(next);
}
