const fs = require("fs");
const path = require("path");
const THREE = require("three");

// Load a library required by FBXLoader.js
const fflate = require("three/examples/js/libs/fflate.min.js");

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
        console.log("[MeshLoader] Done loading");
    }, (url, loaded, total) => {
        console.log("[MeshLoader] onProgress:", url, loaded, total);
    }, (url) => {
        console.error("[MeshLoader] An error occured while loading", url);
    })

    static load(url) {
        return new Promise((resolve, reject) => {
            let ext = path.extname(url).toLowerCase();
            let loader = this.loaders[ext];

            if (loader === undefined) reject(`No mesh loader for ${ext} model`);

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