const fs = require("fs");
const path = require("path");
const stripJsonComments = require("strip-json-comments");
const WorkshopMod = require("./workshopMod");
const PathHelper = require("./pathHelper.js");

class WorkshopModManager {
    static mods = {};
    
    static getModsDirectories() {
        return [
            PathHelper.USER_MODS_DIR,
            PathHelper.WORKSHOP_DIR
        ]
    }

    static reloadMods() {
        this.mods = {};

        let modsVanilla = [
            new WorkshopMod(PathHelper.GAME_DATA, {
                description: "All blocks, parts and joints from vanilla creative mode",
                localId: "creative",
                name: "Vanilla - Creative mode",
                type: "Blocks and Parts",
                version: 0
            }, true),
            new WorkshopMod(PathHelper.SURVIVAL_DATA, {
                description: "All blocks, parts and joints from vanilla survival mode",
                localId: "survival",
                name: "Vanilla - Survival mode",
                type: "Blocks and Parts",
                version: 0
            }, true),
            new WorkshopMod(PathHelper.CHALLENGE_DATA, {
                description: "All blocks, parts and joints from vanilla challenge mode",
                localId: "challenge",
                name: "Vanilla - Challenge mode",
                type: "Blocks and Parts",
                version: 0
            }, true)
        ];
        for(let mod of modsVanilla) {
            try {
                mod.parseShapesets();
            } catch(ex) {
                console.warn(`Failed parsing shapesets of mod {name: ${mod.description.name}, localId: ${mod.description.localId}, dir: ${mod.dir}}`, ex);
                continue;
            }
            console.log(`Loaded mod {name: ${mod.description.name}, localId: ${mod.description.localId}}`);
            this.mods[mod.description.localId] = mod;
        }

        for (let modsDir of this.getModsDirectories()) {
            if (!fs.existsSync(modsDir)) {
                console.warn(`Mod directory "${modsDir}" does not exist!`);
                continue;
            }

            for (let dir of fs.readdirSync(modsDir).filter(f => fs.statSync(path.join(modsDir, f)).isDirectory())) {
                let pathDesc = path.join(modsDir, dir, "description.json");
                
                if (!fs.existsSync(pathDesc)) continue;
                
                try {
                    let desc = JSON.parse(stripJsonComments(fs.readFileSync(pathDesc).toString()));
                    if (desc.type !== "Blocks and Parts") continue;

                    let mod = new WorkshopMod(path.join(modsDir, dir), desc);
                    try {
                        mod.parseShapesets();
                    } catch(ex) {
                        console.warn(`Failed parsing shapesets of mod {name: ${mod.description.name}, localId: ${mod.description.localId}, dir: ${mod.dir}}`, ex);
                        continue;
                    }

                    this.mods[mod.description.localId] ??= mod; // Don't overwrite if it already exists in the mod list to preserve priorities
                    console.log(`Loaded mod {name: ${mod.description.name}, localId: ${mod.description.localId}}`);
                } catch(ex) {
                    console.warn(`Failed loading mod in "${dir}"`, ex);
                }
            }
        }

        let modCount = Object.keys(this.mods).length;
        let shapeCount = 0;
        for (let mod of Object.values(this.mods)) shapeCount += Object.keys(mod.shapes).length;
        console.log(`Loaded ${modCount} mods with ${shapeCount} shapes`);
        return {modCount: modCount, shapeCount: shapeCount};
    }

    static getModsWithShapeUuid(uuid) {
        return Object.values(this.mods).filter((mod) => mod.shapes[uuid]);
    }

    static expandPathPlaceholders(p) {
        let matches = Array.from(p.matchAll(/\$CONTENT_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g));

        for (let m of matches) {
            let modLocalId = m[1];
            let mod = this.mods[modLocalId];

            if (mod !== undefined) p = p.replace(m[0], mod.dir);
        }

        return PathHelper.expandPathPlaceholders(p);
    }
}

module.exports = WorkshopModManager;