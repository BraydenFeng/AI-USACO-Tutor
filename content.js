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
        /* ── FAB ── */
        #usaco-ext-fab {
            position: fixed;
            bottom: 28px;
            left: 28px;
            width: 46px;
            height: 46px;
            border-radius: 12px;
            background: #0369a1;
            color: #fff;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            z-index: 2147483647;
            overflow: visible;
            box-shadow: 0 4px 20px rgba(3, 105, 161, 0.5), 0 0 0 0 rgba(6, 182, 212, 0.4);
            user-select: none;
            border: none;
            padding: 0;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
        }
        #usaco-ext-fab::after {
            content: '';
            position: absolute;
            inset: -5px;
            border-radius: 16px;
            border: 1.5px solid rgba(6, 182, 212, 0.35);
            animation: usaco-fab-pulse 2.8s ease-in-out infinite;
            pointer-events: none;
        }
        @keyframes usaco-fab-pulse {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50%       { opacity: 0.6; transform: scale(1.07); }
        }
        #usaco-ext-fab:hover {
            transform: translateY(-2px) scale(1.06);
            box-shadow: 0 8px 28px rgba(3, 105, 161, 0.65), 0 0 0 0 rgba(6, 182, 212, 0.3);
        }

        /* ── Sidebar ── */
        #usaco-ext-sidebar {
            position: fixed;
            top: 0;
            right: 0;
            width: 22vw;
            min-width: 290px;
            max-width: 400px;
            height: 100vh;
            background: #07111f;
            border-left: 1px solid #1c2f47;
            z-index: 2147483646;
            display: none;
            flex-direction: column;
            font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
            font-size: 13px;
            color: #dde5f0;
            box-shadow: -6px 0 40px rgba(0, 0, 0, 0.55);
            overflow: hidden;
        }
        #usaco-ext-sidebar.open {
            display: flex;
            animation: usaco-sidebar-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes usaco-sidebar-in {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
        }

        /* ── Header ── */
        #usaco-ext-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 11px 14px;
            border-bottom: 1px solid #1c2f47;
            background: #0a1828;
            flex-shrink: 0;
            position: relative;
        }
        #usaco-ext-header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 55%;
            height: 1px;
            background: linear-gradient(90deg, #06b6d4 0%, transparent 100%);
        }
        #usaco-ext-brand {
            font-weight: 600;
            font-size: 12.5px;
            display: flex;
            align-items: center;
            gap: 7px;
            font-family: 'Consolas', 'Courier New', monospace;
            color: #dde5f0;
            letter-spacing: -0.01em;
        }
        #usaco-ext-brand::before {
            content: '>';
            color: #06b6d4;
            font-size: 13px;
        }
        #usaco-ext-rating {
            font-size: 11px;
            font-weight: 700;
            border-radius: 999px;
            padding: 2px 9px;
            font-family: 'Consolas', 'Courier New', monospace;
            letter-spacing: 0.02em;
        }
        #usaco-ext-settings-btn, #usaco-ext-close-sidebar-btn {
            cursor: pointer;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: #4d6a8a;
            padding: 0;
            line-height: 1;
            font-size: 14px;
            border-radius: 5px;
            transition: color 0.15s, background 0.15s;
        }
        #usaco-ext-settings-btn:hover, #usaco-ext-close-sidebar-btn:hover {
            color: #dde5f0;
            background: #132238;
        }

        /* ── Chat ── */
        #usaco-ext-chat {
            flex: 1;
            overflow-y: auto;
            padding: 14px 12px;
            display: flex;
            flex-direction: column;
            gap: 9px;
            background: #07111f;
            scrollbar-width: thin;
            scrollbar-color: #1c2f47 transparent;
        }
        #usaco-ext-chat::-webkit-scrollbar { width: 4px; }
        #usaco-ext-chat::-webkit-scrollbar-track { background: transparent; }
        #usaco-ext-chat::-webkit-scrollbar-thumb { background: #1c2f47; border-radius: 2px; }

        /* ── Messages ── */
        .usaco-ext-msg {
            max-width: 90%;
            align-self: flex-start;
            border-radius: 10px 10px 10px 2px;
            padding: 9px 12px;
            font-size: 13px;
            line-height: 1.58;
            border: 1px solid #1c2f47;
            background: #0d1a2d;
            color: #c8d8ec;
            word-break: break-word;
            animation: usaco-msg-in 0.17s ease-out both;
        }
        @keyframes usaco-msg-in {
            from { opacity: 0; transform: translateY(5px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .usaco-ext-msg.user {
            align-self: flex-end;
            background: #0c3058;
            border-color: #0369a1;
            color: #e0f0fc;
            border-radius: 10px 10px 2px 10px;
        }
        .usaco-ext-msg pre {
            margin: 8px 0;
            padding: 9px 11px;
            border-radius: 6px;
            border: 1px solid #1c2f47;
            background: #030c18;
            overflow-x: auto;
            font-size: 11.5px;
            scrollbar-width: thin;
            scrollbar-color: #1c2f47 transparent;
        }
        .usaco-ext-msg code {
            font-family: 'Consolas', 'Courier New', ui-monospace, monospace;
            font-size: 11.5px;
            color: #7dd3fc;
        }
        .usaco-ext-msg pre code {
            color: #a5d8f5;
        }

        /* ── Input area ── */
        #usaco-ext-input-area {
            padding: 11px 12px;
            border-top: 1px solid #1c2f47;
            flex-shrink: 0;
            background: #0a1828;
        }
        #usaco-ext-textarea {
            width: 100%;
            min-height: 50px;
            resize: none;
            background: #07111f;
            border: 1px solid #1c2f47;
            border-radius: 8px;
            color: #dde5f0;
            padding: 8px 11px;
            font-size: 13px;
            font-family: 'Segoe UI', -apple-system, system-ui, sans-serif;
            box-sizing: border-box;
            outline: none;
            line-height: 1.5;
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        #usaco-ext-textarea:focus {
            border-color: #06b6d4;
            box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.12);
        }
        #usaco-ext-textarea::placeholder { color: #243548; }
        #usaco-ext-ask-btn {
            margin-top: 8px;
            width: 100%;
            background: #0369a1;
            border: none;
            padding: 8px 12px;
            border-radius: 7px;
            color: #fff;
            cursor: pointer;
            font-size: 11.5px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-weight: 600;
            letter-spacing: 0.06em;
            transition: background 0.15s, transform 0.1s;
        }
        #usaco-ext-ask-btn:hover { background: #0284c7; }
        #usaco-ext-ask-btn:active { transform: scale(0.98); }
        #usaco-ext-ask-btn:disabled { background: #132238; color: #2a4060; cursor: default; transform: none; }

        /* ── Settings panel ── */
        #usaco-ext-settings-panel {
            position: absolute;
            inset: 0;
            background: #07111f;
            display: none;
            flex-direction: column;
            padding: 16px;
            z-index: 10;
        }
        #usaco-ext-settings-panel.open {
            display: flex;
            animation: usaco-panel-in 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes usaco-panel-in {
            from { opacity: 0; transform: translateX(16px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        #usaco-ext-settings-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 18px;
            padding-bottom: 12px;
            border-bottom: 1px solid #1c2f47;
        }
        #usaco-ext-settings-head h3 {
            margin: 0;
            font-size: 12.5px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-weight: 600;
            color: #dde5f0;
            letter-spacing: -0.01em;
        }
        #usaco-ext-settings-head h3::before {
            content: '# ';
            color: #06b6d4;
        }
        #usaco-ext-close-settings {
            background: #132238;
            border: 1px solid #1c2f47;
            border-radius: 5px;
            padding: 5px 12px;
            cursor: pointer;
            font-size: 11px;
            color: #4d6a8a;
            font-family: 'Consolas', monospace;
            letter-spacing: 0.04em;
            transition: background 0.15s, color 0.15s;
        }
        #usaco-ext-close-settings:hover {
            background: #1c2f47;
            color: #dde5f0;
        }
        .usaco-ext-label {
            font-size: 10px;
            font-weight: 600;
            margin-bottom: 5px;
            display: block;
            color: #4d6a8a;
            font-family: 'Consolas', monospace;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        #usaco-ext-key-input {
            width: 100%;
            padding: 8px 11px;
            margin-bottom: 14px;
            background: #0a1828;
            border: 1px solid #1c2f47;
            border-radius: 7px;
            color: #dde5f0;
            font-size: 12.5px;
            box-sizing: border-box;
            font-family: 'Segoe UI', system-ui, sans-serif;
            outline: none;
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        #usaco-ext-key-input:focus {
            border-color: #06b6d4;
            box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.12);
        }
        #usaco-ext-key-input::placeholder { color: #243548; }
        #usaco-ext-save-btn {
            background: #132238;
            border: 1px solid #1c2f47;
            padding: 8px 12px;
            border-radius: 7px;
            color: #4d6a8a;
            cursor: pointer;
            font-size: 11px;
            font-family: 'Consolas', monospace;
            letter-spacing: 0.05em;
            transition: background 0.15s, color 0.15s;
        }
        #usaco-ext-save-btn:hover {
            background: #1c2f47;
            color: #dde5f0;
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
