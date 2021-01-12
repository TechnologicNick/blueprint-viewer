const fs = require("fs");
const THREE = require("three");
eval(fs.readFileSync("./node_modules/three/examples/js/controls/OrbitControls.js").toString()); // Hack that adds THREE.OrbitControls
eval(fs.readFileSync("./node_modules/three/examples/js/geometries/ConvexGeometry.js").toString()); // Hack that adds THREE.ConvexGeometry
eval(fs.readFileSync("./node_modules/three/examples/js/math/ConvexHull.js").toString()); // Hack that adds THREE.ConvexHull
const Stats = require("stats.js");

const Body = require("./body.js");
const { Shape } = require("./shape.js");
const Exporter = require("./exporter.js");

class Viewer {
    constructor(contentProvider, uuidDatabase) {
        this.contentProvider = contentProvider;
        this.uuidDatabase = uuidDatabase;
    }

    loadBlueprintFromFile(pathDir) {
        this.bp = this.contentProvider.loadBlueprintFromFile(pathDir);
        this.scene.name = this.bp.description.name;

        return this.bp;
    }

    loadBlueprint(bp) {
        this.bp = bp;

        return this.bp;
    }

    init(domElement) {
        this.domElement = domElement;
        this.canvasContainer = this.domElement.querySelector(".canvas-container");

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.canvasContainer.appendChild( this.renderer.domElement );

        this.stats = new Stats();
        this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.canvasContainer.appendChild( this.stats.dom );

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x222222 );

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100 );
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, 0, 0);

        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );

        this.resizeObserver = new ResizeObserver((entries, observer) => {
            for (let entry of entries) {
                this.onResize(entry.contentRect.width, entry.contentRect.height);
            }
        });
        this.resizeObserver.observe(this.canvasContainer);

        this.domElement.querySelector(".btn-export").onclick = () => {
            this.export();
        };
    }

    async generateMeshes() {
        console.log(this.bp);

        this.bodies = [];

        for (let blueprintBody of this.bp.blueprint.bodies) {
            let body = new Body(blueprintBody, this.uuidDatabase);

            for (let shape of body.shapes) {
                let m = await shape.generateObject3D();

                shape.applyTransform();

                this.scene.add(m);
            }

            this.bodies.push(body);
        }
    }

    async view() {
        let uuids = this.bp.getUuids();
        console.log(`Blueprint contains ${uuids.length} unique uuids`, uuids);
        
        this.uuidDatabase.preloadUuids(uuids);
        console.log("Database contents:", this.uuidDatabase.definitions);
        this.uuidDatabase.preloadRenderables(uuids);

        // for (let uuid of uuids.filter(uuid => this.uuidDatabase.definitions[uuid].type !== "block")) {
        //     let rend = this.uuidDatabase.renderables[uuid];

        //     this.scene.add(await rend.getMesh())
        // }

        await this.generateMeshes();
        this.centerCamera();

        document.addEventListener("keydown", (e) => {
            if (e.key === "q") {
                for (let body of this.bodies) {
                    for (let shape of body.shapes) {
                        shape.nextRotationIndex();
                    }
                }
            }
        }, false);

        console.log("view() done");
    }

    export() {
        Exporter.exportGLTF(this.scene);
    }

    centerCamera() {
        try {
            let centers = this.scene.children.map(child => {
                return child.children.filter(subChild => subChild.name === "shapeCenter")[0].getWorldPosition(new THREE.Vector3());
            });

            let center;

            switch (centers.length) {
                case 0:
                    center = new THREE.Vector3(0, 0, 0);
                    break;
                case 1:
                    center = centers[0];
                    break;
                case 2:
                    center = new THREE.Vector3().addVectors(centers[0], centers[1]).divideScalar(2);
                    break;
                case 3:
                    // It's not perfect but the centeroid lies inside the plane
                    let centeroid = new THREE.Vector3().add(centers[0]).add(centers[1]).add(centers[2]).divideScalar(3);
                    centers.push(centeroid.add(new THREE.Vector3(0, 0, 0.01))); // Add the centeroid to the point list to compute the bounding sphere
                default:
                    let geom = new THREE.ConvexGeometry(centers);
                    geom.computeBoundingSphere();
                    center = geom.boundingSphere.center;
            }

            if (isNaN(center.x) || isNaN(center.y) || isNaN(center.z)) throw new Error("Vector3 has a NaN coordinate!");

            console.log("Centered camera position to", center);
            return this.controls.target = center;
        } catch(ex) {
            console.error("Failed to center camera:", ex);
            return this.controls.target = new THREE.Vector3(0, 0, 0);
        }
    }

    update() {
        this.stats.begin();

        this.controls.update();
        this.renderer.render( this.scene, this.camera );

        // console.log(this.scene.children);

        this.stats.end();
    }

    onResize(width, height) {
        // Update size
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);

        // Render to prevent flickering
        this.update();
    }
}

// export default Viewer;
module.exports = Viewer;