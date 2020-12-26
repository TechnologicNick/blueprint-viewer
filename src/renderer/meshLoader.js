const fs = require("fs");
const path = require("path");
const { Mesh } = require("three");
const THREE = require("three");

// Hack to load a library required by FBXLoader.js
let Zlib = {};
eval(fs.readFileSync("./node_modules/three/examples/js/libs/inflate.min.js").toString());
var Inflate = this.Zlib.Inflate;

eval(fs.readFileSync("./node_modules/three/examples/js/loaders/OBJLoader.js").toString()); // Hack that adds THREE.OBJLoader
eval(fs.readFileSync("./node_modules/three/examples/js/loaders/FBXLoader.js").toString()); // Hack that adds THREE.FBXLoader

class MeshLoader {
    static manager = new THREE.LoadingManager(() => {
        console.log("Done loading");
    }, (url, loaded, total) => {
        console.log("onProgress:", url, loaded, total);
    }, (url) => {
        console.error("An error occured while loading", url);
    })

    static load(url) {
        return new Promise((resolve, reject) => {
            let loader = this.manager.getHandler(url);
            console.log("loader", url, loader);

            loader.load(url, (obj) => {
                console.log("aaaaaaaaaaaaaaaaaaaaaaaaa", obj);
                resolve(obj);
            });
        });
    }
}

MeshLoader.manager.addHandler(/\.obj$/, new THREE.OBJLoader(MeshLoader.manager));
MeshLoader.manager.addHandler(/\.fbx$/, new THREE.FBXLoader(MeshLoader.manager));

module.exports = MeshLoader;