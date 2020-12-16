const { timeStamp } = require("console");
const fs = require("fs");
const path = require("path");
const stripJsonComments = require("strip-json-comments");

class WorkshopMod {
    constructor(dir, description, isFake = false) {
        this.dir = dir;
        this.description = description || JSON.parse(stripJsonComments(fs.readFileSync(path.join(this.dir, "description.json")).toString()));
        this.isFake = isFake;
        this.shapes = {};

        if (this.description.type !== "Blocks and Parts") throw new Error(`This is not a mod! type = ${this.description.type}`);
    }

    parseShapesets(shapesetsDir) {
        shapesetsDir ??= path.join(this.dir, "Objects", "Database", "ShapeSets");

        if (!fs.existsSync(shapesetsDir)) throw new Error(`ShapeSets directory doesn't exist! (${shapesetsDir})`);

        for (let shapesetFile of fs.readdirSync(shapesetsDir)) {
            let currentFile = path.join(shapesetsDir, shapesetFile);
            if (fs.statSync(currentFile).isDirectory()) { // Include recursive directories
                this.parseShapesets(currentFile);
                continue;
            } else if(path.extname(currentFile) !== ".json") continue; // Only try to parse json files

            let shapesetJson;
            try {
                shapesetJson = JSON.parse(stripJsonComments(fs.readFileSync(currentFile).toString()));
            } catch(ex) {
                console.error(`Failed parsing shapesets file "${currentFile}"`);
                throw ex;
            }

            if (shapesetJson.blockList) {
                for (let shape of shapesetJson.blockList) {
                    this.shapes[shape.uuid] = {
                        type: "block",
                        uuid: shape.uuid,
                        definition: shape
                    }
                }
            }

            if (shapesetJson.partList) {
                for (let shape of shapesetJson.partList) {
                    this.shapes[shape.uuid] = {
                        type: "part",
                        uuid: shape.uuid,
                        definition: shape
                    }
                }
            }
        }
    }
}

module.exports = WorkshopMod;