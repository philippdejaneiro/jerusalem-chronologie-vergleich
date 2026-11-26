var S = { tab: "tl", events: [], args: [], sources: {}, srcList: [], sel: "evt-03", doc: "", docList: [], docs: {} };
var REPO_API = "https://github.com";

function yr(y) { return Math.abs(y) + " v. u. Z."; }
function pct(y) { return 5 + ((y - (-630)) / 98) * 90; }

function pills(ids) {
  if (!ids) return "";
  return ids.filter(Boolean).map(function(id) {
    var q = S.sources[id.trim()];
    return q ? '<a class="pill" href="' + q.url + '" target="_blank">&#8599; ' + q.titel + '</a>' : '<span class="pill">' + id + '</span>';
  }).join("");
}

function parseCSV(txt) {
  var lines = txt.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  function splitLine(l) {
    var out = [], cur = "", q = false;
    for (var i = 0; i < l.length; i++) {
      var c = l.charAt(i);
      if (c === '"') q = !q;
      else if (c === ',' && !q) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }
  var head = splitLine(lines.shift());
  return lines.map(function(l) {
    var vals = splitLine(l), o = {};
    head.forEach(function(h, i) { o[h.trim()] = (vals[i] || "").trim(); });
    return o;
  });
}

function mdToHtml(md) {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.*$)/gm, "<h3>$1</h3>").replace(/^## (.*$)/gm, "<h2>$1</h2>").replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/^---$/gm, "<hr style='border:none;border-top:1px solid #e2e8f0;margin:12px 0'/>")
    .replace(/^&gt; (.*$)/gm, '<blockquote style="border-left:3px solid #94a3b8;padding-left:10px;color:#475569;margin:8px 0">$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/((?:\|.*\|\r?\n)+)/g, function(b) {
      var rows = b.trim().split(/\r?\n/).filter(function(r) { return !/^\|[\s:-]+\|$/.test(r.replace(/[^|\s:-]/g, "")); });
      return "<table>" + rows.map(function(r, i) {
        var tag = i ? "td" : "th";
        return "<tr>" + r.split("|").slice(1, -1).map(function(c) { return "<" + tag + ">" + c.trim() + "</" + tag + ">"; }).join("") + "</tr>";
      }).join("") + "</table>";
    })
    .replace(/((?:^\* .*\r?\n?)+)/gm, function(l) {
      return "<ul>" + l.trim().split(/\r?\n/).map(function(i) { return "<li>" + i.replace(/^\* /, "") + "</li>"; }).join("") + "</ul>";
    })
    .replace(/\n{2,}/g, "<br><br>");
}

