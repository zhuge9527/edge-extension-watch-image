function showBigOnClick(info, tab) {
    chrome.tabs.query({
        active : true,
        currentWindow : true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            type : "RGShowBig",
            url: info.srcUrl
        }, function (response) {});
    });
}
chrome.contextMenus.create({
    "id": "picture_preview_perfect",
    "title": "查看图片-优化版",
    "contexts": ["image"]
});

chrome.contextMenus.onClicked.addListener(function(info,tab) {
    if(info.menuItemId === "picture_preview_perfect") {
        showBigOnClick(info, tab)
    }
});

