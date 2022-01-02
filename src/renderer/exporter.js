const fs = require("fs");
const THREE = require("three");
eval(fs.readFileSync("./node_modules/three/examples/js/exporters/GLTFExporter.js").toString()); // Hack that adds the THREE.GLTFExporter

class Exporter {
    static exportGLTF(scene, options = {}) {
        const exporter = new THREE.GLTFExporter();

        options.binary = true;

        exporter.parse(scene, result => {

            if ( result instanceof ArrayBuffer ) {
                let blob = new Blob([result], {type: "application/octet-stream"});

                this.saveFile(blob, `${scene.name.replace(/ /g,"_")}_exported.glb`);
            } else {
                let output = JSON.stringify(result, null, '\t');
                let blob = new Blob([output], {type: "text/plain"});

                this.saveFile(blob, `${scene.name.replace(/ /g,"_")}_exported.gltf`);
            }

        }, options);
    }

    static saveFile(blob, filename) {
        let link = document.createElement("a");
        link.style.display = "";
        document.body.appendChild(link);

        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }
}

module.exports = Exporter;