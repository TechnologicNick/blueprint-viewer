class Viewer {
    constructor(contentProvider, uuidDatabase) {
        this.contentProvider = contentProvider;
        this.uuidDatabase = uuidDatabase;
    }

    loadBlueprintFromFile(pathDir) {
        this.bp = this.contentProvider.loadBlueprintFromFile(pathDir);
        // console.log("loaded", this.bp);

        return this.bp;
    }

    loadBlueprint(bp) {
        this.bp = bp;

        return this.bp;
    }

    view() {
        let uuids = this.bp.getUuids();
        console.log(`Blueprint contains ${uuids.length} unique uuids`, uuids);
        
        this.uuidDatabase.preloadUuids(uuids);
        console.log(this.uuidDatabase.definitions);

        console.log("view() done");
    }
}

// export default Viewer;
module.exports = Viewer;