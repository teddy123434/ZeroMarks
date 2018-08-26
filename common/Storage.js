var storage;


storage.clearLocalStorage = function() {
    log.dbg("clear local storage");
    localStorage.clear();
}

storage.set = (key,val)=>{
    log.dbg("storage set "+ key + " as "+ val);
    localStorage.setItem(key,val);
}

storage.get() = (key)=>{
    return localStorage.getItem(key);
}

storage.remove = ()=>{
    localStorage.clear();
}