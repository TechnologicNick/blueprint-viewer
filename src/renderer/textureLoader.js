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
            
            return Promise.resolve(cached);
        }

        return new Promise((resolve, reject) => {
            let ext = path.extname(url).toLowerCase();
            let loader = this.loaders[ext] || this.loaders.default;

            loader.load(url, (texture) => {
                console.log("[TextureLoader] Loaded", url, texture);

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

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

                resolve(toReturn);
            });
        });
    }

    static cloneTexture(texture) {
        if (!(texture instanceof THREE.DataTexture)) {
            console.warn("Can't clone texture because it's not a DataTexture!", texture);
            return texture;
        }

        let cloned = new THREE.DataTexture().copy(texture);
        let { data, width, height } = texture.image;
        cloned.image = {
            data: Uint8Array.from(data),
            width,
            height,
        };

        cloned.needsUpdate = true;

        return cloned;
    }

    static applyColor(texture, color) {
        if (!(texture instanceof THREE.DataTexture)) {
            console.warn("Can't apply color to texture because it's not a DataTexture!", texture);
            return texture;
        }

        let imageData = texture.image;

        if (imageData.data.length / (imageData.width * imageData.height) !== 4) { // check if 4 bytes per pixel
            console.error("Texture doesn't have an alpha channel!");
        } else {
            for (let i = 0; i < imageData.data.length; i += 4) {
                const a = imageData.data[i + 3];
                imageData.data[i + 0] = imageData.data[i + 0] + (255-a) * color.r;
                imageData.data[i + 1] = imageData.data[i + 1] + (255-a) * color.g;
                imageData.data[i + 2] = imageData.data[i + 2] + (255-a) * color.b;
                imageData.data[i + 3] = 255;
            }
        }

        return texture;
    }
}

module.exports = TextureLoader;