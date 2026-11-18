/* TALE · calendar.js — .ics generation, maps links, copy-to-clipboard.
   Event data is supplied per page: events.js (full invite) or
   events-reception.js (reception-only invite). */
(function () {
  "use strict";
  window.TALE = window.TALE || {};

  TALE.toast = function (msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2400);
  };

  function icsEscape(s) {
    return String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  }

  function buildICS(ev) {
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return [
      "BEGIN:VCALENDAR", "VERSION:2.0",
      "PRODID:-//The Tale of F and A//E-Invite//EN",
      "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:" + stamp + "-tale@thetaleoffanda",
      "DTSTAMP:" + stamp,
      "DTSTART:" + ev.start + "+0530",
      "DTEND:" + ev.end + "+0530",
      "SUMMARY:" + icsEscape(ev.title),
      "LOCATION:" + icsEscape(ev.location),
      "DESCRIPTION:" + icsEscape(ev.note + " — #TheTaleofFandA"),
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  function downloadICS(key) {
    var ev = TALE.EVENTS[key];
    if (!ev) return;
    var blob = new Blob([buildICS(ev)], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tale-of-fanda-" + key + ".ics";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    TALE.toast("Added to your calendar file");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { TALE.toast("Address copied"); }, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); TALE.toast("Address copied"); }
      catch (e) { TALE.toast("Long-press to copy"); }
      ta.remove();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Maps links — venue keys map to the couple's exact share links
    document.querySelectorAll("[data-maps]").forEach(function (a) {
      var venue = TALE.VENUES && TALE.VENUES[a.getAttribute("data-maps")];
      a.href = venue || "#";
    });
    // Calendar downloads
    document.querySelectorAll("[data-ics]").forEach(function (b) {
      b.addEventListener("click", function () { downloadICS(b.getAttribute("data-ics")); });
    });
    // Copy address
    document.querySelectorAll("[data-copy]").forEach(function (b) {
      b.addEventListener("click", function () { copyText(b.getAttribute("data-copy")); });
    });
  });
})();
