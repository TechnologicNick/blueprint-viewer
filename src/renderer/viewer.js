const fs = require("fs");
const THREE = require("three");
eval(fs.readFileSync("./node_modules/three/examples/js/controls/OrbitControls.js").toString()); // Hack that adds THREE.OrbitalControls
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

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 100 );
        this.camera.position.set( -1.5, 2.5, 3.0 );

        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
    }

    generateMeshes() {
        console.log(this.bp);

        for (let blueprintBody of this.bp.blueprint.bodies) {
            let body = new Body(blueprintBody, this.uuidDatabase);

            for (let shape of body.shapes) {
                this.scene.add(shape.generateMesh());
            }
        }
    }

    view() {
        let uuids = this.bp.getUuids();
        console.log(`Blueprint contains ${uuids.length} unique uuids`, uuids);
        
        this.uuidDatabase.preloadUuids(uuids);
        console.log("Database contents:", this.uuidDatabase.definitions);

        this.generateMeshes();

        console.log("view() done");
    }

    update() {
        this.controls.update();
        this.renderer.render( this.scene, this.camera );
    }
}

// export default Viewer;
module.exports = Viewer;