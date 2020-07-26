let tabs = [], searchInputValue = "";

// Initialize
init();

function init() {

    chrome.tabs.query({}, function (tabsArray){
        tabs = tabsArray;
        prepareTabs();
    });
}

/** tabs **/

/**
 * Gets last searched query and uses it to filter tabs.
 */
function prepareTabs() {
    chrome.storage.local.get(["ltsLastSearchedQuery"], function(result) {

        if (typeof result.ltsLastSearchedQuery !== 'undefined') {
            searchInputValue = result.ltsLastSearchedQuery;
        }

        document.getElementById("searchInput").value = searchInputValue;
        document.getElementById("searchInput").focus();
        document.getElementById("searchInput").select();
        filterTabs(searchInputValue);
    });
}

/**
 * Filters tabs list.
 * @param value Search input value.
 */
function filterTabs(value) {
    searchInputValue = value;

    const tempTabs = tabs.filter(tab => {
        return (tab.title.toLowerCase().includes(searchInputValue.toLowerCase()) || tab.url.toLowerCase().includes(searchInputValue.toLowerCase())) 
            && tab.incognito == false;
    });

    updateTabs(tempTabs);
}

/**
 * Renders tabs.
 * @param tabs Array of tabs.
 */
function updateTabs(tabs) {
    let tabList = document.getElementsByClassName("tabs")[0];

    // clears all tabs
    while (tabList.firstChild) tabList.removeChild(tabList.firstChild);

    if(tabs.length > 0) {

        for (var i = 0; i < tabs.length; i++) {
            let tab = document.createElement("li"),
                tabTitle = document.createElement("div"),
                tabTitleText = document.createElement("span"),
                tabUrl = document.createElement("div"),
                tabUrlText = document.createElement("span"),
                tabClose = document.createElement("div");

            if ( i == 0 ) {
                tab.classList.add("active");
            }
            tab.classList.add("tab");
            tab.setAttribute("id", tabs[i].id);
            tab.setAttribute("data-windowId", tabs[i].windowId);
            
            tab.addEventListener("click", handleMouseClick, false);

            tabTitleText.innerHTML = formatSearchedString(tabs[i].title);
            tabTitle.appendChild(tabTitleText);
            tabTitle.classList.add("tabTitle");

            tabUrlText.innerHTML = formatSearchedString(tabs[i].url);
            tabUrl.appendChild(tabUrlText);
            tabUrl.classList.add("tabHost");

            tab.appendChild(tabTitle);
            tab.appendChild(tabUrl);

            tabClose.classList.add("close");
            tabClose.addEventListener("click", handleCloseClick, false);
            tab.appendChild(tabClose);

            tabList.appendChild(tab);
        }
    } else {
        let noTabs = document.createElement("div");
        noTabs.classList.add("noTabs");
        noTabs.appendChild(document.createTextNode("No tabs found"));
        tabList.appendChild(noTabs);
    }
}

/**
 * Highlights next tab in the tabs list.
 */
function nextTab() {
    let currTab = document.getElementsByClassName("tab active")[0];

    if(!isVisibleInViewport(currTab)) {
        currTab.scrollIntoView();
    }

    if (currTab.nextSibling) {
        if(!isVisibleInViewport(currTab.nextSibling)) {
            document.getElementById("tabsContainer").scrollBy(0, currTab.nextSibling.clientHeight);
        }

        currTab.classList.remove("active");
        currTab.nextSibling.classList.add("active");
    }
}

/**
 * Highlights previous tab in the tabs list.
 */
function prevTab() {
    let currTab = document.getElementsByClassName("tab active")[0];

    if(!isVisibleInViewport(currTab)) {
        currTab.scrollIntoView();
    }

    if (currTab.previousSibling) {

        if(!isVisibleInViewport(currTab.previousSibling)) {
            document.getElementById("tabsContainer").scrollBy(0, -45);
        }

        currTab.classList.remove("active");
        currTab.previousSibling.classList.add("active");
    }
}

/**
 * Opens selected tab.
 * @param element Selected tab.
 */
function setTabActive(element) {

    if (typeof element == 'undefined') return; // do nothing if passed element is undefined

    const tabId = parseInt(element.id), 
    windowId = parseInt(element.getAttribute("data-windowId"));

    chrome.windows.update(windowId, {"focused":true});
    chrome.tabs.update(tabId, {"active": true});

    window.close();
}

/**
 * Closes selected tab.
 * @param element Selected tab.
 */
function closeSelectedTab(element) {
    const tabId = parseInt(element.id);

    tabs = tabs.filter(tab => tab.id != tabId);

    chrome.tabs.remove(tabId);
}

/** click events **/

document.getElementById("body").onkeyup = function (e) {

    switch(e.keyCode) {
        case 40:
            // Arrow down
            nextTab();
          break;
        case 38:
            // Arrow Up
            prevTab();
          break;
        case 13:
            // Enter
            setTabActive(document.getElementsByClassName("tab active")[0]);
          break;
        case 27:
            // ESC
            window.close();
          break;
        case 37: // Arrow left
        case 39: // Arrow right
            // do nothing
            break
        case 46:
            // Delete
            closeSelectedTab(document.getElementsByClassName("tab active")[0]);
            filterTabs(document.getElementById("searchInput").value);
            break
        default:
            saveLastSearchedQuery(document.getElementById("searchInput").value);
            filterTabs(document.getElementById("searchInput").value);
      }

};

/**
 * Event is fired on key enter and 'X' button at the end of the field
 */
document.getElementById("searchInput").onsearch = event => {
    const searchValue = event.srcElement.value;

    // when search field is cleared 'X'
    if (searchValue.length === 0 && searchInputValue !== searchValue) {
        saveLastSearchedQuery(searchValue);
        filterTabs(searchValue);
    }
};

/**
 * Opens selected tab on mouse click.
 */
function handleMouseClick() {
    setTabActive(this);
}

/**
 * Closes selected tab on close button click.
 */
function handleCloseClick(e) {
    e.stopPropagation();
    closeSelectedTab(this.parentElement);
    filterTabs(searchInputValue);
}

/** common functions **/

/**
 * Highlights particular part of a string based on search input.
 * @param value Text value, f.e.: tab title, tab url.
 */
function formatSearchedString(value) {

    if (searchInputValue.length > 0 && value.toLowerCase().indexOf(searchInputValue.toLowerCase()) > -1) {
        let searchInput = searchInputValue.toLowerCase(),
            element = document.createElement("span"),
            start = value.substr(0, value.toLowerCase().indexOf(searchInput)),
            searchedPart = value.substr(value.toLowerCase().indexOf(searchInput), searchInput.length),
            end = value.substr(value.toLowerCase().indexOf(searchInput) + searchInput.length);

        return element.innerHTML = `${start}<b>${searchedPart}</b>${end}`;
    } else {
        return value;
    }
}

/**
 * Check if tab element is visible within the viewport.
 * @param element Tab element.
 */
function isVisibleInViewport(element) {
    // Get it's position in the viewport
    const bounding = element.getBoundingClientRect();

    return  bounding.top >= document.getElementById("tabsContainer").offsetTop &&
        bounding.left >= 0 &&
        bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&
        bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight);
}

/**
 * Saves last searched query.
 * @param value Last searched query.
 */
function saveLastSearchedQuery(value) {
    chrome.storage.local.set({ltsLastSearchedQuery: value}, function() {});
}