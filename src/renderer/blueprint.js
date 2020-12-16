class Blueprint {
    constructor(blueprint, description) {
        this.blueprint = blueprint;
        this.description = description;

        this.uri = {};
    }

    getUuids() {
        let uuids = new Set();

        for (let body of this.blueprint.bodies) {
            for (let child of body.childs) {
                uuids.add(child.shapeId)
            }
        }

        return Array.from(uuids);
    }

}

// export default Blueprint;
module.exports = Blueprint;