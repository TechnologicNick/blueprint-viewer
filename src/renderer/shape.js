const THREE = require("three");
const MeshLoader = require("./meshLoader.js");

const loader = new THREE.ObjectLoader();

class Shape {
    color = new THREE.Color(0);
    pos = new THREE.Vector3(0, 0, 0);
    shapeId = "00000000-0000-0000-0000-000000000000";
    xaxis = 1;
    zaxis = 3;

    constructor(blueprintChild, uuidDatabase) {
        this.blueprintChild = blueprintChild;
        this.uuidDatabase = uuidDatabase;
    }

    static fromBlueprintChild(blueprintChild, uuidDatabase) {
        let def = uuidDatabase.definitions[blueprintChild.shapeId];
        console.log(def);

        let instance;

        switch(def.type) {
            case "block":
                instance = new Block(blueprintChild, uuidDatabase);
                break;
            case "part":
                instance = new Part(blueprintChild, uuidDatabase);
                break;
        }

        instance.deserialize();

        return instance;
    }

    deserialize() {
        this.color = new THREE.Color("#" + this.blueprintChild.color);
        this.pos = new THREE.Vector3(this.blueprintChild.pos.x, this.blueprintChild.pos.y, this.blueprintChild.pos.z);
        this.shapeId = this.blueprintChild.shapeId;
        this.xaxis = this.blueprintChild.xaxis;
        this.zaxis = this.blueprintChild.zaxis;
    }

    async generateGeometry() {
        throw new Error("Not implemented");
    }

    async generateMaterial() {
        throw new Error("Not implemented");
    }

    async generateMesh() {
        this.mesh = new THREE.Mesh(await this.generateGeometry(), await this.generateMaterial());
        return this.mesh;
    }

    applyTransform() {
        console.log(this);
        this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    }
}

class Block extends Shape {
    bounds = new THREE.Vector3(1, 1, 1);

    constructor(blueprintChild, uuidDatabase) {
        super(blueprintChild, uuidDatabase);
    }
    
    deserialize() {
        super.deserialize();

        this.bounds = new THREE.Vector3(this.blueprintChild.bounds.x, this.blueprintChild.bounds.y, this.blueprintChild.bounds.z);
    }

    generateGeometry() {
        this.geometry = new THREE.BoxGeometry(this.bounds.x, this.bounds.y, this.bounds.z); //TODO
        console.log(this.bounds);
        return this.geometry;
    }

    async generateMaterial() {
        this.material = new THREE.MeshNormalMaterial();
        return this.material;
    }
}

class Part extends Shape {
    controller = {};

    constructor(blueprintChild, uuidDatabase) {
        super(blueprintChild, uuidDatabase);
    }
    
    deserialize() {
        super.deserialize();

        this.controller = this.blueprintChild.controller;
    }

    async generateMesh() {
        return this.mesh = await new Promise(async (resolve, reject) => {
            let rend = this.uuidDatabase.renderables[this.blueprintChild.shapeId];
            console.log("bbbbbb", rend, this.uuidDatabase, this.blueprintChild);

            rend.lods ?? rend.sortLods();

            

            let r = await MeshLoader.load(rend.contentProvider.expandPathPlaceholders(rend.lods[0].mesh, this.blueprintChild.shapeId));

            r.traverse((object) => {
                if (object.material) {
                    object.material = new THREE.MeshNormalMaterial(); // Overwrite the default material for testing purposes
                }
            });

            console.log("returned", r);
            resolve(r);
        });
    }

    async generateGeometry() {

        return new Promise(async (resolve, reject) => {
            let rend = this.uuidDatabase.renderables[this.blueprintChild.shapeId];
            console.log("bbbbbb", rend, this.uuidDatabase, this.blueprintChild);

            rend.lods ?? rend.sortLods();

            // loader.load(
            //     rend.contentProvider.expandPathPlaceholders(rend.lods[0].mesh, this.blueprintChild.shapeId),
            //     (obj) => {
            //         console.log("Loaded", obj);

            //         this.geometry = obj;

            //         resolve(obj);
            //     },
            //     (xhr) => {
            //         console.log(`${xhr.loaded / xhr.total * 100}% loaded`);
            //     },
            //     (err) => {
            //         console.error(err);
            //         reject(err);
            //     }
            // );

            let r = await MeshLoader.load(rend.contentProvider.expandPathPlaceholders(rend.lods[0].mesh, this.blueprintChild.shapeId));
            console.log("returned", r);
            resolve(r);
        });

        // this.geometry = new THREE.BoxGeometry(1, 1, 1);
        // return this.geometry;
    }

    async generateMaterial() {
        this.material = new THREE.MeshNormalMaterial();
        return this.material;
    }
}

module.exports.Shape = Shape;
module.exports.Block = Block;
module.exports.Part = Part;
