// Minimal terminal overlay integrated with your existing sections.
(() => {
  const overlay = document.getElementById("terminal-landing");
  if (!overlay) return; // safety

  const screen = document.getElementById("tl-screen");
  const form = document.getElementById("tl-prompt");
  const input = document.getElementById("tl-input");
  const backBtn = document.getElementById("tl-return");

  // gather content from the existing page so commands stay in sync
  function getText(selector, fallback = "Not found.") {
    const el = document.querySelector(selector);
    if (!el) return fallback;
    // Take visible text content only
    return el.innerText.replace(/\n{3,}/g, "\n\n").trim();
  }

  function projectsList() {
    const cards = Array.from(document.querySelectorAll("#personal-projects .small-cards"));
    if (!cards.length) return "No projects listed.";
    return cards.map(card => {
      const title = (card.querySelector("h2")?.innerText || "Untitled").trim();
      const desc = Array.from(card.querySelectorAll("p")).map(p => p.innerText.trim()).join("\n");
      return `• ${title}\n${desc}`;
    }).join("\n\n");
  }

  function contactInfo() {
    const links = Array.from(document.querySelectorAll(".icon-bar a"));
    if (!links.length) return "No contact links found.";
    return links.map(a => {
      const label = a.getAttribute("href")?.startsWith("mailto:") ? "Email" :
                    (a.querySelector("img")?.alt || a.hostname || "Link");
      const href = a.getAttribute("href");
      return `- ${label}: ${href}`;
    }).join("\n");
  }

  // terminal state
  const history = [];
  let historyIndex = -1;

  const commands = {
    help() {
      return lines([
        "Available commands:",
        "  help         Show this help",
        "  aboutme      About Ali",
        "  projects     Side projects",
        "  awards       Awards",
        "  education    Education",
        "  contact      Contact links",
        "  enter        Hide terminal and view the site",
        "  clear        Clear the screen"
      ]);
    },
    aboutme() { return block(getText("#about")); },
    projects() { return block(projectsList()); },
    awards()   { return block(getText("#Awards")); },
    education(){ return block(getText("#education")); },
    contact()  { return block(contactInfo()); },
    enter() {
      overlay.classList.add("tl-hide");
      backBtn.style.display = "inline-block";
      return lines(["Entering site… (type 'help' again after reopening terminal)"]);
    },
    clear() { screen.innerHTML = ""; return ""; },
  };

  // rendering helpers
  function line(text, cls = "") {
    const div = document.createElement("div");
    div.className = `tl-row ${cls}`.trim();
    div.textContent = text;
    screen.appendChild(div);
    return div;
  }
  function htmlLine(textHTML) {
    const div = document.createElement("div");
    div.className = "tl-row";
    div.innerHTML = textHTML;
    screen.appendChild(div);
    return div;
  }
  function block(text) {
    const div = document.createElement("div");
    div.className = "tl-row";
    div.textContent = text;
    screen.appendChild(div);
    return div;
  }
  function lines(arr) { return block(arr.join("\n")); }
  function promptEcho(cmd) {
    const prompt = `<span class="tl-accent">guest</span>@<span class="tl-dim">ali-site</span>:<span class="tl-accent">~</span>$ ${escapeHtml(cmd)}`;
    htmlLine(prompt);
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[ch]));
  }

  function runCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    promptEcho(cmd);
    const name = cmd.split(/\s+/)[0].toLowerCase();
    const fn = commands[name];
    if (fn) {
      const out = fn();
      if (typeof out === "string" && out) line(out);
    } else {
      line(`command not found: ${name}`, "tl-error");
      line(`Type "help" for a list of commands.`, "tl-dim");
    }
    screen.scrollTop = screen.scrollHeight;
  }

  function complete(partial) {
    const keys = Object.keys(commands);
    const matches = keys.filter(k => k.startsWith(partial));
    if (matches.length === 1) {
      input.value = matches[0];
    } else if (matches.length > 1) {
      line(matches.join("  "), "tl-dim");
    }
  }

  // Boot banner
  lines([
    "Welcome to ali@portfolio",
    "Type \"help\" to get started. Type \"enter\" to view the site."
  ]);

  // Events
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    history.push(value);
    historyIndex = history.length;
    runCommand(value);
    input.value = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (historyIndex > 0) {
        historyIndex -= 1;
        input.value = history[historyIndex] ?? "";
        setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      if (historyIndex < history.length) {
        historyIndex += 1;
        input.value = history[historyIndex] ?? "";
        setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
      }
      e.preventDefault();
    } else if (e.key === "Tab") {
      const partial = input.value.trim().toLowerCase();
      if (partial) complete(partial);
      e.preventDefault();
    }
  });

  document.addEventListener("click", () => input.focus());
  backBtn.addEventListener("click", () => {
    overlay.classList.remove("tl-hide");
    backBtn.style.display = "none";
    input.focus();
  });
})();
