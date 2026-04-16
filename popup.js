let context = null;
let conversationHistory = [];

const chatEl        = document.querySelector(".chat");
const questionEl    = document.getElementById("question");
const askBtn        = document.getElementById("ask");
const openSettings  = document.getElementById("open_settings");
const closeSettings = document.getElementById("close_settings");
const settingsPanel = document.getElementById("settings_panel");
const geminiKeyEl   = document.getElementById("gemini_key");
const themeSelect   = document.getElementById("theme_select");
const saveKeyBtn    = document.getElementById("save_key");

function applyTheme(theme) {
    if (theme === "system") {
        document.body.removeAttribute("data-theme");
    } else {
        document.body.setAttribute("data-theme", theme);
    }
}

function renderMarkdown(text) {
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
        `<pre><code>${code.trimEnd()}</code></pre>`
    );

    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(?!<\/?(pre|code)[^>]*>)\n/g, "<br>");

    return html;
}

function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = "message";
    if (role === "user") {
        div.style.marginTop = "8px";
        div.style.background = "var(--primary)";
        div.style.color = "#fff";
        div.style.border = "none";
    } else {
        div.style.marginTop = "8px";
    }
    div.innerHTML = renderMarkdown(text);
    chatEl.appendChild(div);
    chatEl.scrollTop = chatEl.scrollHeight;
    return div;
}

function setLoading(loading) {
    askBtn.disabled = loading;
    askBtn.textContent = loading ? "Thinking…" : "Ask";
}

async function init() {
    const stored = await chrome.storage.local.get(["gemini_key", "theme"]);
    if (stored.gemini_key) geminiKeyEl.value = stored.gemini_key;
    const theme = stored.theme || "system";
    themeSelect.value = theme;
    applyTheme(theme);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url?.includes("usaco.org")) {
        addMessage("assistant", "Navigate to a USACO problem page and reopen this popup.");
        return;
    }

    const loadingMsg = addMessage("assistant", "Loading problem context…");

    chrome.tabs.sendMessage(tab.id, { type: "GET_CONTEXT" }, (response) => {
        loadingMsg.remove();

        if (chrome.runtime.lastError) {
            addMessage("assistant", "Could not connect to the page. Try refreshing.");
            return;
        }

        if (!response || response.error) {
            const err = response?.error || "Unknown error";
            addMessage("assistant", `Could not load editorial: ${err}`);
            questionEl.disabled = true;
            askBtn.disabled = true;
            return;
        } else {
            context = response;
            addMessage(
                "assistant",
                `Loaded **${context.problem_title}**. I have the editorial ready.\n\nAsk me anything — hints, approach, complexity, or anything else!`
            );
        }
    });
}

async function askQuestion() {
    const question = questionEl.value.trim();
    if (!question) return;

    const stored = await chrome.storage.local.get("gemini_key");
    const apiKey = stored.gemini_key;
    if (!apiKey) {
        addMessage("assistant", "Please enter your Gemini API key in Settings first.");
        return;
    }

    addMessage("user", question);
    questionEl.value = "";
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

askBtn.addEventListener("click", askQuestion);

questionEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        askQuestion();
    }
});

openSettings.addEventListener("click", () => settingsPanel.classList.add("open"));
closeSettings.addEventListener("click", () => settingsPanel.classList.remove("open"));

saveKeyBtn.addEventListener("click", async () => {
    const key = geminiKeyEl.value.trim();
    const theme = themeSelect.value;
    await chrome.storage.local.set({ gemini_key: key, theme });
    applyTheme(theme);
    settingsPanel.classList.remove("open");
});

themeSelect.addEventListener("change", () => applyTheme(themeSelect.value));

init();
