const { Shape } = require("./shape.js");

class Body {
    constructor(blueprintBody, uuidDatabase) {
        this.blueprintBody = blueprintBody;

        this.shapes = [];

        for (let blueprintChild of this.blueprintBody.childs) {
            let s = Shape.fromBlueprintChild(blueprintChild, uuidDatabase);
            s.deserialize();
            
            this.shapes.push(s);
        }

        console.log(this.shapes);
    }


}

module.exports = Body;