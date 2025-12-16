"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnacksController = void 0;
const common_1 = require("@nestjs/common");
const snacks_service_1 = require("./snacks.service");
let SnacksController = class SnacksController {
    snacksService;
    constructor(snacksService) {
        this.snacksService = snacksService;
    }
    findAll() {
        return this.snacksService.findAll();
    }
    getAllWithMetrics() {
        return this.snacksService.getAllWithMetrics();
    }
    getTrending() {
        return this.snacksService.getTrending();
    }
    search(query) {
        return this.snacksService.search(query);
    }
    findOne(id) {
        return this.snacksService.findOne(id);
    }
    getMetrics(id, days) {
        return this.snacksService.getMetrics(id, days);
    }
    getDetail(id) {
        return this.snacksService.getDetail(id);
    }
};
exports.SnacksController = SnacksController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SnacksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SnacksController.prototype, "getAllWithMetrics", null);
__decorate([
    (0, common_1.Get)('trending'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SnacksController.prototype, "getTrending", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SnacksController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SnacksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/metrics'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SnacksController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)(':id/detail'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SnacksController.prototype, "getDetail", null);
exports.SnacksController = SnacksController = __decorate([
    (0, common_1.Controller)('snacks'),
    __metadata("design:paramtypes", [snacks_service_1.SnacksService])
], SnacksController);
//# sourceMappingURL=snacks.controller.js.map