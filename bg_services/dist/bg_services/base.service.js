"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseBackgroundService = void 0;
const common_1 = require("@nestjs/common");
class BaseBackgroundService {
    constructor(serviceName) {
        this.logger = new common_1.Logger(serviceName);
    }
}
exports.BaseBackgroundService = BaseBackgroundService;
//# sourceMappingURL=base.service.js.map