var dbg = true;

var log;

log.logpipe = console.log;

log.dbg = (msg) => {
    if (dbg) {
        logpipe(msg);
    }
}