document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    const toggleSettings = document.getElementById('toggle-settings');
    const settingsPane = document.getElementById('settings-pane');

    // Load saved settings
    chrome.storage.local.get(['jarvisApiKey', 'jarvisModel'], (result) => {
        if (result.jarvisApiKey) apiKeyInput.value = result.jarvisApiKey;
        if (result.jarvisModel) modelSelect.value = result.jarvisModel;
    });

    toggleSettings.onclick = (e) => {
        e.preventDefault();
        settingsPane.style.display = settingsPane.style.display === 'none' ? 'block' : 'none';
    };

    sendBtn.onclick = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        userInput.value = '';

        const apiKey = apiKeyInput.value;
        const model = modelSelect.value;

        // Save keys on every send for convenience in this prototype
        chrome.storage.local.set({ jarvisApiKey: apiKey, jarvisModel: model });

        if (!apiKey) {
            appendMessage('jarvis', 'Sir, I require an API key to access my cognitive processors. Please enter it in Settings.');
            return;
        }

        appendMessage('jarvis', 'Processing...');
        
        try {
            const response = await callAI(apiKey, model, text);
            removeLastMessage(); // Remove "Processing..."
            appendMessage('jarvis', response);
        } catch (err) {
            removeLastMessage();
            appendMessage('jarvis', 'Sir, there was an error communicating with the mainframe: ' + err.message);
        }
    };

    function appendMessage(sender, text) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.innerText = sender === 'jarvis' ? `J.A.R.V.I.S: ${text}` : `You: ${text}`;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function removeLastMessage() {
        if (chatWindow.lastChild) chatWindow.removeChild(chatWindow.lastChild);
    }

    async function callAI(apiKey, model, prompt) {
        if (model.includes('gpt')) {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error.message);
            return data.choices[0].message.content;
        } else {
            return "Sir, I am still calibrating my Claude-based heuristics. Please use the GPT-4o uplink for now.";
        }
    }
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });
});