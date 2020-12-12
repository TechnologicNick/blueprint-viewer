// import * as BlueprintManager from "../blueprint_manager.js";
const { ipcRenderer } = require('electron');
import Blueprint from './blueprint.js';
import { Viewer } from './viewer.js';

const TEST_BLUEPRINT_DIRECTORY = "C:\\Users\\Nick\\AppData\\Roaming\\Axolot Games\\Scrap Mechanic\\User\\User_76561198142527219\\Blueprints\\cb800d18-796d-4381-a49a-84e47760177e";

// console.log(ipcRenderer.sendSync("loadBlueprintFromFile", TEST_BLUEPRINT_DIRECTORY));

let vwr = new Viewer({
    loadBlueprintFromFile: (pathDir) => {
        let bp = ipcRenderer.sendSync("loadBlueprintFromFile", pathDir);
        return Object.assign(new Blueprint(), bp);
    }
});

vwr.loadBlueprintFromFile(TEST_BLUEPRINT_DIRECTORY);
vwr.view();
