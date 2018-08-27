/*
    tabManagerBg.js
    分頁管理器處理用後台腳本
    編輯者： louis
    最後編輯時間：2018/6/9 10:00
*/
 
var tabContainer;
var searchStrs = {};

tabManagerBgInit();

function tabManagerBgInit(){
    console.log("init tab manager bg");

    getLatestTabList((tabList)=>{
        tabContainer = new TabContainer(tabList);
    });
}

function getLatestTabList(callback)
{
    console.log("refreshing");
    chrome.tabs.query({},apiTabs=>{
        apiTabs.forEach(apiTab => {
            apiTab = makeTabFromApiTab(apiTab,searchStrs[apiTab.windowId]);
        });

        if(typeof(callback)=="function") callback(apiTabs);
    });
}

function changeTabSelect(windowId,tabId,select)
{
    if(select)tabContainer.get(windowId,tabId).managerSelect = select;
    else tabContainer.get(windowId,tabId).managerSelect  = !tabContainer.get(windowId,tabId).managerSelect;
}

function selectAllInWindow(windowId)
{
    tabContainer.getWindow(windowId).forEach(tab=>{
        tab.managerSelect = true;
    });
}

function cancelSelectInWindow(windowId)
{
    tabContainer.getWindow(windowId).forEach(tab=>{
        tab.managerSelect = false;
    })
}

function isMatchSearch(tab,searchStr)
{
    if(searchStr == "")return true;
    let reg = RegExp(searchStr,"i");
    let b = reg.test(tab.title);
    return b;
}

function searchWithSearchStrInWindow(windowId)
{
    tabContainer.getWindow(windowId).forEach(tab => {
        tab.matchSearch = isMatchSearch(tab,searchStrs[windowId]);
    });
}

function onRemove(tabId,removeInfo)
{
    if(tabContainer.isWindowExist(removeInfo.windowId))
    {
        if(removeInfo.isWindowClosing){tabContainer.removeWindow(removeInfo.windowId);return;}
        tabContainer.remove(removeInfo.windowId,tabId);
        sendMessageToWindowActive(removeInfo.windowId,"onTabRemove",{'tabId':tabId});
    }
}

function onUpdated(tabId,changeInfo,apiTab)
{
    if(changeInfo.status == "complete")
    {
        if(tabContainer.isTabExist(tabId))
        {
            apiTab.managerSelect = tabContainer.get(tab.windowId,tabId).managerSelect;
            apiTab.matchSearch = tabContainer.get(tab.windowId,tabId).matchSearch;
        }
        else apiTab = makeTabFromApiTab(apiTab,searchStrs[apiTab.windowId]);

        tabContainer.set(apiTab.windowId,tabId,apiTab);
        sendMessageToWindowActive(apiTab.windowId,"onTabChange",{'tab':apiTab});
    }
}

function onDetached(tabId,detachInfo)
{
    tabContainer.remove(detachInfo.oldWindowId,tabId);
    sendMessageToWindowActive(detachInfo.oldWindowId,"onTabRemove",{'tabId':tabId});
}

function onAttached(tabId,attachInfo)
{
    chrome.tabs.get(tabId,apiTab=>{
        let window = tabContainer.getWindow(attachInfo.windowId);
        window.forEach(tab => {
            if(tab.index>= apiTab.index)tab.index++;
        });
        
        tabContainer.set(attachInfo.newWindowId,tabId,makeTabFromApiTab(apiTab));
        //sendMessageToWindowActive(attachInfo.newWindowId,"onTabAdd",{'tab':apiTtab});
        sendMessageToWindowActive(attachInfo.newWindowId,"updateManager");
    });
}

function onActivated(activeInfo)
{
    chrome.tabs.sendMessage(activeInfo.tabId,{command:"updateManager"});
}

function onMoved(tabId, moveInfo)
{
    let window = tabContainer.getWindow(moveInfo.windowId);
    if(moveInfo.fromIndex > moveInfo.toIndex)
    {
        window.forEach(tab => {
            if(tab.index>=moveInfo.toIndex && tab.index < moveInfo.fromIndex)
            {
                tab.index++;
            }
        });
    }
    else
    {
        window.forEach(tab => {
            if(tab.index>moveInfo.fromIndex && tab.index <= moveInfo.toIndex)
            {
                tab.index--;
            }
        });
    }
    let tab = tabContainer.get(moveInfo.windowId,tabId);
    tab.index = moveInfo.toIndex;
    tabContainer.set(moveInfo.windowId,tabId,tab);

    sendMessageToWindowActive(moveInfo.windowId,"updateManager");
}

function onCreated(apiTab)
{
    let window = tabContainer.getWindow(apiTab.windowId);
    window.forEach(tab => {
        if(tab.index>= apiTab.index)tab.index++;
    });
    
    apiTab.title = "Loading..."

    tabContainer.set(apiTab.windowId,apiTab.id,makeTabFromApiTab(apiTab,searchStrs[apiTab.windowId]));
    //sendMessageToWindowActive(attachInfo.newWindowId,"onTabAdd",{'tab':apiTtab});
    sendMessageToWindowActive(apiTab.windowId,"updateManager");

}

//監聽內容腳本操作任務要求
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.command)
        {
            switch(request.command)
            {
                case "RefreshManager":
                {
                    tabManagerBgInit();
                    sendMessageToActive("updateManager");
                }

                //切換分頁
                case "ChangeCurentTab":
                {
                    chrome.tabs.update(Number(request.tabId), {active: true});　//切換分頁
                    //chrome.tabs.highlight({'tabs':request.tabId});
                    break;
                }
                
                //取得分頁列表
                case "getManagerInfo":
                {
                    sendResponse({'list':tabContainer.getWindow(sender.tab.windowId),'searchStr':(typeof(searchStrs[sender.tab.windowId])!="undefined")?searchStrs[sender.tab.windowId]:searchStrs[sender.tab.windowId]=""});
                    return true; //for asyc response,without cause sendresponse not work
                    break;
                }

                //關閉分頁
                case "closeTabs":
                {
                    chrome.tabs.remove(request.tabIds);
                    break;
                }

                case "changeTabSelect":
                {
                    changeTabSelect(sender.tab.windowId,request.tabId);
                    break;
                }

                case "selectAll":
                {
                    selectAllInWindow(sender.tab.windowId);
                    break;
                }
                
                case "cancelSelect":
                {
                    cancelSelectInWindow(sender.tab.windowId);
                    break;
                }

                case "changeSearchStr":
                {
                    searchStrs[sender.tab.windowId] = request.str;
                    searchWithSearchStrInWindow(sender.tab.windowId);

                    sendResponse()
                    return true; //for asyc response,without cause sendresponse not work
                    break;
                }
            }
        }
    }
);

//監聽鍵盤熱屆
chrome.commands.onCommand.addListener(command=>{
    switch(command){
        case "key_openTabManager":
        {
            chrome.tabs.query({currentWindow:true,active:true},(apiTabs)=>{
                chrome.tabs.sendMessage(apiTabs[0].id,{command:"key_openTabManager"})　//控制內容腳本開關分頁
            })
        }
    }
});

chrome.tabs.onRemoved.addListener(onRemove);
chrome.tabs.onUpdated.addListener(onUpdated); 
chrome.tabs.onDetached.addListener(onDetached);
chrome.tabs.onActivated.addListener(onActivated);
chrome.tabs.onAttached.addListener(onAttached);
chrome.tabs.onMoved.addListener(onMoved);
chrome.tabs.onCreated.addListener(onCreated);
//chrome.tabs.onHighlighted.addListener(updataAllManager);

Array.prototype.remove = function(from, to) {
    let rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };

