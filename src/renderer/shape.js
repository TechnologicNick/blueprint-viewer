const THREE = require("three");

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

    generateGeometry() {
        throw new Error("Not implemented");
    }

    generateMaterial() {
        throw new Error("Not implemented");
    }

    generateMesh() {
        this.mesh = new THREE.Mesh(this.generateGeometry(), this.generateMaterial());
        return this.mesh;
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
        this.geometry = new THREE.BoxGeometry(1, 1, 1); //TODO
        return this.geometry;
    }

    generateMaterial() {
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

    generateGeometry() {
        this.geometry = new THREE.BoxGeometry(this.bounds);
        return this.geometry;
    }

    generateMaterial() {
        this.material = new THREE.MeshNormalMaterial();
        return this.material;
    }
}

module.exports.Shape = Shape;
module.exports.Block = Block;
module.exports.Part = Part;
