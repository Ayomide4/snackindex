"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const snacks_controller_1 = require("./snacks/snacks.controller");
const snacks_service_1 = require("./snacks/snacks.service");
const supabase_service_1 = require("./supabase/supabase.service");
const config_1 = require("@nestjs/config");
const metrics_controller_1 = require("./metrics/metrics.controller");
const metrics_service_1 = require("./metrics/metrics.service");
const mentions_controller_1 = require("./mentions/mentions.controller");
const mentions_service_1 = require("./mentions/mentions.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
        ],
        controllers: [app_controller_1.AppController, snacks_controller_1.SnacksController, metrics_controller_1.MetricsController, mentions_controller_1.MentionsController],
        providers: [app_service_1.AppService, snacks_service_1.SnacksService, supabase_service_1.SupabaseService, metrics_service_1.MetricsService, mentions_service_1.MentionsService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map