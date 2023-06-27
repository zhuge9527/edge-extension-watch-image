$(function () {
    $("#isShowBtn").on("change", function () {
        chrome.storage.local.set({"isShowBtn": $(this)[0].checked}, function () {
        });
    });
    chrome.storage.local.get(['isShowBtn'], function (valueArray) {
        if (valueArray.isShowBtn !== undefined) {
            $("#isShowBtn").attr("checked", valueArray.isShowBtn);
        }
    });

    $("#isShowBtnOnTheMenu").on("change", function () {
        chrome.storage.local.set({"isShowBtnOnTheMenu": $(this)[0].checked}, function () {
        });
        if ( $(this)[0].checked) {
            chrome.contextMenus.create({
                "id": "picture_preview",
                "title": "查看图片",
                "contexts": ["image"]
            });
        }else {
            chrome.contextMenus.removeAll();
        }
    });
    chrome.storage.local.get(['isShowBtnOnTheMenu'], function (valueArray) {
        let isShow = valueArray.isShowBtnOnTheMenu;
        if (isShow !== undefined) {
            $("#isShowBtnOnTheMenu").attr("checked", isShow);
            if (!isShow) {
                chrome.contextMenus.removeAll();
            }
        }
    });
});