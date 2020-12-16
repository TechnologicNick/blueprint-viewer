class UuidDatabase {
    constructor(contentProvider) {
        this.contentProvider = contentProvider;
        this.definitions = {};
    }

    preloadUuids(uuids) {
        console.log("Preloading uuids:", uuids);

        let defs = this.contentProvider.getShapesetDefinitions(uuids.filter(uuid => this.definitions[uuid] === undefined));
        for (let [key, value] of Object.entries(defs)) {
            this.definitions[key] = value;
        }
    }
}

module.exports = UuidDatabase;