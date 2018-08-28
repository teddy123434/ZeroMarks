//找路用代碼
console.log("X");

var sidebar;
var slideSpeed = 250; //設定開關時滑動時間

var SIDEBAR_CLASS_NAME = "zeromark_sidebar"

init();

function init(){
    //插入管理器根元素
    let div = document.createElement("div");
    div.classList.add(SIDEBAR_CLASS_NAME);  //設定class屬性
    div.style.background = "#cccccc"; 
    div.style.height = "100%";
    div.style.width = "20rem";
    div.style.position = "fixed";
    div.style.top = "0px";
    div.style.right = "0px";
    div.style.zIndex = "90000000";
    div.style.display = "none";
    div.style.borderStyle="none"
    div.frameBorder = "none";
    div.target="_parent";
    document.body.appendChild(div);

    sidebar.jq =  $('div.'+SIDEBAR_CLASS_NAME); 

    sidebar.append = content =>{
        let jqcontent = $(content);
        sidebar.jq.append(jqcontent);
        return content;
    }
    
    sidebar.onDisplayChange = new Listener();

    //鎖定右鍵
    sidebar.jq.bind('contextmenu',function(e){
        return false;    
    });
}

//顯示管理器視窗
function showSidebar(){
    sidebar.jq.show("slide",{direction:"right"},slideSpeed);
    sidebar.jq.focus();
    sidebar.onDisplayChange.fire(this,{'type':'show'});
}

//關閉管理器視窗
function hideSidebar(){
    sidebar.jq.hide("slide",{direction:"right"},slideSpeed);
    sidebar.onDisplayChange.fire(this,{'type':'hide'});
}

//開關管理器視窗
function changeSidebarDisplay(open){
    if(open==null) (sidebar.jq.css("display")=="none")?showSidebar():hideSidebar();
    else if(open) showSidebar();
    else hideSidebar();
};

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse)
    {
        switch(request.command)
        {
            case "key_openSidebar": //監聽開關管理器熱鍵按下事件
            {
                changeSidebarDisplay(null);
                break;
            }

            default:
            break;
        }
    }
)