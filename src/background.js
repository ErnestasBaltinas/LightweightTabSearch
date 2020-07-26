// updates open tab counter
updateTabCounter();

chrome.browserAction.setBadgeBackgroundColor({"color": "#3fa5ff"});
chrome.tabs.onCreated.addListener(updateTabCounter);
chrome.tabs.onRemoved.addListener(updateTabCounter);

function updateTabCounter() {
  chrome.tabs.query({}, function (tabs){

    // exclude incognito tabs
    const tempTabs = tabs.filter(tab => !tab.incognito);

    chrome.browserAction.setBadgeText({text: tempTabs.length.toString()});
  });
}