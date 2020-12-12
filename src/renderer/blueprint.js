

class Blueprint {
    constructor(blueprint, description) {
        this.blueprint = blueprint;
        this.description = description;

        this.uri = {};
    }

    getPartUuids() {
        let uuids = new Set();

        for (let body of this.blueprint.bodies) {
            console.log(body);
            // uuids.add(body)
        }
    }

}

export default Blueprint;
// module.exports = Blueprint;