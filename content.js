(function () {
    if (document.getElementById("usaco-ext-root")) return;

    let context = null;
    let conversationHistory = [];

    function getRatingColor(rating) {
        if (rating >= 2200) return { bg: "#fee2e2", color: "#dc2626" };
        if (rating >= 1700) return { bg: "#ffedd5", color: "#ea580c" };
        if (rating >= 1200) return { bg: "#dcfce7", color: "#16a34a" };
        return { bg: "#dbeafe", color: "#2563eb" };
    }

    function injectPageRating() {
        let problem_title;
        for (const header of document.querySelectorAll("h2")) {
            const m = header.innerText.match(/Problem\s+\d+\.\s*(.+)/);
            if (m) { problem_title = m[1].trim(); break; }
        }
        if (!problem_title) return;

        fetch(chrome.runtime.getURL("ratings.json"))
            .then(r => r.json())
            .then(ratings => {
                const entry = ratings.find(p =>
                    p.name.toLowerCase() === problem_title.toLowerCase()
                );
                if (!entry) return;

                const rating = Math.round(parseFloat(entry.rating));
                const { bg, color } = getRatingColor(rating);

                const badge = document.createElement("span");
                badge.textContent = rating;
                badge.style.cssText = `
                    display: inline-block;
                    margin: 4px 0 0 0;
                    padding: 3px 12px;
                    border-radius: 999px;
                    background: ${bg};
                    color: ${color};
                    font-size: 0.75em;
                    font-weight: 700;
                    vertical-align: middle;
                    font-family: system-ui, sans-serif;
                    line-height: 1.5;
                    white-space: nowrap;
                `;

                for (const header of document.querySelectorAll("h2")) {
                    if (header.innerText.includes(problem_title)) {
                        header.insertAdjacentElement("afterend", badge);
                        break;
                    }
                }
            })
            .catch(() => {});
    }

    injectPageRating();

    // ── Styles ─────────────────────────────────────────────────────────────────

    const styleEl = document.createElement("style");
    styleEl.textContent = `
        #usaco-ext-fab {
            position: fixed;
            bottom: 24px;
            left: 24px;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #2563eb;
            color: #fff;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
            z-index: 2147483647;
            overflow: hidden;
            box-shadow: none;
            user-select: none;
            border: none;
            padding: 0;
        }
        #usaco-ext-fab:hover { background: #1d4ed8; }

        #usaco-ext-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 20vw;
            height: 100vh;
            background: #ffffff;
            border-left: 1px solid #d1d5db;
            z-index: 2147483646;
            display: none;
            flex-direction: column;
            font-family: system-ui, -apple-system, Arial, sans-serif;
            font-size: 1vw;
            color: #111827;
            box-shadow: -4px 0 24px rgba(0,0,0,0.12);
            overflow: hidden;
        }
        #usaco-ext-sidebar.open { display: flex; }
        #usaco-ext-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2% 4%;
            border-bottom: 1px solid #d1d5db;
            flex-shrink: 0;
        }
        #usaco-ext-brand {
            font-weight: 600;
            font-size: 1.1vw;
            display: flex;
            align-items: center;
            gap: 0.5vw;
        }
        #usaco-ext-rating {
            font-size: 0.8vw;
            font-weight: 600;
            background: #dbeafe;
            color: #1d4ed8;
            border-radius: 999px;
            padding: 1px 8px;
        }
        @media (prefers-color-scheme: dark) {
            #usaco-ext-rating { background: #1e3a8a; color: #93c5fd; }
        }
        #usaco-ext-settings-btn, #usaco-ext-close-sidebar-btn {
            cursor: pointer;
            font-size: 1.2vw;
            background: none;
            border: none;
            color: #111827;
            padding: 0;
            line-height: 1;
        }
        #usaco-ext-chat {
            flex: 1;
            overflow-y: auto;
            padding: 4%;
            display: flex;
            flex-direction: column;
            gap: 4%;
        }
        .usaco-ext-msg {
            border-radius: 0.6vw;
            padding: 4%;
            font-size: 0.9vw;
            line-height: 1.5;
            border: 1px solid #d1d5db;
            background: #f3f4f6;
            color: #111827;
        }
        .usaco-ext-msg.user {
            background: #2563eb;
            color: #fff;
            border: none;
        }
        .usaco-ext-msg pre {
            margin: 4% 0;
            padding: 4%;
            border-radius: 0.5vw;
            border: 1px solid #d1d5db;
            background: #fff;
            overflow: auto;
        }
        .usaco-ext-msg code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        }
        #usaco-ext-input-area {
            padding: 4%;
            border-top: 1px solid #d1d5db;
            flex-shrink: 0;
        }
        #usaco-ext-textarea {
            width: 100%;
            min-height: 5vh;
            resize: none;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 0.6vw;
            color: #111827;
            padding: 4%;
            font-size: 0.9vw;
            font-family: system-ui, -apple-system, Arial, sans-serif;
            box-sizing: border-box;
        }
        #usaco-ext-ask-btn {
            margin-top: 4%;
            width: 100%;
            background: #2563eb;
            border: none;
            padding: 4%;
            border-radius: 0.5vw;
            color: #fff;
            cursor: pointer;
            font-size: 0.9vw;
            font-family: system-ui, -apple-system, Arial, sans-serif;
        }
        #usaco-ext-ask-btn:hover { background: #1d4ed8; }
        #usaco-ext-ask-btn:disabled { background: #93c5fd; cursor: default; }

        #usaco-ext-settings-panel {
            position: absolute;
            inset: 0;
            background: #fff;
            display: none;
            flex-direction: column;
            padding: 6%;
        }
        #usaco-ext-settings-panel.open { display: flex; }
        #usaco-ext-settings-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6%;
        }
        #usaco-ext-settings-head h3 { margin: 0; font-size: 1.1vw; }
        #usaco-ext-close-settings {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 0.4vw;
            padding: 2% 4%;
            cursor: pointer;
            font-size: 0.9vw;
            color: #111827;
            font-family: system-ui, -apple-system, Arial, sans-serif;
        }
        .usaco-ext-label {
            font-size: 0.8vw;
            font-weight: 600;
            margin-bottom: 2%;
            display: block;
            color: #111827;
        }
        #usaco-ext-key-input {
            width: 100%;
            padding: 4%;
            margin-bottom: 4%;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 0.5vw;
            color: #111827;
            font-size: 0.9vw;
            box-sizing: border-box;
            font-family: system-ui, -apple-system, Arial, sans-serif;
        }
        #usaco-ext-save-btn {
            background: #4b5563;
            border: none;
            padding: 4%;
            border-radius: 0.5vw;
            color: #fff;
            cursor: pointer;
            font-size: 0.9vw;
            font-family: system-ui, -apple-system, Arial, sans-serif;
        }

        @media (prefers-color-scheme: dark) {
            #usaco-ext-sidebar { background: #0f0f0f; color: #f9fafb; border-color: #2a2a2a; }
            .usaco-ext-msg { background: #1b1b1b; border-color: #2a2a2a; color: #f9fafb; }
            .usaco-ext-msg pre { background: #0f0f0f; border-color: #2a2a2a; }
            #usaco-ext-header { border-color: #2a2a2a; }
            #usaco-ext-settings-btn, #usaco-ext-close-sidebar-btn { color: #f9fafb; }
            #usaco-ext-brand { color: #f9fafb; }
            #usaco-ext-input-area { border-color: #2a2a2a; }
            #usaco-ext-textarea { background: #1b1b1b; border-color: #2a2a2a; color: #f9fafb; }
            #usaco-ext-settings-panel { background: #0f0f0f; border-color: #2a2a2a; }
            #usaco-ext-settings-head h3 { color: #f9fafb; }
            #usaco-ext-close-settings { background: #1b1b1b; border-color: #2a2a2a; color: #f9fafb; }
            .usaco-ext-label { color: #f9fafb; }
            #usaco-ext-key-input { background: #1b1b1b; border-color: #2a2a2a; color: #f9fafb; }
        }
    `;
    document.head.appendChild(styleEl);

    // ── Build DOM ──────────────────────────────────────────────────────────────

    const root = document.createElement("div");
    root.id = "usaco-ext-root";

    const fab = document.createElement("button");
    fab.id = "usaco-ext-fab";
    fab.innerHTML = `<img src="${chrome.runtime.getURL('test.png')}" style="width:220%;height:220%;object-fit:cover;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">`;
    fab.style.display = "none";
    root.appendChild(fab);

    const sidebar = document.createElement("div");
    sidebar.id = "usaco-ext-sidebar";
    sidebar.innerHTML = `
        <div id="usaco-ext-header">
            <div id="usaco-ext-brand">AI Coach <span id="usaco-ext-rating" style="display:none"></span></div>
            <div style="display:flex;gap:0.4vw;align-items:center;">
                <button id="usaco-ext-settings-btn">&#9881;</button>
                <button id="usaco-ext-close-sidebar-btn">&#10005;</button>
            </div>
        </div>
        <div id="usaco-ext-chat">
            <div class="usaco-ext-msg">
                Hello! I'm here to help you solve this USACO problem.<br><br>
                Ask things like:<br>
                "What's the main idea?"<br>
                "Can I get a hint?"<br>
                "How should I approach this?"
            </div>
        </div>
        <div id="usaco-ext-input-area">
            <textarea id="usaco-ext-textarea" placeholder="Ask about this problem..."></textarea>
            <button id="usaco-ext-ask-btn">Ask</button>
        </div>
        <div id="usaco-ext-settings-panel">
            <div id="usaco-ext-settings-head">
                <h3>Settings</h3>
                <button id="usaco-ext-close-settings">Close</button>
            </div>
            <label class="usaco-ext-label">Gemini API Key</label>
            <input id="usaco-ext-key-input" type="password" placeholder="Enter Gemini API key">
            <button id="usaco-ext-save-btn">Save</button>
        </div>
    `;

    root.appendChild(sidebar);
    document.body.appendChild(root);

    // ── Refs ───────────────────────────────────────────────────────────────────

    const chatEl         = document.getElementById("usaco-ext-chat");
    const textareaEl     = document.getElementById("usaco-ext-textarea");
    const askBtn         = document.getElementById("usaco-ext-ask-btn");
    const settingsBtn    = document.getElementById("usaco-ext-settings-btn");
    const settingsPanel  = document.getElementById("usaco-ext-settings-panel");
    const closeSettings  = document.getElementById("usaco-ext-close-settings");
    const keyInput       = document.getElementById("usaco-ext-key-input");
    const saveBtn        = document.getElementById("usaco-ext-save-btn");

    // ── Helpers ────────────────────────────────────────────────────────────────

    const LATEX_SYMBOLS = {
        '\\leq': '≤', '\\le': '≤', '\\geq': '≥', '\\ge': '≥',
        '\\neq': '≠', '\\ne': '≠', '\\cdot': '·', '\\times': '×',
        '\\div': '÷', '\\pm': '±', '\\infty': '∞', '\\in': '∈',
        '\\notin': '∉', '\\subset': '⊂', '\\subseteq': '⊆',
        '\\cup': '∪', '\\cap': '∩', '\\emptyset': '∅',
        '\\forall': '∀', '\\exists': '∃', '\\neg': '¬',
        '\\land': '∧', '\\lor': '∨', '\\rightarrow': '→', '\\to': '→',
        '\\leftarrow': '←', '\\leftrightarrow': '↔',
        '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
        '\\epsilon': 'ε', '\\varepsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η',
        '\\theta': 'θ', '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ',
        '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π', '\\rho': 'ρ',
        '\\sigma': 'σ', '\\tau': 'τ', '\\phi': 'φ', '\\varphi': 'φ',
        '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
        '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Theta': 'Θ', '\\Lambda': 'Λ',
        '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ', '\\Phi': 'Φ',
        '\\Psi': 'Ψ', '\\Omega': 'Ω',
        '\\sqrt': '√', '\\sum': '∑', '\\prod': '∏', '\\int': '∫',
        '\\partial': '∂', '\\nabla': '∇', '\\approx': '≈',
        '\\equiv': '≡', '\\sim': '∼', '\\propto': '∝',
        '\\ll': '≪', '\\gg': '≫',
        '\\lfloor': '⌊', '\\rfloor': '⌋', '\\lceil': '⌈', '\\rceil': '⌉',
        '\\ldots': '…', '\\cdots': '⋯', '\\log': 'log', '\\ln': 'ln',
        '\\mod': ' mod ', '\\bmod': ' mod ', '\\max': 'max', '\\min': 'min',
        '\\gcd': 'gcd', '\\mid': '|', '\\nmid': '∤',
    };

    function renderLatexExpr(expr) {
        expr = expr.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1)/($2)');
        expr = expr.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
        expr = expr.replace(/\^{([^{}]+)}/g, '<sup>$1</sup>');
        expr = expr.replace(/_{([^{}]+)}/g, '<sub>$1</sub>');
        expr = expr.replace(/\^([^\s{])/g, '<sup>$1</sup>');
        expr = expr.replace(/_([^\s{])/g, '<sub>$1</sub>');
        for (const [cmd, char] of Object.entries(LATEX_SYMBOLS)) {
            expr = expr.replaceAll(cmd, char);
        }
        expr = expr.replace(/\\[a-zA-Z]+/g, '');
        expr = expr.replace(/[{}]/g, '');
        return expr;
    }

    function renderMarkdown(text) {
        const blocks = [];

        text = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
            blocks.push(`<div style="text-align:center;margin:6px 0;font-style:italic">${renderLatexExpr(expr.trim())}</div>`);
            return `\x00BLOCK${blocks.length - 1}\x00`;
        });
        text = text.replace(/\$([^\$\n]+?)\$/g, (_, expr) => {
            blocks.push(`<em>${renderLatexExpr(expr.trim())}</em>`);
            return `\x00BLOCK${blocks.length - 1}\x00`;
        });

        let html = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

        html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
            `<pre><code>${code.trimEnd()}</code></pre>`
        );
        html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\n/g, "<br>");

        html = html.replace(/\x00BLOCK(\d+)\x00/g, (_, i) => blocks[parseInt(i)]);
        return html;
    }

    function addMessage(role, text) {
        const div = document.createElement("div");
        div.className = "usaco-ext-msg" + (role === "user" ? " user" : "");
        div.innerHTML = renderMarkdown(text);
        chatEl.appendChild(div);
        chatEl.scrollTop = chatEl.scrollHeight;
        return div;
    }

    function setLoading(loading) {
        askBtn.disabled = loading;
        askBtn.textContent = loading ? "Thinking…" : "Ask";
    }

    // ── Scraper ────────────────────────────────────────────────────────────────

    async function scrapeEditorial() {
        // Extract just the problem name, e.g. "Problem 1. Chip Exchange" → "Chip Exchange"
        let problem_title;
        for (const header of document.querySelectorAll("h2")) {
            const m = header.innerText.match(/Problem\s+\d+\.\s*(.+)/);
            if (m) { problem_title = m[1].trim(); break; }
        }
        if (!problem_title) return { error: "Could not find problem title on this page." };

        let listUrl;
        for (const button of document.querySelectorAll("button")) {
            if (!button.innerText.includes("Return to Problem List")) continue;
            const m = (button.getAttribute("onclick") || "").match(/'([^']+)'/);
            if (m) { listUrl = "https://usaco.org/" + m[1]; break; }
        }
        if (!listUrl) return { problem_title, error: '"Return to Problem List" button not found.' };

        try {
            const parser = new DOMParser();
            const listDoc = parser.parseFromString(await (await fetch(listUrl)).text(), "text/html");

            // Find the sol_ link that is directly next to this problem's title,
            // not just any sol_ link in a big container.
            const solLinks = [...listDoc.querySelectorAll("a[href*='sol_']")];
            const sol_link = solLinks.find(a => {
                const row = a.closest("tr, li, div, p") || a.parentElement;
                return row.textContent.includes(problem_title);
            })?.href;

            if (!sol_link) return { problem_title, error: "No editorial link found for this problem." };

            const editDoc = parser.parseFromString(await (await fetch(sol_link)).text(), "text/html");
            return { problem_title, solution_text: editDoc.body.textContent };
        } catch (e) {
            return { problem_title, error: e.message };
        }
    }

    // ── Load context (on page load) ────────────────────────────────────────────

    scrapeEditorial().catch(e => ({ error: e.message })).then(result => {
        if (result.error) return; // no editorial — keep FAB hidden

        context = result;
        fab.style.display = "";

        if (context.problem_title) {
            fetch(chrome.runtime.getURL("ratings.json"))
                .then(r => r.json())
                .then(ratings => {
                    const entry = ratings.find(p =>
                        p.name.toLowerCase() === context.problem_title.toLowerCase()
                    );
                    if (entry) {
                        const rating = Math.round(parseFloat(entry.rating));
                        const { bg, color } = getRatingColor(rating);
                        const ratingEl = document.getElementById("usaco-ext-rating");
                        ratingEl.textContent = rating;
                        ratingEl.style.background = bg;
                        ratingEl.style.color = color;
                        ratingEl.style.display = "inline";
                    }
                })
                .catch(() => {});
        }
    });

    // ── Toggle ─────────────────────────────────────────────────────────────────

    function toggleSidebar() {
        if (!context) return;
        sidebar.classList.toggle("open");
    }

    // ── Ask ────────────────────────────────────────────────────────────────────

    async function askQuestion() {
        const question = textareaEl.value.trim();
        if (!question) return;

        const stored = await chrome.storage.local.get("gemini_key");
        const apiKey = stored.gemini_key;
        if (!apiKey) {
            addMessage("assistant", "Please enter your Gemini API key in Settings first.");
            return;
        }

        addMessage("user", question);
        textareaEl.value = "";
        setLoading(true);

        conversationHistory.push({ role: "user", parts: [{ text: question }] });

        chrome.runtime.sendMessage(
            {
                type: "ASK_GEMINI",
                apiKey,
                history: conversationHistory,
                problemTitle: context?.problem_title || "unknown",
                editorial: context?.solution_text || null
            },
            (response) => {
                setLoading(false);
                if (response?.error) {
                    addMessage("assistant", `Error: ${response.error}`);
                    conversationHistory.pop();
                } else {
                    const reply = response?.text || "No response.";
                    conversationHistory.push({ role: "model", parts: [{ text: reply }] });
                    addMessage("assistant", reply);
                }
            }
        );
    }

    // ── Events ─────────────────────────────────────────────────────────────────

    fab.addEventListener("click", toggleSidebar);
    document.getElementById("usaco-ext-close-sidebar-btn").addEventListener("click", () => sidebar.classList.remove("open"));
    askBtn.addEventListener("click", askQuestion);
    textareaEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askQuestion(); }
    });
    settingsBtn.addEventListener("click", async () => {
        const stored = await chrome.storage.local.get("gemini_key");
        if (stored.gemini_key) keyInput.value = stored.gemini_key;
        settingsPanel.classList.add("open");
    });
    closeSettings.addEventListener("click", () => settingsPanel.classList.remove("open"));
    saveBtn.addEventListener("click", async () => {
        await chrome.storage.local.set({ gemini_key: keyInput.value.trim() });
        settingsPanel.classList.remove("open");
    });

    chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === "TOGGLE_SIDEBAR") toggleSidebar();
    });
})();
