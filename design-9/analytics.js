/* ============================================================================
   PRIMAL MOVES VENICE - MEASUREMENT
   Named events pushed into dataLayer. That is all this file does: no GA4 tag,
   no measurement ID, no network call of its own. GTM (GTM-T6LRVCFQ) is
   configured against the event and parameter names below and builds the GA4
   tags from them, so a change here needs a matching change there.

   THE SIX EVENTS
     begin_booking         any outbound click to mindbodyonline.com
     begin_online_trial    app.primalmoves.com/register/trial/
     view_schedule         the timetable comes into view (once per page view)
     select_schedule_day   a day chosen from the schedule's day rail
     contact_click         phone, SMS, WhatsApp or email
     event_rsvp_click      an outbound click to Luma

   TWO RULES THIS FILE KEEPS
     No visitor data. Class names, teacher names and section names go out;
     nothing that identifies the person clicking. The mailto links carry the
     studio's own address, so contact_click deliberately does not send the
     href at all.

     One listener on document, not handlers on elements. The timetable, the
     events calendar and the published photographs are all rendered by
     config.js after this file has run, and the schedule re-renders when a
     day is chosen. Delegation means those links are covered the moment they
     exist, with nothing to rebind.
   ========================================================================== */
(function () {
  "use strict";

  var dl = (window.dataLayer = window.dataLayer || []);
  function push(o) { try { dl.push(o); } catch (e) { /* never break a click */ } }

  function el(node) {
    // click targets can be text nodes or SVG bits; walk up to a real element
    while (node && node.nodeType !== 1) node = node.parentNode;
    return node && node.closest ? node : null;
  }
  function text(scope, sel) {
    var n = scope && scope.querySelector ? scope.querySelector(sel) : null;
    return n ? n.textContent.trim() : "";
  }
  function host(href) {
    try { return new URL(href, location.href).hostname.toLowerCase(); }
    catch (e) { return ""; }
  }

  /* ---- where on the page the click happened ------------------------------
     header and footer are structural. The timetable is its own thing wherever
     it sits. Everything else takes the page's name, which is what the section
     list in the brief is really describing.                               */
  function sectionOf(node) {
    if (node.closest("header")) return "header";
    if (node.closest("footer")) return "footer";
    if (node.closest("#schedule,[data-pm-schedule],.sched-wrap,.daybar")) return "schedule";
    var b = document.body.classList;
    if (b.contains("page-memberships")) return "memberships";
    if (b.contains("page-studio")) return "studio";
    return "body";
  }

  /* ---- what is being booked ----------------------------------------------
     Read off the destination, never the button text, so relabelling a button
     cannot silently retype the event. And read through PM_CONFIG rather than
     from ids copied into this file: when a Mindbody link is repointed in the
     config, this follows it on the same deploy.                           */
  var OFFERS = [
    ["dayPassUrl",      "day_pass",   "Day Pass"],
    ["veniceTrialUrl",  "trial",      "Two Weeks Unlimited"],
    ["saunaHourUrl",    "sauna",      "Sauna"],
    ["planPrimalUrl",   "membership", "The Primal"],
    ["planNomadUrl",    "membership", "The Nomad"],
    ["planExplorerUrl", "membership", "The Explorer"],
    ["planWeekendUrl",  "membership", "Weekend Warrior"],
    ["planKidsUrl",     "membership", "Kids' Primal"]
  ];

  function offerId(url) {
    var m = /\/pricing\/[^/]+\/((?:po|cntr)_[A-Za-z0-9]+)/.exec(url || "");
    return m ? m[1] : "";
  }

  function offerFor(href) {
    var C = window.PM_CONFIG || {};
    var id = offerId(href);
    if (id) {
      for (var i = 0; i < OFFERS.length; i++) {
        if (offerId(C[OFFERS[i][0]]) === id) {
          return { type: OFFERS[i][1], name: OFFERS[i][2] };
        }
      }
      return { type: "other", name: "" };
    }
    // The classic store. stype=-7 is the week timetable - a class booking.
    if (/clients\.mindbodyonline\.com/.test(href)) {
      return /stype=-7/.test(href) ? { type: "class", name: "" }
                                   : { type: "other", name: "" };
    }
    return { type: "other", name: "" };
  }

  /* ---- the timetable row a click came from -------------------------------
     <li><a><span class="s-time">5:45pm</span> … <span class="s-name">Primal</span>
         <span class="s-meta">Gus<span class="s-dur">60 min</span></span></a></li>
     The duration lives inside the teacher line, so it is subtracted out.   */
  function rowDetail(a) {
    var li = a.closest("li");
    if (!li || !li.querySelector(".s-name")) return null;
    var meta = li.querySelector(".s-meta"), teacher = "";
    if (meta) {
      var dur = meta.querySelector(".s-dur");
      teacher = meta.textContent.replace(dur ? dur.textContent : "", "").trim();
    }
    return {
      class_name: text(li, ".s-name"),
      teacher: teacher,
      class_time: text(li, ".s-time")
    };
  }

  /* ---- day_offset --------------------------------------------------------
     A chip carries data-key="Aug27" - the month and day the renderer built it
     from. Comparing that against today in the studio's own timezone gives a
     true offset, so it stays 0 for today even on a Monday where the rail
     happens to start on Saturday. If anything about that fails, fall back to
     counting chips from whichever one is labelled Today.                   */
  var MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];

  function laToday() {
    try {
      var p = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Los_Angeles", year: "numeric", month: "numeric", day: "numeric"
      }).formatToParts(new Date()).reduce(function (a, x) { a[x.type] = x.value; return a; }, {});
      return new Date(+p.year, +p.month - 1, +p.day);
    } catch (e) { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  }

  function offsetFromKey(key, today) {
    var m = /^([A-Za-z]+)(\d+)$/.exec(key || "");
    if (!m) return null;
    var mo = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    if (mo < 0) return null;
    var d = new Date(today.getFullYear(), mo, +m[2]);
    // a timetable only ever looks forward; a date well behind us is next year
    if (d - today < -180 * 864e5) d = new Date(today.getFullYear() + 1, mo, +m[2]);
    return Math.round((d - today) / 864e5);
  }

  function offsetFromChips(chip) {
    var chips = [].slice.call(chip.parentNode.querySelectorAll(".dchip"));
    var todayIdx = 0;
    for (var i = 0; i < chips.length; i++) {
      var w = chips[i].querySelector(".dw");
      if (w && /today/i.test(w.textContent)) { todayIdx = i; break; }
    }
    return chips.indexOf(chip) - todayIdx;
  }

  /* ---- one listener ------------------------------------------------------
     No preventDefault and no delay anywhere below. Every outbound link here
     carries target="_blank", so the push lands while the page stays put.  */
  document.addEventListener("click", function (ev) {
    var node = el(ev.target);
    if (!node) return;

    var chip = node.closest(".dchip");
    if (chip) {
      var off = offsetFromKey(chip.getAttribute("data-key"), laToday());
      if (off === null) off = offsetFromChips(chip);
      push({ event: "select_schedule_day", day_offset: off });
      return;
    }

    var a = node.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var h = host(href);
    var section = sectionOf(a);

    if (h === "mindbodyonline.com" || /\.mindbodyonline\.com$/.test(h)) {
      var offer = offerFor(href);
      var row = rowDetail(a) || { class_name: "", teacher: "", class_time: "" };
      push({
        event: "begin_booking",
        booking_type: offer.type,
        offer_name: row.class_name || offer.name,
        source_section: section,
        class_name: row.class_name,
        teacher: row.teacher,
        class_time: row.class_time,
        link_url: a.href
      });
      return;
    }

    if (h === "app.primalmoves.com" && /\/register\/trial/.test(href)) {
      push({ event: "begin_online_trial", source_section: section });
      return;
    }

    if (h === "lu.ma" || /(^|\.)luma\.com$/.test(h)) {
      push({
        event: "event_rsvp_click",
        event_name: text(a, ".pm-what"),
        source_section: section
      });
      return;
    }

    var scheme = (/^([a-z]+):/i.exec(href) || [, ""])[1].toLowerCase();
    var method = scheme === "tel" ? "phone"
               : scheme === "sms" ? "sms"
               : scheme === "mailto" ? "email"
               : (h === "wa.me" || /(^|\.)whatsapp\.com$/.test(h)) ? "whatsapp"
               : "";
    if (method) push({ event: "contact_click", contact_method: method, source_section: section });
  }, true);

  /* ---- view_schedule -----------------------------------------------------
     Once per page view, never again on scroll back.

     "50% visible" needs care: the timetable section is taller than a phone
     screen, so its intersectionRatio can never reach 0.5 and a plain
     threshold would never fire. Half the section OR half the viewport filled
     by it both count as having seen it.                                    */
  function watchSchedule() {
    var target = document.querySelector("#schedule");
    if (!target) {
      var s = document.querySelector("[data-pm-schedule]");
      target = (s && s.closest("section")) || s;
    }
    if (!target || !("IntersectionObserver" in window)) return;

    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (fired || !e.isIntersecting) continue;
        var enough = e.intersectionRatio >= 0.5 ||
                     e.intersectionRect.height >= window.innerHeight * 0.5;
        if (!enough) continue;
        fired = true;
        io.disconnect();
        push({ event: "view_schedule" });
      }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });

    io.observe(target);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchSchedule);
  } else {
    watchSchedule();
  }
})();
