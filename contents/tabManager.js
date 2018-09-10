//找路用代碼
console.log("X");

var tabmg; //jq tabmanager dom 對象
var scrollPosition = 0;
var flagUpdating = false;

var searchInputCount = 0;
var maxSearchWait = 400;

var thisWindowId;

sidebar.initAfter(TabManagerinit);

function TabManagerinit() {
    //導入管理器主體
    $.get(chrome.extension.getURL('/contents/tabManagerDesign.html'), content => {
        tabmg = sidebar.append(content);
    }).then(response => {
        sidebar.onDisplayChange.addListener((sender, args) => {
            if (args.type == 'show') {
                updateTabList();
            }
        });

        //分頁切換控制
        tabmg.on('click', '.tabobj', (event) => {
            if (!event.ctrlKey) {
                let id = getTabIdByObj($(event.target)); //取得分頁id
                chrome.runtime.sendMessage({ 'command': "ChangeCurentTab", 'tabId': id }); //呼叫後台切換分頁
                //changeManagerDisplay(false);  //關閉管理器分頁視窗
            }
        });

        //關閉分頁
        tabmg.on('click', '.closeButton', (event) => { //監聽關閉按鈕按下事件
            closeTab(getListItemByChild($(event.target)));
        })

        //監聽listItem層級滑鼠事件
        tabmg.on("mousedown", '.listItem', function(e) {
            switch (e.which) {
                case 1:
                    {
                        if (e.ctrlKey) {
                            chrome.runtime.sendMessage({
                                'command': "changeTabSelect",
                                'tabId': getTabIdByObj($(e.target).closest('.listItem'))
                            });
                            if (getListItemByChild($(e.target)).first().hasClass('listItem_selected')) {
                                getListItemByChild($(e.target)).first().removeClass('listItem_selected');
                            } else getListItemByChild($(e.target)).first().addClass('listItem_selected');
                        }
                        break;
                    }
                    //滑鼠中鍵
                case 2:
                    {
                        closeTab(getListItemByChild($(e.target)));
                        break;
                    }
                    //滑鼠右鍵
                case 3:
                    {
                        break;
                    }
            }
        });

        tabmg.on("scroll", '.list', function(e) {
            scrollPosition = target.scrollTop;
        });

        tabmg.find('.tabSearchBar').on('input propertychange', async(e) => {

            searchInputCount++;
            let locolCount = searchInputCount;
            setTimeout(() => {
                if (locolCount != searchInputCount) return;
                chrome.runtime.sendMessage({ command: "changeSearchStr", str: $(e.target).val() }, () => {
                    updateTabList(false);
                });
            }, maxSearchWait);
        });

        tabmg.find('.tabSearchBar').on('click', () => {
            tabmg.find('.tabSearchBar').select();
        });

        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                switch (request.command) {
                    case "updateManager":
                        {
                            updateTabList();
                            break;
                        }

                    case "onTabAdd":
                        {
                            if (request.tab.windowId != thisWindowId) updateTabList();
                            console.log(makeManagerStr(request.tab));
                            if (request.tab.index != 0) {
                                $(tabmg.find('.listItem')[request.tab.index - 1]).after(makeManagerStr(request.tab));
                            } else {
                                $(tabmg.find('.listItem')[0]).before(makeManagerStr(request.tab));
                            }
                            break;
                        }

                    case "onTabRemove":
                        {
                            tabmg.find('#' + request.tabId).remove();
                            break;
                        }

                    case "onTabChange":
                        {
                            if (tabmg.find('#' + request.tab.id).length == 0) tabmg.find('.list').append(makeManagerStr(request.tab));
                            else tabmg.find('#' + request.tab.id).replaceWith(makeManagerStr(request.tab));
                            break;
                        }

                    default:
                        break;
                }
            }
        )

        //監聽全域按鍵事件
        document.onkeydown = (e) => {
            if (sidebar.isOpened() && !tabmg.find('.tabSearchBar').is(":focus")) {
                console.log("h");
                if (e.which == 27) {
                    chrome.runtime.sendMessage({ command: "cancelSelect" });
                    tabmg.find('.listItem').removeClass('listItem_selected');
                } else if (e.which == 46 && document.activeElement.id != 'sBar' && !tabmg.find('.searchBar').is(":focus")) {
                    closeTabSelect();
                } else if (e.which == 65 && e.ctrlKey && !tabmg.find('.searchBar').is(":focus")) {
                    chrome.runtime.sendMessage({ command: "selectAll" });
                    tabmg.find('.listItem').addClass('listItem_selected');
                    return false;
                }
            }
            return true;
        };
    });
}

//清除分頁列表元素
function cleanManagerList() {
    tabmg.find('div.list').empty();
}

//將js字串轉成html安全字串
function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function makeManagerStr(tab) {
    return `<div class='listItem${tab.managerSelect?' listItem_selected':''} ${tab.matchSearch?'':' invisible'}' id='${tab.id}'>
                <span class='tabobj'>
                    <img class='favicon' src='${((tab.favIconUrl!=null)?tab.favIconUrl:chrome.extension.getURL("imgs/difaultFavicon.png"))}'>
                    <span class='tabtitle'>${htmlEncode(tab.title)}</span>
                </span>
                <img src='${chrome.extension.getURL("imgs/closeButton.png")}' class='closeButton' height='20' width='20'/>
            </div>`
}

//添加分頁列表元素
//tab:chrome.tabs.Tab 物件
function addManagerTab(tab) {
    tabmg.find('.list').append(makeManagerStr(tab));
}

//取得 Tab Id
function getTabIdByObj(jqobj) {
    return jqobj.closest('.listItem').attr('id');
}

//取得 List Item
function getListItemByChild(jqobj) {
    return jqobj.closest('.listItem');
}

function getListItemById(tabId) {
    tabmg.find('.listItem').each((i, e) => {
        let obj = $(e);
        if (getTabIdBy(obj) == tabId) return obj;
    });
}

//取得選取分頁狀態
function IsTabSelect(listItem) {
    return listItem.hasClass('listItem_selected');
}

//關閉分頁並移除列表元素
function closeTab(listItem) {
    chrome.runtime.sendMessage({ 'command': "closeTabs", 'tabIds': Number(getTabIdByObj(listItem)) }); //呼叫後台關閉分頁
    listItem.remove();
}

//關閉選取分頁
function closeTabSelect() {
    let tabIds = [];
    tabmg.find('.listItem_selected').each((i, e) => {
        tabIds.push(Number(getTabIdByObj($(e))));
        e.remove();
    });
    chrome.runtime.sendMessage({ 'command': "closeTabs", 'tabIds': tabIds }); //呼叫後台關閉分頁
}

//刷新分頁列表
function updateTabList(withSearchStr = true) {
    if (flagUpdating) return;
    else flagUpdating = true;
    console.log("updating")
    let tempScrollPosition = scrollPosition;
    cleanManagerList();

    chrome.runtime.sendMessage({ command: "getManagerInfo" }, (res) => { //取得當前分頁列表(內容腳本無權限，需調用後台腳本)    
        if (withSearchStr && tabmg.find('.tabSearchBar').val() != res.searchStr) tabmg.find('.tabSearchBar').val(res.searchStr);

        res.list.sort((a, b) => {
            if (a.index < b.index) return -1;
            else if (a.index > b.index) return 1;
            return 0;
        });

        res.list.forEach(tab => {
            node = addManagerTab(tab);
            thisWindowId = tab.windowId;
        });

        //tabmg.find('.list').scrollTo(0,tempScrollPosition);
        flagUpdating = false;
    });
}