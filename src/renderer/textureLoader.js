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

    static load(url, uuidDatabase) {
        // Check if file has been loaded previously
        if (uuidDatabase && uuidDatabase.loadedFiles[url]) {
            let cached = uuidDatabase.loadedFiles[url];
            
            let texture = this.cloneTexture(cached);

            return Promise.resolve(texture);
        }

        return new Promise((resolve, reject) => {
            let ext = path.extname(url).toLowerCase();
            let loader = this.loaders[ext] || this.loaders.default;

            loader.load(url, (texture) => {
                console.log("[TextureLoader] Loaded", url, texture);

                let toReturn = texture;

                if (ext === ".tga") {
                    
                } else {
                    // Render to a canvas to apply the color later                    
                    let cvs = new OffscreenCanvas(texture.image.width, texture.image.height);
                    let ctx = cvs.getContext("2d");
                    ctx.drawImage(texture.image, 0, 0);
                    texture.image = cvs;
                }

                if (uuidDatabase) uuidDatabase.loadedFiles[url] = toReturn;

                resolve(this.cloneTexture(toReturn));
            });
        });
    }

    static cloneTexture(texture) {
        if (!(texture.image instanceof OffscreenCanvas)) {
            console.warn("Can't clone texture because it's not an OffscreenCanvas!", texture);
            return texture;
        }

        let image = new OffscreenCanvas(texture.image.width, texture.image.height);
        let ctx = image.getContext("2d");
        ctx.drawImage(texture.image, 0, 0);

        let cloned = new THREE.CanvasTexture(image);
        // console.log("Cloned", cloned);
        return cloned;
    }
}

module.exports = TextureLoader;