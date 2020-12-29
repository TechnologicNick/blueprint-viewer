const fs = require("fs");
const path = require("path");
const THREE = require("three");

// Hack to load a library required by FBXLoader.js
let Zlib = {};
eval(fs.readFileSync("./node_modules/three/examples/js/libs/inflate.min.js").toString());
var Inflate = this.Zlib.Inflate;

eval(fs.readFileSync("./node_modules/three/examples/js/loaders/OBJLoader.js").toString()); // Hack that adds THREE.OBJLoader
eval(fs.readFileSync("./node_modules/three/examples/js/loaders/FBXLoader.js").toString()); // Hack that adds THREE.FBXLoader
eval(fs.readFileSync("./node_modules/three/examples/js/loaders/ColladaLoader.js").toString()); // Hack that adds THREE.ColladaLoader

class MeshLoader {
    static loaders = {
        ".obj": new THREE.OBJLoader(MeshLoader.manager),
        ".fbx": new THREE.FBXLoader(MeshLoader.manager),
        ".dae": new THREE.ColladaLoader(MeshLoader.manager)
    }

    static manager = new THREE.LoadingManager(() => {
        console.log("Done loading");
    }, (url, loaded, total) => {
        console.log("onProgress:", url, loaded, total);
    }, (url) => {
        console.error("An error occured while loading", url);
    })

    static load(url) {
        return new Promise((resolve, reject) => {
            let ext = path.extname(url);
            let loader = this.loaders[ext];

            loader.load(url, (obj) => {
                console.log("[MeshLoader] Loaded", obj);

                let toReturn = obj;

                if (ext === ".dae") {
                    toReturn = obj.scene;
                    toReturn.scale.set(1, 1, 1);
                }

                resolve(toReturn);
            });
        });
    }
}

// MeshLoader.manager.addHandler(/\.obj$/, new THREE.OBJLoader(MeshLoader.manager));
// MeshLoader.manager.addHandler(/\.fbx$/, new THREE.FBXLoader(MeshLoader.manager));
// MeshLoader.manager.addHandler(/\.dae$/, new THREE.ColladaLoader(MeshLoader.manager));

module.exports = MeshLoader;