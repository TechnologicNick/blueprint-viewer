const fs = require("fs");

class Renderable {
    lods;

    constructor(renderableJson, contentProvider) {
        this.renderableJson = renderableJson;
        this.contentProvider = contentProvider;
    }

    static fromFile(file, contentProvider) {
        return new this(JSON.parse(fs.readFileSync(file)), contentProvider);
    }

    sortLods() {
        return this.lods = this.renderableJson.lodList.sort((a, b) => { return a.minViewSize - b.minViewSize });
    }

    getReferencedFiles() {
        let files = new Set();

        for (let lod of this.lods ?? this.sortLods()) { // Sort if not already sorted
            files.add(lod.mesh); // lodList.mesh

            if (lod.subMeshMap) for (let mapItem of Object.values(lod.subMeshMap)) {
                for (let texture of mapItem.textureList) {
                    files.add(texture); // lodList.subMeshMap.textureList
                }
            }

            if (lod.subMeshList) for (let listItem of lod.subMeshList) {
                for (let texture of listItem.textureList) {
                    files.add(texture); // lodList.subMeshList.textureList
                }
            }
        }

        files.delete("");

        return Array.from(files);
    }
}

module.exports = Renderable;