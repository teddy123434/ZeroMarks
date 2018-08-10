function messageHandler(msg, sender, response) {
    if (msg.command != undefined) {
        switch (msg.command) {
            case 'GetAllTabList':
                {
                    chrome.tabs.query({}, (tabs) => {
                        response(tabs);
                    });
                }
        }
    }
    return true;
}