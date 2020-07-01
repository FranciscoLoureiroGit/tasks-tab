chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({url: 'newtab.html'});
});