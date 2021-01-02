const { MathUtils } = require("three");
const THREE = require("three");
const MeshLoader = require("./meshLoader.js");
const TextureLoader = require("./textureLoader.js");

const rightAngle = MathUtils.DEG2RAD * 90;
const axesToRotIndex = {
    "1,2":   3,
    "1,3":   0,
    "1,-2":  1, //43
    "1,-3":  2,
    "2,1":   5,
    "2,3":   16,
    "2,-1":  15,
    "2,-3":  24,
    "3,1":   6,
    "3,2":   25,
    "3,-1":  12,
    "3,-2":  17,
    "-1,2":  9, //35
    "-1,3":  10,
    "-1,-2": 11,
    "-1,-3": 8,
    "-2,1":  7,
    "-2,3":  26,
    "-2,-1": 13,
    "-2,-3": 18,
    "-3,1":  4, //23
    "-3,2":  19,
    "-3,-1": 14,
    "-3,-2": 27
}

const axisToEuler = {};

for (const [axes, rotIndex] of Object.entries(axesToRotIndex)) {
    axisToEuler[axes] = new THREE.Euler().setFromVector3(new THREE.Vector3(
        rightAngle * ((rotIndex >> 0) & 3),
        rightAngle * ((rotIndex >> 2) & 3),
        rightAngle * ((rotIndex >> 4) & 3)
    ));
}

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

    async generateObject3D() {
        throw new Error("Not implemented");
    }

    applyTransform() {
        this.object3D.traverse((child) => {
            if (child.geometry) {
                child.geometry.translate(this.bounds.x / 2, this.bounds.y / 2, this.bounds.z / 2);
            }
        })
        this.object3D.position.set(this.pos.x, this.pos.y, this.pos.z);
    }

    nextRotationIndex() {

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
        return this.geometry = new THREE.BoxGeometry(this.bounds.x, this.bounds.y, this.bounds.z);
    }

    async generateMaterial() {
        let def = this.uuidDatabase.definitions[this.blueprintChild.shapeId];

        console.log(def);

        let dif = await TextureLoader.load(this.uuidDatabase.contentProvider.expandPathPlaceholders(def.definition.dif, this.blueprintChild.shapeId), this.uuidDatabase);
        dif = TextureLoader.cloneTexture(dif); // Clone the texture so colors can be applied to all shapes that use this texture
        TextureLoader.applyColor(dif, this.color);

        // let asg = await TextureLoader.load(this.uuidDatabase.contentProvider.expandPathPlaceholders(definition.asg, this.blueprintChild.shapeId));
        // let nor = await TextureLoader.load(this.uuidDatabase.contentProvider.expandPathPlaceholders(definition.nor, this.blueprintChild.shapeId));


        return this.material = new THREE.MeshBasicMaterial({
            // color: this.color,
            map: dif
        });
    }

    async generateObject3D() {
        return this.object3D = new THREE.Mesh(await this.generateGeometry(), await this.generateMaterial());
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
        
        let def = this.uuidDatabase.definitions[this.blueprintChild.shapeId].definition;
        if (def.box) {
            this.bounds = new THREE.Vector3(def.box.x, def.box.y, def.box.z);
        } else if (def.hull) {
            this.bounds = new THREE.Vector3(def.hull.x, def.hull.y, def.hull.z);
        } else if (def.cylinder) {
            if (def.cylinder.axis === "X")      this.bounds = new THREE.Vector3(def.cylinder.depth, def.cylinder.diameter, def.cylinder.diameter);
            else if (def.cylinder.axis === "Y") this.bounds = new THREE.Vector3(def.cylinder.diameter, def.cylinder.depth, def.cylinder.diameter);
            else if (def.cylinder.axis === "Z") this.bounds = new THREE.Vector3(def.cylinder.diameter, def.cylinder.diameter, def.cylinder.depth);
        } else if (def.sphere) {
            this.bounds = new THREE.Vector3(def.sphere.diameter, def.sphere.diameter, def.sphere.diameter);
        } else {
            throw new Error("No collision found");
        }
    }

    async generateMaterialFromSubMesh(subMesh) {
        let dif = await TextureLoader.load(this.uuidDatabase.contentProvider.expandPathPlaceholders(subMesh.textureList[0], this.blueprintChild.shapeId), this.uuidDatabase);
        dif = TextureLoader.cloneTexture(dif); // Clone the texture so colors can be applied to all shapes that use this texture
        TextureLoader.applyColor(dif, this.color);

        return this.material = new THREE.MeshBasicMaterial({
            map: dif
        });
    }

    async generateObject3D() {
        return this.object3D = await new Promise(async (resolve, reject) => {
            let rend = this.uuidDatabase.renderables[this.blueprintChild.shapeId];
            console.log("[generateObject3D] Renderable:", rend, this.uuidDatabase, this.blueprintChild);

            rend.lods ?? rend.sortLods();
            let lod = rend.lods[0];

            let r = await MeshLoader.load(rend.contentProvider.expandPathPlaceholders(lod.mesh, this.blueprintChild.shapeId));

            if (lod.subMeshList){
                let objects = [];
                r.traverse((object) => {
                    if (object.material) {
                        objects.push(object);
                    }
                });

                let i = 0;
                for (let object of object) {
                    let subMesh = lod.subMeshList[i++];

                    object.material = await this.generateMaterialFromSubMesh(subMesh);
                }
            } else if (lod.subMeshMap) {
                let objects = {};
                r.traverse((object) => {
                    if (object.material) {
                        objects[object.material.name] = object;
                    }
                });

                for (let [name, object] of Object.entries(objects)) {
                    let subMesh = lod.subMeshMap[name];

                    if (subMesh) {
                        object.material = await this.generateMaterialFromSubMesh(subMesh);
                    }
                }
            } else {
                console.warn("No subMesh found in renderable", rend);
            }

            console.log("[generateObject3D] Returning", r);
            resolve(r);
        });
    }

    applyTransform() {
        super.applyTransform();

        let rot = axisToEuler[`${this.xaxis},${this.zaxis}`];
        this.object3D.rotation.setFromVector3(rot.toVector3());
    }

    nextRotationIndex() { // Function used for finding the correct rotation index
        this.rotIndex ??= 0;

        this.object3D.rotation.set(
            rightAngle * ((this.rotIndex >> 0) & 3),
            rightAngle * ((this.rotIndex >> 2) & 3),
            rightAngle * ((this.rotIndex >> 4) & 3)
        )

        console.log("Rotation set to index", this.rotIndex, "\t", ((this.rotIndex >> 0) & 3), ((this.rotIndex >> 2) & 3), ((this.rotIndex >> 4) & 3), this.object3D.quaternion);

        this.rotIndex++;
    }
}

module.exports.Shape = Shape;
module.exports.Block = Block;
module.exports.Part = Part;
