const fs = require("fs");

class Renderable {
    constructor(renderableJson) {
        this.renderableJson = renderableJson;
    }

    static fromFile(file) {
        return new this(JSON.parse(fs.readFileSync(file)));
    }

    getReferencedFiles() {
        let files = new Set();

        for (let lod of this.renderableJson.lodList) {
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