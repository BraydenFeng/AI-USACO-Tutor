chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SIDEBAR" });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "ASK_GEMINI") {
        const { apiKey, history, problemTitle, editorial } = msg;

        const systemInstruction = editorial
            ? `You are a USACO tutor helping a student solve "${problemTitle}".

RULES — follow these strictly:
1. NEVER give the full solution, working code, or a complete algorithm. If the student asks for it directly, refuse and redirect.
2. Give ONE hint at a time. Wait for the student to respond before going further.
3. Ask guiding questions to help the student discover the insight themselves.
4. If the student is stuck, nudge them toward the right data structure or observation — don't explain it outright.
5. If the student shares code or an approach, point out what's right and ask a targeted question about what's wrong.
6. Keep responses short. One or two paragraphs max.
7. Only reveal the next layer of the solution after the student has demonstrated they understood the previous hint.

You have the official editorial for reference only — use it to know what hints to give, not to copy from.

Editorial:
${editorial}`
            : `You are a USACO tutor helping a student with a competitive programming problem.

RULES — follow these strictly:
1. NEVER give the full solution or working code. If asked directly, refuse and redirect.
2. Give ONE hint at a time and wait for the student to respond.
3. Ask guiding questions to help the student discover insights themselves.
4. Keep responses short — one or two paragraphs max.
5. No editorial is available, so reason from general competitive programming knowledge.
6. THE USER DOES NOT HAVE THE EDITORIAL, SO THEY ARE UNABLE TO REFERENCE FROM IT.
`;


        const contents = [
            { role: "user", parts: [{ text: systemInstruction }] },
            { role: "model", parts: [{ text: "Understood! I'm ready to help." }] },
            ...history
        ];

        const body = { contents };

        const models = [
            "gemini-2.5-flash",
            "gemini-3-flash-preview",
            "gemini-2.5-flash-lite",
            "gemini-3.1-flash-lite-preview"
        ];

        async function tryModels(index) {
            if (index >= models.length) {
                sendResponse({ error: "All models are rate limited. Please try again later." });
                return;
            }
            const currentModel = models[index];
            try {
                const r = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body)
                    }
                );
                const data = await r.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    sendResponse({ text });
                } else {
                    const errCode = data?.error?.code;
                    const errMsg = data?.error?.message || "No response from Gemini.";
                    if (errCode === 429) {
                        tryModels(index + 1);
                    } else {
                        sendResponse({ error: errMsg });
                    }
                }
            } catch (e) {
                sendResponse({ error: e.message });
            }
        }

        tryModels(0);

        return true;
    }
});
