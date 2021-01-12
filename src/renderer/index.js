// import * as BlueprintManager from "../blueprint_manager.js";
const { ipcRenderer } = require("electron");
const Blueprint = require("./blueprint.js");
const UuidDatabase = require("./uuidDatabase.js");
const Viewer = require("./viewer.js");

const TEST_BLUEPRINT_DIRECTORY = "C:\\Users\\Nick\\AppData\\Roaming\\Axolot Games\\Scrap Mechanic\\User\\User_76561198142527219\\Blueprints\\cb800d18-796d-4381-a49a-84e47760177e";

// console.log(ipcRenderer.sendSync("loadBlueprintFromFile", TEST_BLUEPRINT_DIRECTORY));

let contentProvider = {
    loadBlueprintFromFile: (pathDir) => {
        let bp = ipcRenderer.sendSync("loadBlueprintFromFile", pathDir);
        return Object.assign(new Blueprint(), bp);
    },

    getShapesetDefinitions: (uuids) => {
        let r = ipcRenderer.sendSync("getShapesetDefinitions", uuids);
        return r;
    },

    expandPathPlaceholders: (p, shapeUuid) => {
        let r = ipcRenderer.sendSync("expandPathPlaceholders", p, shapeUuid);
        return r;
    }
}

let { modCount, shapeCount } = ipcRenderer.sendSync("reloadMods");
console.log(`Loaded ${modCount} mods with ${shapeCount} shapes`);

let db = new UuidDatabase(contentProvider);
let vwr = new Viewer(contentProvider, db);
vwr.init(document.querySelector(".blueprint-viewer"));

vwr.loadBlueprintFromFile(TEST_BLUEPRINT_DIRECTORY);
vwr.view().then(updateLoop);

function updateLoop() {
    requestAnimationFrame( updateLoop );
    
    vwr.update();
}

// updateLoop();
