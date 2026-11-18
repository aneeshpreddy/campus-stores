(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  // `at` is minutes from Friday midnight, so slips can be compared with desk time.
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      at: 945,
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      at: 1170,
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      at: 1980,
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const dueAt = {
    "Fri 8 pm": 1200,
    "Sat 9 am": 1980,
    "Sat 10 am": 2040,
    "Sat noon": 2160,
  };
  const dueTimes = Object.keys(dueAt);
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const blankDraft = () => ({ req: "", asset: "", who: "", due: "", error: "" });
  const original = () => ({
    version: 2,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
        holder: "Tara Shah",
        expected: "",
        log: [],
      },
    ],
    notes: [],
    repairs: [],
    editing: false,
    draft: blankDraft(),
    panel: null,
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  let focusSel = "";
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const typeOf = (l) => getAsset(l.asset).type;
  const inRepair = (a) => a.repair || s.repairs.includes(a.id);
  const conditions = {
    ok: "Working, all accessories present",
    damaged: "Damaged · send to repair",
    missing: "Accessory missing",
  };
  const expectedOf = (l) => l.expected || l.due;
  const timing = (l) => {
    const now = shifts[s.phase].at;
    const due = dueAt[expectedOf(l)];
    return now > due ? "Overdue" : now === due ? "Due now" : "";
  };
  // Each approved item on a request, with its open slip (or last slip if returned).
  const kit = (r) =>
    r.items.map((type) => {
      const slips = s.loans.filter((l) => l.req === r.id && typeOf(l) === type);
      return {
        type,
        slip: slips.find((l) => !l.back) || slips[slips.length - 1] || null,
      };
    });
  const notIssued = (r) =>
    kit(r)
      .filter((i) => !i.slip)
      .map((i) => i.type);
  const kitSummary = (r) => {
    const k = kit(r);
    const outNow = k.filter((i) => i.slip && !i.slip.back).length;
    const missing = k.filter((i) => !i.slip).length;
    if (missing === k.length) return "Not issued";
    const parts = [];
    if (outNow) parts.push(outNow + " of " + k.length + " out");
    else parts.push("All issued units returned");
    if (missing) parts.push(missing + " not issued");
    return parts.join(" · ");
  };
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, selected = "") =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === selected ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, kind = "") =>
    '<span class="tag' + (kind ? " " + kind : "") + '">' + esc(t) + "</span>";
  const custodyLine = (l) =>
    "With " +
    l.holder +
    " · " +
    (l.expected && l.expected !== l.due
      ? "expected " + l.expected + " (was due " + l.due + ")"
      : "due " + l.due);

  function itemState(i) {
    if (!i.slip) return badge("Not issued");
    const l = i.slip;
    if (l.back) return badge("Returned · " + l.asset, "good");
    const t = timing(l);
    return (
      badge("Out · " + l.asset + " · with " + l.holder, t ? "warn" : "") +
      (t ? " " + badge(t, "warn") : "")
    );
  }
  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      const missing = notIssued(r);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        esc(r.id) +
        " · Approved</small><h3>" +
        esc(r.event) +
        "</h3><p>" +
        esc(r.club) +
        " · Filed by " +
        esc(r.owner) +
        "</p><p><b>Return by</b> " +
        esc(r.due) +
        '</p><p><b>Approved equipment</b></p><ul class="kitlist">' +
        kit(r)
          .map((i) => "<li><span>" + esc(i.type) + "</span> " + itemState(i) + "</li>")
          .join("") +
        "</ul><p>" +
        esc(r.note) +
        "</p>" +
        (missing.length
          ? '<div class="buttons">' +
            btn(
              "Issue from this request (" + missing.length + " to go)",
              "new",
              r.id,
              "primary",
            ) +
            "</div>"
          : "") +
        "</div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club + " · " + kitSummary(r),
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const loan = out(a.id);
      const status = inRepair(a) ? "In repair" : loan ? "On loan" : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model +
          " · " +
          a.bin +
          (loan ? " · L-" + loan.num + " · with " + loan.holder : ""),
        badge(status, status === "On shelf" ? "good" : ""),
      );
    }
    return html;
  }
  function issueForm() {
    const d = s.draft;
    const available = assets.filter((a) => !inRepair(a) && !out(a.id));
    const r = getReq(d.req);
    const select = (label, key, options) =>
      "<label><span>" +
      label +
      '</span><select name="' +
      key +
      '" required><option value="">Select…</option>' +
      opts(options, d[key]) +
      "</select></label>";
    let hint = "";
    if (r) {
      const missing = notIssued(r);
      hint =
        '<p class="hint">' +
        (missing.length
          ? "Still to issue for " +
            esc(r.id) +
            ": <b>" +
            missing.map(esc).join(", ") +
            "</b>"
          : "Every approved item on " + esc(r.id) + " has been issued.") +
        "</p>";
    }
    return (
      '<form data-issue><div class="form">' +
      select(
        "Approved request",
        "req",
        requests.map((x) => [x.id, x.id + " · " + x.club]),
      ) +
      select(
        "Unit leaving the desk",
        "asset",
        available.map((a) => [a.id, a.id + " · " + a.type]),
      ) +
      select(
        "Collected by",
        "who",
        people.map((p) => [p, p]),
      ) +
      select(
        "Return by",
        "due",
        dueTimes.map((t) => [t, t]),
      ) +
      "</div>" +
      hint +
      (d.error ? '<p class="error" role="alert">' + esc(d.error) + "</p>" : "") +
      '<button type="submit" class="primary">Save issue slip</button></form>'
    );
  }
  function panelHtml(l) {
    const p = s.panel;
    const err = p.error
      ? '<p class="error" role="alert">' + esc(p.error) + "</p>"
      : "";
    const cancel = btn("Cancel", "panel", "");
    if (p.mode === "return")
      return (
        '<form data-checkin data-num="' +
        l.num +
        '" class="panel"><p><b>Check in L-' +
        l.num +
        ".</b> Read the asset tag on the unit in front of you. It has to match this slip before the slip closes.</p>" +
        err +
        '<div class="form"><label><span>Asset tag on the unit</span><input name="tag" required autocomplete="off" spellcheck="false" placeholder="Type the tag from the label" value="' +
        esc(p.tag || "") +
        '"></label><label><span>Handed back by</span><select name="by" required>' +
        opts(
          people.map((x) => [x, x]),
          l.holder,
        ) +
        '</select></label><label><span>Condition</span><select name="cond" required>' +
        opts(Object.entries(conditions), p.cond || "ok") +
        '</select></label><label><span>What is damaged or missing</span><input name="detail" maxlength="160" autocomplete="off" placeholder="Needed unless working" value="' +
        esc(p.detail || "") +
        '"></label></div><div class="buttons"><button type="submit" class="primary">Confirm check-in</button>' +
        cancel +
        "</div></form>"
      );
    return (
      '<form data-custody data-num="' +
      l.num +
      '" class="panel"><p><b>Still out: L-' +
      l.num +
      ".</b> Record who has the unit now and when it is due back, so the next shift can close this slip without guessing.</p>" +
      err +
      '<div class="form"><label><span>Now with</span><select name="holder" required>' +
      opts(
        people.map((x) => [x, x]),
        l.holder,
      ) +
      '</select></label><label><span>Expected back</span><select name="expected" required>' +
      opts(
        dueTimes.map((t) => [t, t]),
        expectedOf(l),
      ) +
      '</select></label><label class="full"><span>What the borrower said (optional)</span><input name="why" maxlength="200" autocomplete="off"></label></div><div class="buttons"><button type="submit" class="primary">Save custody</button>' +
      cancel +
      "</div></form>"
    );
  }
  function slipRow(l) {
    const a = getAsset(l.asset);
    const t = l.back ? "" : timing(l);
    const custody = l.back
      ? "Returned " +
        shifts[l.returnedAt].time +
        " · handed back by " +
        l.returnedBy
      : custodyLine(l);
    const right = l.back
      ? l.condition && l.condition !== "ok"
        ? badge(l.condition === "damaged" ? "Returned · damaged" : "Returned · accessory missing", "warn")
        : badge("Returned", "good")
      : (t ? badge(t, "warn") : "") +
        btn("Check in", "panel", l.num + ":return", "primary") +
        btn("Still out…", "panel", l.num + ":custody");
    let html =
      '<div class="row slip"><div><strong>L-' +
      l.num +
      " · " +
      esc(a.id) +
      " · " +
      esc(a.type) +
      "</strong><small>" +
      esc(a.model) +
      " · home bin " +
      esc(a.bin) +
      " · collected by " +
      esc(l.who) +
      '</small><small class="custody' +
      (t ? " late" : "") +
      '">' +
      esc(custody) +
      "</small>" +
      l.log
        .map(
          (e) =>
            '<small class="log">' +
            esc(shifts[e.phase].time + " · " + e.text) +
            "</small>",
        )
        .join("") +
      '</div><div class="actions">' +
      right +
      "</div></div>";
    if (s.panel && s.panel.num === l.num && !l.back) html += panelHtml(l);
    return html;
  }
  function kitCard(r) {
    const slips = s.loans
      .filter((l) => l.req === r.id)
      .sort((a, b) => a.num - b.num);
    const shown = slips.filter((l) => !s.onlyOpen || !l.back);
    const hidden = slips.length - shown.length;
    const summary = kitSummary(r);
    let html =
      '<section class="kit"><div class="kithead"><div><h3>' +
      esc(r.id + " · " + r.club) +
      "</h3><small>" +
      esc(r.event + " · return by " + r.due) +
      "</small></div>" +
      badge(summary, summary.startsWith("All") ? "good" : "") +
      "</div>" +
      shown.map(slipRow).join("");
    for (const type of notIssued(r))
      html += row(
        "Not issued · " + type,
        "Approved on " + r.id + " · no unit has left the desk",
        btn("Issue", "new", r.id),
      );
    if (hidden)
      html +=
        '<p class="more"><small>' +
        hidden +
        " returned " +
        (hidden > 1 ? "units" : "unit") +
        " hidden · choose All slips to see them</small></p>";
    return html + "</section>";
  }
  function register() {
    let html = head(
      "Loan register",
      "Grouped by approved request · one slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) return html + issueForm();
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const latest = (r) =>
      Math.max(...s.loans.filter((l) => l.req === r.id).map((l) => l.num));
    const groups = requests
      .filter((r) =>
        s.loans.some((l) => l.req === r.id && (!s.onlyOpen || !l.back)),
      )
      .sort((a, b) => latest(b) - latest(a));
    if (!groups.length) html += "<p>No outstanding slips.</p>";
    for (const r of groups) html += kitCard(r);
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const open = s.loans.filter((l) => !l.back);
    html +=
      '<div class="outnow"><h3>Still out right now</h3><small>Read from the loan register at ' +
      esc(shifts[s.phase].time) +
      "</small><ul>" +
      (open.length
        ? open
            .map((l) => {
              const t = timing(l);
              return (
                "<li><b>L-" +
                l.num +
                " · " +
                esc(l.asset) +
                " " +
                esc(typeOf(l)) +
                "</b> (" +
                esc(l.req) +
                ") · " +
                esc(custodyLine(l)) +
                (t ? " " + badge(t, "warn") : "") +
                "</li>"
              );
            })
            .join("")
        : "<li>Nothing. Every issued unit is back.</li>") +
      "</ul></div>";
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([
        shifts[n.phase].time,
        n.author || "Counter handover",
        n.text,
      ]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
    if (focusSel) {
      const el = q(focusSel);
      if (el) el.focus();
      focusSel = "";
    }
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.panel = null;
        s.editing = false;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.panel = null;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new": {
        const r = getReq(v);
        s.tab = "Loan register";
        s.editing = true;
        s.panel = null;
        s.draft = { ...blankDraft(), req: r ? r.id : "", due: r ? r.due : "" };
        focusSel = r ? '[data-issue] [name="asset"]' : '[data-issue] [name="req"]';
        break;
      }
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "panel": {
        if (!v) {
          s.panel = null;
          break;
        }
        const [num, mode] = v.split(":");
        const l = s.loans.find((x) => x.num === Number(num));
        if (!l || l.back) return;
        s.panel = { num: l.num, mode, error: "", tag: "" };
        focusSel = ".panel input, .panel select";
        break;
      }
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
      return;
    }
    if (e.target.closest("[data-issue]") && e.target.name) {
      const d = s.draft;
      d[e.target.name] = e.target.value;
      if (e.target.name === "req") {
        const r = getReq(d.req);
        if (r) d.due = r.due;
      }
      d.error = "";
      focusSel = '[data-issue] [name="' + e.target.name + '"]';
      commit();
    }
  });
  const normaliseTag = (x) =>
    String(x)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/^([A-Z]+)-?(\d+)$/, "$1-$2");
  function checkIn(l, form) {
    const tag = normaliseTag(form.get("tag"));
    const by = String(form.get("by"));
    const cond = String(form.get("cond") || "ok");
    const detail = String(form.get("detail") || "").trim();
    Object.assign(s.panel, { tag, cond, detail });
    if (tag !== l.asset) {
      const other = getAsset(tag);
      let msg;
      if (!other) msg = "No unit is tagged “" + tag + "”. Read the label on the unit again.";
      else {
        const ol = out(other.id);
        msg = ol
          ? other.id +
            " belongs to slip L-" +
            ol.num +
            " (" +
            ol.req +
            ", with " +
            ol.holder +
            "), not L-" +
            l.num +
            ". Close that slip instead."
          : other.id +
            " (" +
            other.model +
            ") is recorded as on the shelf, not on loan. L-" +
            l.num +
            " is for " +
            l.asset +
            " (" +
            getAsset(l.asset).model +
            "). Check the unit before closing anything.";
      }
      s.panel.error = msg;
      focusSel = '.panel [name="tag"]';
      commit(msg);
      return;
    }
    if (!people.includes(by) || !conditions[cond]) return;
    if (cond !== "ok" && !detail) {
      s.panel.error = "Say what is damaged or missing so the next shift can follow it up.";
      focusSel = '.panel [name="detail"]';
      commit(s.panel.error);
      return;
    }
    l.back = true;
    l.returnedAt = s.phase;
    l.returnedBy = by;
    l.condition = cond;
    l.issue = detail;
    l.log.push({
      phase: s.phase,
      text:
        "Checked in from " +
        by +
        " · tag " +
        tag +
        " confirmed" +
        (cond === "ok" ? "" : " · " + conditions[cond] + ": " + detail),
    });
    if (cond === "damaged" && !s.repairs.includes(l.asset)) s.repairs.push(l.asset);
    if (cond !== "ok")
      s.notes.push({
        phase: s.phase,
        author: "Return desk · L-" + l.num,
        text:
          l.asset +
          " " +
          typeOf(l) +
          " came back from " +
          by +
          " (" +
          l.req +
          "). " +
          (cond === "damaged"
            ? "Damaged: " + detail + ". Sent to repair; it cannot be issued until repaired."
            : "Accessory missing: " + detail + ". Follow up with " + getReq(l.req).club + "."),
      });
    s.panel = null;
    const r = getReq(l.req);
    const still = s.loans.filter((x) => x.req === r.id && !x.back);
    commit(
      l.asset +
        " checked in from " +
        by +
        ". Slip L-" +
        l.num +
        " closed. " +
        (still.length
          ? r.id +
            " still has " +
            still.length +
            (still.length > 1 ? " units" : " unit") +
            " out: " +
            still.map((x) => x.asset + " with " + x.holder).join(", ") +
            "."
          : r.id + " has no units out."),
    );
  }
  function recordCustody(l, form) {
    const holder = String(form.get("holder"));
    const expected = String(form.get("expected"));
    const why = String(form.get("why") || "").trim();
    if (!people.includes(holder) || !dueAt[expected]) return;
    l.holder = holder;
    l.expected = expected;
    const text =
      "Still out · with " +
      holder +
      ", expected " +
      expected +
      (why ? " · “" + why + "”" : "");
    l.log.push({ phase: s.phase, text });
    s.notes.push({
      phase: s.phase,
      author: "Loan register · L-" + l.num,
      text:
        l.asset +
        " " +
        typeOf(l) +
        " for " +
        l.req +
        " is still out. With " +
        holder +
        ", expected " +
        expected +
        ". Collected by " +
        l.who +
        "." +
        (why ? " “" + why + "”" : ""),
    });
    s.panel = null;
    commit(
      "L-" +
        l.num +
        " updated: with " +
        holder +
        ", expected " +
        expected +
        ". The next shift will see it in the register and desk book.",
    );
  }
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-checkin], [data-custody]")) {
      const l = s.loans.find((x) => x.num === Number(f.dataset.num));
      if (!l || l.back || !s.panel) return;
      if (f.matches("[data-checkin]")) checkIn(l, form);
      else recordCustody(l, form);
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const d = s.draft;
    for (const k of ["req", "asset", "who", "due"]) d[k] = String(form.get(k) || "");
    const fail = (msg) => {
      d.error = msg;
      commit(msg);
    };
    const unit = getAsset(d.asset),
      r = getReq(d.req);
    if (!r || !unit || inRepair(unit) || out(d.asset) || !people.includes(d.who) || !dueAt[d.due])
      return fail("Complete every field before saving the slip.");
    if (!r.items.includes(unit.type))
      return fail(
        "This equipment type is outside the approved request. Choose an approved unit.",
      );
    if (
      s.loans.some(
        (l) => l.req === d.req && !l.back && typeOf(l) === unit.type,
      )
    )
      return fail(
        "The approved quantity of this equipment type is already on loan.",
      );
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({
      num,
      req: d.req,
      asset: d.asset,
      who: d.who,
      due: d.due,
      back: false,
      holder: d.who,
      expected: "",
      log: [],
    });
    const missing = notIssued(r);
    const issued = "Issued " + d.asset + " to " + d.who + " on slip L-" + num + ". ";
    if (missing.length) {
      // Keep the form open for the rest of the kit, with the same borrower and due time.
      s.draft = { ...blankDraft(), req: d.req, who: d.who, due: d.due };
      focusSel = '[data-issue] [name="asset"]';
      commit(issued + "Still to issue for " + r.id + ": " + missing.join(", ") + ".");
    } else {
      s.editing = false;
      s.draft = blankDraft();
      commit(issued + "Every approved item on " + r.id + " is now out.");
    }
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 2 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          typeof l.holder === "string" &&
          dueAt[l.due] &&
          (!l.expected || dueAt[l.expected]) &&
          Array.isArray(l.log) &&
          l.log.every((x) => x && shifts[x.phase] && typeof x.text === "string") &&
          (!l.back || shifts[l.returnedAt]),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      loans: d.loans.map((l) => ({ ...l, log: l.log.map((x) => ({ ...x })) })),
      notes: d.notes.map((n) => ({ ...n })),
      repairs: Array.isArray(d.repairs) ? d.repairs.filter((id) => getAsset(id)) : [],
      draft: { ...blankDraft(), ...(d.draft || {}) },
      panel: null,
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
