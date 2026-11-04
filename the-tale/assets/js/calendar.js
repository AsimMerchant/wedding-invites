/* TALE · calendar.js — event data, .ics generation, maps links, copy-to-clipboard */
(function () {
  "use strict";
  window.TALE = window.TALE || {};

  TALE.EVENTS = {
    mehendi: {
      title: "Mehendi — Asim weds Femina",
      start: "20261204T110000", end: "20261204T150000",
      location: "53, Saffron, 5th Floor, Karimabad Society, Opposite Divine Child High School, Ghod Dod Road, Surat, Gujarat 395001",
      note: "From 11 AM onwards. Followed by lunch and dinner."
    },
    haldi: {
      title: "Haldi — Asim weds Femina",
      start: "20261205T113000", end: "20261205T143000",
      location: "Mahadev Hotel Restaurant & Banquets, Gadhada Road, near Madhusudan Dairy, Botad, Gujarat 364710",
      note: "11:30 AM. Followed by traditional lunch."
    },
    sangeet: {
      title: "Sangeet — Asim weds Femina",
      start: "20261205T200000", end: "20261205T230000",
      location: "Mahadev Hotel Restaurant & Banquets, Gadhada Road, near Madhusudan Dairy, Botad, Gujarat 364710",
      note: "8:00 PM. Followed by gala dinner."
    },
    baraat: {
      title: "Baraat — Asim weds Femina",
      start: "20261206T100000", end: "20261206T110000",
      location: "Mahadev Hotel Restaurant & Banquets, Gadhada Road, near Madhusudan Dairy, Botad, Gujarat 364710",
      note: "10:00 AM onwards."
    },
    nikaah: {
      title: "Nikaah — Asim weds Femina",
      start: "20261206T110000", end: "20261206T143000",
      location: "Mahadev Hotel Restaurant & Banquets, Gadhada Road, near Madhusudan Dairy, Botad, Gujarat 364710",
      note: "11:00 AM SHARP, Inshaallah. Followed by lunch from 12:30 PM onwards."
    },
    reception: {
      title: "Reception — Asim weds Femina",
      start: "20261207T200000", end: "20261207T230000",
      location: "Farohar Farms, Beside Royal Dine Restaurant, Opposite Pal RTO, Pal-Adajan, Surat, Gujarat 395009",
      note: "8 PM onwards. With blessings only — no gifts, covers or flowers, please."
    }
  };

  /* Venue map links — exact share links provided by the couple, used verbatim */
  TALE.VENUES = {
    mehendi: "https://maps.app.goo.gl/7suk4bqQHjQsB2R68",
    botad: "https://maps.app.goo.gl/PhcsoM54TXiE4vRT9",
    farohar: "https://maps.app.goo.gl/cbheG3zSHqYccMVQ8"
  };

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
