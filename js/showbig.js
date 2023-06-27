function showBigImgHelper() {
    let isShowBtn = false;
    chrome.storage.local.get(['isShowBtn'], function (valueArray) {
        if (valueArray.isShowBtn !== undefined) {
            isShowBtn = valueArray.isShowBtn;
        }
    });
    $(function () {
        let tempHtml = `
                        <div id="lxZoomMask">
                          <div id="lxBackBg"></div>
                          <a id="lxTopLink" href="#" target="_blank"></a>
                          <div id="lxClose"></div>
                          <img id="lxZoomImg" alt="当前图片" src=""/>
                          <div id="lxTool"> 
                            <div id="lxToolBig" class="lxToolItem" title="放大"></div>
                            <div id="lxToolSmall" class="lxToolItem" title="缩小"></div>
                            <!--<div id="lxToolDownLoad" class="lxToolItem" title="下载"></div>-->
                            <div id="lxToolRotate" class="lxToolItem" title="旋转"></div>
                            <div id="lxToolRefre" class="lxToolItem" title="还原"></div>
                          </div>
                          
                          <div id="lxSwitchLeft"></div>
                          <div id="lxSwitchRight"></div>
                          <div id="lxImgInfo"></div>
                        </div>
        `;
        $("body").append(tempHtml);
        let thisImg = $("#lxZoomImg");
        let orginImgWidth = thisImg[0].naturalWidth;
        let orginImgHeight = thisImg[0].naturalHeight;
        let currentImgIndex = 0;
        let $lxZoomMask = $("#lxZoomMask");

       
        function initializeImg() {
            let cW = document.documentElement.clientWidth,
            cH = document.documentElement.clientHeight;
            // 调整图片
            const setSize = function() {
                orginImgWidth = thisImg[0].naturalWidth;
                orginImgHeight = thisImg[0].naturalHeight;
                // 修改当图片过高时，调整
                if (orginImgHeight > cH - 60) {
                    // console.log('update before: ', orginImgWidth, orginImgHeight, cH)
                    let newOrginImgHeight = cH - 60
                    orginImgWidth = Math.floor(orginImgWidth * (newOrginImgHeight / orginImgHeight))
                    orginImgHeight = newOrginImgHeight
                    // console.log('update after: ', orginImgWidth, orginImgHeight)
                }
                // 修改当图片过宽时，调整
                if (orginImgWidth > cW - 100) {
                    let newOrginImgWidth = cW - 100
                    orginImgHeight = Math.floor(orginImgHeight * (newOrginImgWidth / orginImgWidth))
                    orginImgWidth = newOrginImgWidth
                }
            }
            setSize()
            let left = (cW - orginImgWidth) / 2,
            top = (cH - orginImgHeight) / 2;
            if (orginImgHeight === cH - 60) top = 10
            thisImg.width(orginImgWidth + "px").height(orginImgHeight + "px");
            thisImg.css("left", left + "px").css("top", top + "px");
            thisImg.css("transform", "");
            $("#lxImgInfo").html(orginImgWidth + "x" + orginImgHeight + "&nbsp;&nbsp;&nbsp;&nbsp; " + (currentImgIndex + 1) + "/" + $("body img").length);
            $lxZoomMask.find(".lxPecentTip").remove();
            // $('<div class="lxPecentTip">100%</div>').appendTo($lxZoomMask).fadeOut(1000);
        }

        $lxZoomMask.css({display: "block", transform: "scale(0)"})
        function showContainer(){
            $lxZoomMask.css({transform: "scale(1)"})
        }
        function hideContainer(){
            $lxZoomMask.css({transform: "scale(0)"})
        }

        function addEvent(obj, sType, fn) {
            obj.addEventListener(sType, fn, false);
        }
        function removeEvent(obj, sType, fn) {
            obj.removeEventListener(sType, fn, false);
        }
        function prEvent(ev) {
            let oEvent = ev || window.event;
            if (oEvent.preventDefault) {
                oEvent.preventDefault();
            }
            return oEvent;
        }
        function zoomImg(clientX, clientY, ratioDelta) {
            let ratioL = (clientX - thisImg[0].offsetLeft) / thisImg[0].offsetWidth,
            ratioT = (clientY - thisImg[0].offsetTop) / thisImg[0].offsetHeight,
            w = parseInt(thisImg[0].offsetWidth * ratioDelta),
            h = parseInt(thisImg[0].offsetHeight * ratioDelta),
            l = Math.round(clientX - (w * ratioL)),
            t = Math.round(clientY - (h * ratioT));
            let percent = (w / orginImgWidth * 100).toFixed(0);
            if (percent > 95 && percent < 105) {
                percent = 100;
                w = orginImgWidth;
                h = orginImgHeight;
            } else if (percent >= 3000) {
                percent = 3000;
                w = orginImgWidth * 30;
                h = orginImgHeight * 30;
            } else if (percent <= 5) {
                percent = 5;
                w = orginImgWidth / 20;
                h = orginImgHeight / 20;
            }
            with (thisImg[0].style) {
                width = w + 'px';
                height = h + 'px';
                left = l + 'px';
                top = t + 'px';
            }
            $lxZoomMask.find(".lxPecentTip").remove();
            $('<div class="lxPecentTip">' + percent + '%</div>').appendTo($lxZoomMask).fadeOut(1000);
        }
        $lxZoomMask[0].addEventListener("mousewheel", function (e) {
            e.preventDefault();
            let _delta = parseInt(e.wheelDelta || -e.detail);
            if (_delta > 0) {
                switchLeft();
            } else {
                switchRight();
            }
        });
        $("#lxBackBg").click(function () {
            hideContainer();
        });
        thisImg[0].addEventListener("mousewheel", function (e) {
            e.preventDefault();
            e.cancelBubble = true;
            let _delta = parseInt(e.wheelDelta || -e.detail);
            if (_delta > 0) {
                zoomImg(e.clientX, e.clientY, 1.1);
            } else {
                zoomImg(e.clientX, e.clientY, 0.9);
            }
        });
        let oImg = thisImg[0];
        (function () {
            addEvent(oImg, 'mousedown', function (ev) {
                let oEvent = prEvent(ev),
                oParent = oImg.parentNode,
                disX = oEvent.clientX - oImg.offsetLeft,
                disY = oEvent.clientY - oImg.offsetTop,
                startMove = function (ev) {
                    if (oParent.setCapture) {
                        oParent.setCapture();
                    }
                    let oEvent = ev || window.event,
                    l = oEvent.clientX - disX,
                    t = oEvent.clientY - disY;
                    oImg.style.left = l + 'px';
                    oImg.style.top = t + 'px';
                    oParent.onselectstart = function () {
                        return false;
                    }
                },
                endMove = function (ev) {
                    if (oParent.releaseCapture) {
                        oParent.releaseCapture();
                    }
                    oParent.onselectstart = null;
                    removeEvent(oParent, 'mousemove', startMove);
                    removeEvent(oParent, 'mouseup', endMove);
                };
                addEvent(oParent, 'mousemove', startMove);
                addEvent(oParent, 'mouseup', endMove);
                return false;
            });
        })();
        document.onkeydown = function (e) {
            e = e || window.event;
            if (e.keyCode) {
                if (e.keyCode === 37) {
                    switchLeft();
                } else if (e.keyCode === 39) {
                    switchRight();
                } else if (e.keyCode === 27) {
                    hideContainer();
                }
            }
        };
        function saveImg() {
            let img = thisImg[0];
            let alink = document.createElement("a");
            alink.href = img.src;
            alink.download = img.src;
            alink.click();
        }
        function switchLeft() {
            currentImgIndex--;
            let img = $("body img");
            if (currentImgIndex < 0) {
                currentImgIndex = img.length;
            }
            let nextImg = img.eq(currentImgIndex);
            let url = nextImg.attr("src");
            thisImg.attr("src", getOrginUrl(url));
            setItemUrl(nextImg);
        }
        function switchRight() {
            currentImgIndex++;
            let img = $("body img");
            if (currentImgIndex > img.length) {
                currentImgIndex = 0;
            }
            let nextImg = img.eq(currentImgIndex);
            let url = nextImg.attr("src");
            thisImg.attr("src", getOrginUrl(url));
            setItemUrl(nextImg);
        }
        function setItemUrl(currentElement) {
            if (currentElement.parent("a").length > 0) {
                let parentA = currentElement.parent("a").eq(0);
                let parentAUrl = parentA.attr("href");
                let title = parentA.attr("title");
                if (title === undefined || title === "") {
                    title = currentElement.attr("alt");
                }
                if (title === undefined || title === "") {
                    title = currentElement.parents("li").eq(0).text().replace("放大图片", "").replace("<", "").replace(">", "");
                }
                if (title === undefined || title === "") {
                    title = (currentImgIndex + 1) + "";
                }
                $("#lxTopLink").html(title).attr("href", parentAUrl);
            } else {
                $("#lxTopLink").html("");
            }
        }
        $("#lxClose").click(function () {
            hideContainer();
        });
        $("#lxSwitchLeft").click(function () {
            switchLeft();
        });
        $("#lxSwitchRight").click(function () {
            switchRight();
        });
        $("#lxToolBig").click(function () {
            let x = document.documentElement.clientWidth / 2;
            let y = document.documentElement.clientHeight / 2;
            zoomImg(x, y, 1.1);
        });
        $("#lxToolSmall").click(function () {
            let x = document.documentElement.clientWidth / 2;
            let y = document.documentElement.clientHeight / 2;
            zoomImg(x, y, 0.9);
        });
        // $("#lxToolDownLoad").click(function () {
        //     saveImg();
        // });
        $("#lxToolRotate").click(function () {
            let ratateDeg = 90;
            let ratateDegStr = thisImg[0].style.transform;
            if (ratateDegStr.indexOf("rotate(") === 0 && ratateDegStr.indexOf("rotate(360") < 0) {
                ratateDeg = parseInt(ratateDegStr.replace("rotate(", "").replace("deg)", "")) + 90;
            }
            thisImg[0].style.transform = 'rotate(' + ratateDeg + 'deg)';
        });
        $("#lxToolRefre").click(function () {
            initializeImg();
        });
        thisImg.load(function () {
            orginImgWidth = thisImg[0].naturalWidth;
            orginImgHeight = thisImg[0].naturalHeight;
            initializeImg();
        });
        function getOrginUrl(url) {
            return url;
        }
        $("body").delegate("img", "mouseenter", function () {
            if ($lxZoomMask.is(":hidden")) {
                currentImgIndex = $("body img").index(this);
            }

            if (isShowBtn) {
                let thisImgUrl = $(this).attr("src");
                let showBigTip = $(this).parent().find(".lxShowBigTip");
                if (showBigTip.length <= 0) {
                    $(this).parent().append('<section class="lxShowBigTip" title="预览" style="display: block;"></section>');
                }
                showBigTip.attr({showUrl: thisImgUrl})
                $(this).parent().bind("mouseleave", function () {
                    $("body").find(".lxShowBigTip").stop().fadeOut(200)
                });

                if ($(this).parents('#lxZoomMask').length <= 0) {
                    if (showBigTip.length !== 0) {
                        showBigTip.stop().fadeIn(200)
                    }
                }
            }
        });
        $("body").delegate(".lxShowBigTip", "click", function (e) {
            e.preventDefault();
            let orginImgUrl = getOrginUrl($(this).attr("showUrl"));
            thisImg.attr("src", orginImgUrl);
            showContainer();
            setItemUrl($(this).parent().find("img").eq(0));
        });
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.type === 'RGShowBig') {
                let originImgUrl = getOrginUrl(request.url);
                thisImg.attr("src", originImgUrl);
                showContainer();
                let currentUrlImgArr = $(`body img[src='${originImgUrl}']`)
                currentImgIndex = $("body img").index(currentUrlImgArr[0]);
                setItemUrl($("body img").eq(currentImgIndex));
            }
        });
    });
}
showBigImgHelper();
