class UuidDatabase {
    constructor(contentProvider) {
        this.contentProvider = contentProvider;
        this.info = {};
    }

    preloadUuids(uuids) {
        console.log("Preloading uuids:", uuids);

        this.contentProvider.getShapesetDefinitions(uuids.filter(uuid => this.info[uuid] === undefined));
    }
}

module.exports = UuidDatabase;