chrome.tabs.onUpdated.addListener(listener)


function listener(tabId, changeInfo, tab) {
    let msg = {
        txt: 'hello',
    }
    
    setTimeout(function() {
        chrome.tabs.sendMessage(tabId, msg)
    },3000)
}