const fs = require("fs");
const path = require("path");
const THREE = require("three");

eval(fs.readFileSync("./node_modules/three/examples/js/loaders/TGALoader.js").toString()); // Hack that adds THREE.TGALoader

class TextureLoader {
    static loaders = {
        default: new THREE.TextureLoader(TextureLoader.manager),
        ".tga": new THREE.TGALoader(TextureLoader.manager)
    }

    static manager = new THREE.LoadingManager(() => {
        console.log("[TextureLoader] Done loading");
    }, (url, loaded, total) => {
        console.log("[TextureLoader] onProgress:", url, loaded, total);
    }, (url) => {
        console.error("[TextureLoader] An error occured while loading", url);
    })

    static load(url) {
        return new Promise((resolve, reject) => {
            let ext = path.extname(url).toLowerCase();
            let loader = this.loaders[ext] || this.loaders.default;

            loader.load(url, (texture) => {
                console.log("[TextureLoader] Loaded", url, texture);
                // let ctx = texture.image.getContext("2d");
                // console.log(ctx.getImageData(0, 0, 100, 100));

                let toReturn = texture;

                if (ext === ".tga") {
                    // let ctx = texture.image.getContext("2d");
                    // console.log(ctx.getImageData(0, 0, texture.image.width, texture.image.height));
                    // console.log(toReturn);
                } else {
                    console.log(texture.image);
                }

                resolve(toReturn);
            });
        });
    }
}

module.exports = TextureLoader;