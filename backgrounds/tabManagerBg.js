/*
    tabManagerBg.js
    分頁管理器處理用後台腳本
    編輯者： louis
    最後編輯時間：2018/6/9 10:00
*/
 
var tabList = [];
var searchStr ="";

function findFirstIndex(array,obj,geter = (x)=>{return x;})
{
    for(var i = 0;i<array.length;i++)
    {
        if(geter(array[i])==obj) return i;
    }
    return -1;
}

function sendMessageToAllTab(msg)
{
    chrome.tabs.query({},(tabs)=>{
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id,msg);
        });
    })
}

window.onload=()=>{
    refreshTabList();
}

//取得瀏覽器當前分頁列表
function refreshTabList(callback)
{
    console.log("refreshing");
    chrome.tabs.query({},tabs=>{
        tabs.forEach(tab => {
            let i = findFirstIndex(tabList,tab.id,x=>x.id);
            tab.managerSelect = (i==-1)?false:tabList[i].managerSelect;
        });

        tabList = tabs;

        if(typeof(callback)=="function")callback();
    });
}

function updataAllManager()
{
    sendMessageToAllTab({command:"updateManager"});
}

function changeTabSelect(tabId,select)
{
    tabList.forEach(tab => {
        if(tab.id==tabId)
        {
            tab.managerSelect=(select==null?(!tab.managerSelect):select);
            updataAllManager();
        }
    });
}

function selectAll()
{
    tabList.forEach(tab=>{
        tab.managerSelect = true;
    })

    updataAllManager();
}

function cancelSelect()
{
    tabList.forEach(tab=>{
        tab.managerSelect = false;
    })
    updataAllManager();
}

function isMatchSearch(tab)
{
    if(searchStr == "")return true;
    var reg = RegExp(searchStr,"i");
    var b = reg.test(tab.title);
    return b;
}

function searchWithSearchStr()
{
    for(var i = 0;i<tabList.length;i++)
    {
         if(!isMatchSearch(tabList[i])){
            tabList.remove(i--);
            //  tabList.splice(0,1);
        }
    }
}
/*
function onCreate(tab)
{
    if(isMatchSearch(tab))
    {
        tabList.push(tab);
        //sendMessageToAllTab({command:"onCreateEvent",tab:tab});
        updataAllManager();
    }
}
*/
function onRemove(tabId)
{
    var i = findFirstIndex(tabList,tabId,(x)=>{return x.id;});
    if(i!=-1)
    {
        tabList.remove(i);
        //tabList.splice(0,1);
        //sendMessageToAllTab({command:"onRemoveTab",tabId:tabId});
        updataAllManager();
    }
}

function onUpdated(tabId,changeInfo)
{
    if(changeInfo.status == "complete")
    {
        refreshTabList();
        updataAllManager()
    }
}

//監聽內容腳本操作任務要求
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if(request.command)
        {
            switch(request.command)
            {
                //切換分頁
                case "ChangeCurentTab":
                {
                    chrome.tabs.update(Number(request.tabId), {highlighted: true});　//切換分頁
                    //chrome.tabs.highlight({'tabs':request.tabId});
                    break;
                }
                
                //取得分頁列表
                case "getManagerInfo":
                {
                    sendResponse({list:tabList,searchStr:searchStr})
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
                    changeTabSelect(request.tabId,request.select);
                    break;
                }

                case "selectAll":
                {
                    selectAll();
                    break;
                }
                
                case "cancelSelect":
                {
                    cancelSelect();
                    break;
                }

                case "changeSearchStr":
                {
                    searchStr = request.str;
                    refreshTabList(()=>{
                        searchWithSearchStr();
                        updataAllManager();
                    });
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
            chrome.tabs.query({currentWindow:true,active:true},(tabs)=>{
                chrome.tabs.sendMessage(tabs[0].id,{command:"key_openTabManager"})　//控制內容腳本開關分頁
            })
        }
    }
});

chrome.tabs.onRemoved.addListener(onRemove);
//chrome.tabs.onCreated.addListener(refreshTabList);
chrome.tabs.onUpdated.addListener(onUpdated);
//chrome.tabs.onMoved.addListener(updataAllManager);
//chrome.tabs.onHighlighted.addListener(updataAllManager);
//chrome.tabs.onDetached.addListener(updataAllManager);
//chrome.tabs.onAttached.addListener(updataAllManager);
chrome.tabs.onActivated.addListener(updataAllManager);

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };

