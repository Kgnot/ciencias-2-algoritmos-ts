"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vertex = exports.COLOR = void 0;
var COLOR;
(function (COLOR) {
    COLOR["RED"] = "red";
    COLOR["GREEN"] = "green";
    COLOR["BLUE"] = "blue";
    COLOR["YELLOW"] = "yellow";
    COLOR["ORANGE"] = "orange";
    COLOR["PURPLE"] = "purple";
    COLOR["CYAN"] = "cyan";
    COLOR["MAGENTA"] = "magenta";
    COLOR["BLACK"] = "black";
    COLOR["WHITE"] = "white";
})(COLOR || (exports.COLOR = COLOR = {}));
var Vertex = /** @class */ (function () {
    function Vertex(id, value, color) {
        if (color === void 0) { color = COLOR.WHITE; }
        this.id = id;
        this.value = value;
        this.color = color;
    }
    Vertex.prototype.compareTo = function (other) {
        if (this.value < other.value)
            return -1;
        if (this.value > other.value)
            return 1;
        return 0;
    };
    Vertex.prototype.getValue = function () {
        return this.value;
    };
    Vertex.prototype.toString = function () {
        return "Vertex(".concat(this.id, ", ").concat(this.value, ")");
    };
    Vertex.prototype.setColor = function (color) {
        this.color = color;
    };
    Vertex.prototype.getColor = function () {
        return this.color;
    };
    return Vertex;
}());
exports.Vertex = Vertex;
