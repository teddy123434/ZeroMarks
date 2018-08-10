function Configs(aDefualt,aConfigs){
    
    this.defualt = aDefualt;
    this.configs = aConfigs;

    this.get = (key)=>{
        return (configs[key]!=undefined)?configs[key]:this.default[key];
    }

    this.load = ()=>{

    }

    this.reset = ()=>{
        
    }

    this.set = (key,val)=>{
        if(key!=undefined && val != undefined)
        {
            configs[key] = val;
            log.dbg("change config " + key + " to " + val);
            save();
        }
    }

    this.save = ()=>{

    }
}

