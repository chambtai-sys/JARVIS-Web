chrome.commands.onCommand.addListener((command) => {
  if (command === "open_jarvis") {
    chrome.sidePanel.setOptions({
        path: 'popup.html',
        enabled: true
    });
    console.log("J.A.R.V.I.S Activated via shortcut.");
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get_tab_info") {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            sendResponse({url: tabs[0].url, title: tabs[0].title});
        });
        return true; 
    }
});