function render() {
  document.querySelectorAll(".tab").forEach(function(b) { b.classList.toggle("active", b.dataset.t === S.tab); });
  var v = document.getElementById("view");

  if (S.tab === "tl") {
    if (!S.events.length) { v.innerHTML = '<div class="card">Keine Daten in data/zeitstrahl.json.</div>'; return; }
    var ticks = [-630,-620,-610,-600,-590,-580,-570,-560,-550,-540].map(function(d) {
      return '<div class="tick" style="left:' + pct(d) + '%">' + Math.abs(d) + '</div>';
    }).join("");
    var lines = S.events.map(function(e) {
      return '<line x1="' + pct(e.jahr_jw) + '%" y1="52" x2="' + pct(e.jahr_hist) + '%" y2="132" stroke="' + (e.id === S.sel ? "#1e293b" : "#cbd5e1") + '" stroke-dasharray="3,3" stroke-width="' + (e.id === S.sel ? 2 : 1) + '"/>';
    }).join("");
    var pts = S.events.map(function(e) {
      var sel = e.id === S.sel ? " sel" : "";
      return '<div class="pt pt-jw' + sel + '" style="left:' + pct(e.jahr_jw) + '%" onclick="pick(\'' + e.id + '\')">' + Math.abs(e.jahr_jw) + '<i></i></div>' +
             '<div class="pt pt-hist' + sel + '" style="left:' + pct(e.jahr_hist) + '%" onclick="pick(\'' + e.id + '\')"><i></i>' + Math.abs(e.jahr_hist) + '</div>';
    }).join("");
    var cur = S.events.find(function(e) { return e.id === S.sel; }) || S.events;

    v.innerHTML = '<div class="tl-box"><div class="tl">' + ticks + '<div class="line-jw"></div><div class="line-hist"></div><svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">' + lines + '</svg>' + pts + '</div></div>' +
      '<div class="card"><strong>' + cur.ereignis + '</strong><div class="grid"><div class="jw"><div class="tag">jw.org</div><strong>' + yr(cur.jahr_jw) + '</strong></div><div class="hist"><div class="tag">Historisch</div><strong>' + yr(cur.jahr_hist) + '</strong></div></div><p style="font-size:14px;margin:10px 0 6px">' + cur.beschreibung + '</p>' + pills(cur.quellen_ids) + '</div>';
  }

  if (S.tab === "arg") {
    v.innerHTML = S.args.map(function(a) {
      return '<div class="card"><strong>' + a.streitpunkt + '</strong><div class="grid"><div class="jw"><div class="tag">jw.org (607)</div><div style="font-weight:700;margin:3px 0">' + a.position_jw + '</div><div style="font-size:13px">' + a.begruendung_jw + '</div>' + pills((a.quellen_jw || "").split(";")) + '</div><div class="hist"><div class="tag">Historisch (587)</div><div style="font-weight:700;margin:3px 0">' + a.position_hist + '</div><div style="font-size:13px">' + a.begruendung_hist + '</div>' + pills((a.quellen_hist || "").split(";")) + '</div></div></div>';
    }).join("") || '<div class="card">Keine Daten in data/argumente.csv.</div>';
  }

  if (S.tab === "doc") {
    var btns = S.docList.map(function(p) {
      var label = p.split("/").pop().replace(".md", "");
      return '<button type="button" class="tab' + (S.doc === p ? " active" : "") + '" onclick="openDoc(\'' + p + '\')">' + label + '</button>';
    }).join("");
    v.innerHTML = '<div style="margin-bottom:10px;display:flex;gap:6px;flex-wrap:wrap">' + btns + '</div><div class="card">' + (S.docs[S.doc] || "Lade Dokument...") + '</div>';
  }

  if (S.tab === "src") {
    v.innerHTML = S.srcList.map(function(s) {
      var nwt = s.bibeltext_nwt ? '<blockquote style="margin:8px 0;padding:8px 10px;background:#fffbeb;border-left:3px solid #d97706;font-size:13px;font-style:italic">' + s.bibeltext_nwt + '</blockquote>' : '';
      return '<div class="card"><div class="tag">' + s.kategorie + ' &#8226; ' + s.id + '</div><strong>' + s.titel + '</strong>' + nwt + '<p style="font-size:13px;margin:6px 0">' + s.kernaussage + '</p><a class="pill" href="' + s.url + '" target="_blank">&#8599; Direkt aufrufen</a></div>';
    }).join("") || '<div class="card">Keine Quellen geladen.</div>';
  }
}

window.pick = function(id) { S.sel = id; render(); };
window.openDoc = function(p) {
  S.doc = p; render();
  if (!S.docs[p]) {
    fetch("./" + p + "?v=" + Date.now()).then(function(r) {
      return r.ok ? r.text().then(mdToHtml) : "Nicht gefunden: " + p;
    }).then(function(h) { S.docs[p] = h; render(); });
  }
};

document.getElementById("tabs").addEventListener("click", function(e) {
  var b = e.target.closest(".tab");
  if (!b) return;
  S.tab = b.dataset.t;
  if (S.tab === "doc" && S.doc && !S.docs[S.doc]) openDoc(S.doc);
  else render();
});

var errs = [];
function loadFile(path, fn) {
  return fetch("./" + path + "?v=" + Date.now()).then(function(r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.text();
  }).then(fn).catch(function(e) { errs.push(path + ": " + e.message); });
}

Promise.all([
  loadFile("data/zeitstrahl.json", function(t) { S.events = JSON.parse(t); }),
  loadFile("data/quellen.json", function(t) { S.srcList = JSON.parse(t); S.srcList.forEach(function(s) { S.sources[s.id] = s; }); }),
  loadFile("data/argumente.csv", function(t) { S.args = parseCSV(t); }),
  fetch(REPO_API).then(function(r) { return r.json(); }).then(function(data) {
    if (data && data.tree) {
      S.docList = data.tree
        .filter(function(f) { return f.type === "blob" && f.path.endsWith(".md") && (f.path.toLowerCase().startsWith("analysen/") || f.path.toLowerCase().startsWith("rohdaten/")); })
        .map(function(f) { return f.path; });
      if (S.docList.length) S.doc = S.docList;
    }
  }).catch(function() {})
]).then(function() {
  if (!S.docList.length) S.docList = ["analysen/03-direktvergleich.md", "analysen/01-sichtweise-jw.md", "analysen/02-sichtweise-hist.md", "rohdaten/zitate-sammlung.md"];
  if (!S.doc) S.doc = S.docList;
  if (errs.length) document.getElementById("err").innerHTML = '<div class="err">Fehler: ' + errs.join(" | ") + '</div>';
  render();
});