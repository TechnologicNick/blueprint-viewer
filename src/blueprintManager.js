const fs = require("fs");
const path = require("path");
const Blueprint = require("./renderer/blueprint");
// import Blueprint from "./renderer/blueprint.js";

module.exports.fromDirectory = (pathDir) => {
    const blueprint = JSON.parse(fs.readFileSync(path.join(pathDir, "blueprint.json")));
    const description = JSON.parse(fs.readFileSync(path.join(pathDir, "description.json")));

    const bp = new Blueprint(blueprint, description);
    bp.uri.preview = path.join(pathDir, "preview.png")
    bp.uri.blueprint = path.join(pathDir, "blueprint.json")
    bp.uri.description = path.join(pathDir, "description.json")

    // console.log(bp, bp.getUuids());
    return bp;
}
