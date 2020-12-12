export class Viewer {
    constructor(contentProvider) {
        this.contentProvider = contentProvider;
    }

    loadBlueprintFromFile(pathDir) {
        this.bp = this.contentProvider.loadBlueprintFromFile(pathDir);
        console.log("loaded", this.bp);

        return this.bp;
    }

    loadBlueprint(bp) {
        this.bp = bp;

        return this.bp;
    }

    view() {
        console.log("view", this.bp);
        // this.bp.getPartUuids();
    }
}