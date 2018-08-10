var configs;

configs.default = null;
configs.configs = null;

configs.get = (key) => {
    return (configs[key] != undefined) ? configs[key] : this.default[key];
}

configs.set = (key, val) => {
    if (key != undefined && val != undefined) {
        configs[key] = val;
        log.dbg("change config " + key + " to " + val);
        save();
    }
}

configs.load = () => {

}

this.save = () => {

}

configs.reset = () => {

}