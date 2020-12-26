const Renderable = require("./renderable.js");

class UuidDatabase {
    constructor(contentProvider) {
        this.contentProvider = contentProvider;
        this.definitions = {};
        this.renderables = {};
    }

    preloadUuids(uuids) {
        console.log("Preloading uuids:", uuids);

        let defs = this.contentProvider.getShapesetDefinitions(uuids.filter(uuid => this.definitions[uuid] === undefined));
        for (let [key, value] of Object.entries(defs)) {
            this.definitions[key] = value;
        }
    }

    preloadRenderables(uuids) {
        console.log("Preloading renderables:", uuids);
        let files = [];

        for (let uuid of uuids.filter(uuid => this.renderables[uuid] === undefined).filter(uuid => this.definitions[uuid].type !== "block")) {
            let rendJson = this.definitions[uuid].definition.renderable;
            let rend;

            if (typeof(rendJson) === "string") {
                rend = Renderable.fromFile(this.contentProvider.expandPathPlaceholders(rendJson, uuid), this.contentProvider);
            } else {
                rend = new Renderable(rendJson, this.contentProvider);
            }

            files = files.concat(rend.getReferencedFiles().map(f => this.contentProvider.expandPathPlaceholders(f, uuid)));

            this.renderables[uuid] = rend;
        }

        console.log("Files:", files);
    }
}

module.exports = UuidDatabase;