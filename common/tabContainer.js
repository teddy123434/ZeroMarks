function makeTabWithApiTab(apiTab)
{
    apiTab.managerSelect = -1;
    apiTab.matchSearch = true;
}

function TabContainer(tabList)
{
    this.container = {};
    
    this.refresh = function(tabList)
    {
        tabList.forEach(tab => {
            if(!this.container[tab.windowId])this.container[tab.windowId] = {};
            this.container[tab.windowId][tab.id] = tab;
        });
    };

    this.get = (windowId,tabId)=>{return this.container[windowId][tabId];};

    this.getWindow = (windowId)=>
    {
        return convertValueMapToArray(this.container[windowId]);
    };

    this.set = (windowId,tabId,tab)=>
    {
        if(!this.container[windowId])this.container[windowId] = {};
        this.container[windowId][tabId] = tab;
    };

    this.remove = (windowId,tabId)=>
    {
        if(tabId)//no windowId ,only tabId defined
        {
            delete this.container[windowId][tabId];
        }
        else
        {
            for(const [key,window] of Object.entries(this.container)){
                for(const [key2,tab] of Object.entries(window)){
                    if(tab.id=tabId){
                        delete tab;
                        return;
                    }
                }
            }
        }
    };

    this.removeWindow = (windowId)=>
    {
        delete this.container[windowId];
    };


    this.isWindowExist = (windowId)=>
    {
        return Boolean(this.container[windowId]);
    };

    this.isTabExist = (windowId,tabId)=>
    {
        if(tabId)
        {
            return Boolean(this.container[windowId][tabId]);
        }
        else
        {
            let b = false;
            for(const [key,window] of Object.entries(this.container)){
                for(const [key2,tab] of Object.entries(window)){
                    b = b || (tab.id = windowId);
                    if(b)return;
                }
                if(b)return;
            }
        }
    };

    this.refresh(tabList);
}