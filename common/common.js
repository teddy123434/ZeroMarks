function findFirstIndex(array,obj,geter = (x)=>{return x;})
{
    for(let i = 0;i<array.length;i++)
    {
        if(geter(array[i])==obj) return i;
    }
    return -1;
}

function sendMessageToAllTab(msg)
{
    chrome.tabs.query({},(tabs)=>{
        tabs.forEach(tab => {
            if(msg)
            {
                msg['command'] = command;
                chrome.tabs.sendMessage(tab.id,msg);
            }
            else
            {
                chrome.tabs.sendMessage(tab.id,{'command':command});
            }
        });
    })
}

function sendMessageToCurrent(msg)
{
    chrome.tab.query({currentWindow:true,active:true},(tabs)=>{
        tabs.forEach(tab => {
            if(msg)
            {
                msg['command'] = command;
                chrome.tabs.sendMessage(tab.id,msg);
            }
            else
            {
                chrome.tabs.sendMessage(tab.id,{'command':command});
            }
        });
    });
}

function sendMessageToActive(command,msg)
{
    chrome.tabs.query({active:true},(tabs)=>{
        tabs.forEach(tab => {
            if(msg)
            {
                msg['command'] = command;
                chrome.tabs.sendMessage(tab.id,msg);
            }
            else
            {
                chrome.tabs.sendMessage(tab.id,{'command':command});
            }
        });
    });
}

function sendMessageToTab(tabId,command,msg)
{
    if(msg)
    {
        msg['command'] = command;
        chrome.tabs.sendMessage(tabId,msg);
    }
    else
    {
        chrome.tabs.sendMessage(tabId,{'command':command});
    }
}

function sendMessageToWindowActive(windowId,command,msg)
{
    chrome.tabs.query({'windowId':windowId,'active':true},(tabs)=>{
        tabs.forEach(tab => {
            if(msg)
            {
                msg['command'] = command;
                chrome.tabs.sendMessage(tab.id,msg);
            }
            else
            {
                chrome.tabs.sendMessage(tab.id,{command});
            }
        });
        
    });
}

function convertValueMapToArray(map)
{
    return Object.values(map);
}