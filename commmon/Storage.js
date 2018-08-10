function Storage() {

    this.clearLocalStorage = function() {
        chrome.storage.storageArea.clear();
    }

    this.load();
}