/*Storage is an obj to access Api.storageArea*/
/*last updata version 0.0.2*/
/*last writer:louis*/


function Storage() {

    this.clearLocalStorage = function()
    {
        chrome.storage.storageArea.clear();
    }

    this.load();
}