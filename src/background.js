// updates open tab counter
updateTabCounter();

chrome.action.setBadgeBackgroundColor({"color": "#3fa5ff"});
chrome.tabs.onCreated.addListener(updateTabCounter);
chrome.tabs.onRemoved.addListener(updateTabCounter);

function updateTabCounter() {
  chrome.tabs.query({}, function (tabs){

    // exclude incognito tabs
    const tempTabs = tabs.filter(tab => !tab.incognito);

    chrome.action.setBadgeText({text: tempTabs.length.toString()});
  });
}