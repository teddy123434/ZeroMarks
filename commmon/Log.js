var dbg = true;

function Log(alogpipe = console.log)
{
    this.logpipe = alogpipe;
    this.dbg = (msg){
        if(dbg){
            logpipe(msg);
        }
    }
}