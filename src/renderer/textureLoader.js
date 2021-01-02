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

    static applyColor(texture, color) {
        if (!(texture.image instanceof OffscreenCanvas)) {
            console.warn("Can't apply color to texture because it's not an OffscreenCanvas!", texture);
            return texture;
        }

        let ctx = texture.image.getContext("2d");
        let imageData = ctx.getImageData(0, 0, texture.image.width, texture.image.height);
        console.log(imageData);

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

            ctx.putImageData(imageData, 0, 0);
        }

        return texture;
    }
}

module.exports = TextureLoader;