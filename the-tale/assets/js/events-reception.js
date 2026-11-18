/* TALE · events-reception.js — Reception-only event data for the reception
   invite. Deliberately contains no other event; keep it that way. */
(function () {
  "use strict";
  window.TALE = window.TALE || {};

  TALE.EVENTS = {
    reception: {
      title: "Reception — Asim weds Femina",
      start: "20261207T200000", end: "20261207T230000",
      location: "Farohar Farms, Beside Royal Dine Restaurant, Opposite Pal RTO, Pal-Adajan, Surat, Gujarat 395009",
      note: "8 PM onwards. With blessings only — no gifts, covers or flowers, please."
    }
  };

  /* Venue map link — exact share link provided by the couple, used verbatim */
  TALE.VENUES = {
    farohar: "https://maps.app.goo.gl/cbheG3zSHqYccMVQ8"
  };
})();