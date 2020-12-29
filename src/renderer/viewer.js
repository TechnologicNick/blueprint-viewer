const fs = require("fs");
const THREE = require("three");
eval(fs.readFileSync("./node_modules/three/examples/js/controls/OrbitControls.js").toString()); // Hack that adds THREE.OrbitControls
eval(fs.readFileSync("./node_modules/three/examples/js/geometries/ConvexGeometry.js").toString()); // Hack that adds THREE.ConvexGeometry
eval(fs.readFileSync("./node_modules/three/examples/js/math/ConvexHull.js").toString()); // Hack that adds THREE.ConvexHull
const Stats = require("stats.js");

const Body = require("./body.js");
const { Shape } = require("./shape.js");

class Viewer {
    constructor(contentProvider, uuidDatabase) {
        this.contentProvider = contentProvider;
        this.uuidDatabase = uuidDatabase;
    }

    loadBlueprintFromFile(pathDir) {
        this.bp = this.contentProvider.loadBlueprintFromFile(pathDir);
        // console.log("loaded", this.bp);

        return this.bp;
    }

    loadBlueprint(bp) {
        this.bp = bp;

        return this.bp;
    }

    init() {
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.getElementById("canvas-container").appendChild( this.renderer.domElement );

        this.stats = new Stats();
        this.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.getElementById("canvas-container").appendChild( this.stats.dom );

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x222222 );

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100 );
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, 0, 0);

        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    }

    async generateMeshes() {
        console.log(this.bp);

        this.bodies = [];

        for (let blueprintBody of this.bp.blueprint.bodies) {
            let body = new Body(blueprintBody, this.uuidDatabase);

            for (let shape of body.shapes) {
                let m = await shape.generateObject3D();
                console.log("hhhhhhhhhhhhh", m);

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

    centerCamera() {
        let centers = this.scene.children.map(child => child.getWorldPosition());

        if (centers.length === 0) return;
        while (centers.length < 4) centers.push(centers[0]); // ConvexHull requires at least 4 vertices

        let geom = new THREE.ConvexGeometry(centers);
        geom.computeBoundingSphere();
        this.controls.target = geom.boundingSphere.center;
        console.log("Centered camera position to", geom.boundingSphere.center);
    }

    update() {
        this.stats.begin();

        this.controls.update();
        this.renderer.render( this.scene, this.camera );

        // console.log(this.scene.children);

        this.stats.end();
    }
}

// export default Viewer;
module.exports = Viewer;