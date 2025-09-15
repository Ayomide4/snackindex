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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentionsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
let MentionsService = class MentionsService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findAll(limit) {
        const query = this.supabaseService
            .getClient()
            .from('snack_mentions')
            .select('*, snack_name:snack_id(name)')
            .order('published_at', { ascending: false });
        if (limit) {
            query.limit(limit);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error fetching mentions:', error);
            return [];
        }
        return data;
    }
    async findBySnackId(snackId, limit) {
        const query = this.supabaseService
            .getClient()
            .from('snack_mentions')
            .select('*, snack_name:snack_id(name)')
            .eq('snack_id', snackId)
            .order('published_at', { ascending: false });
        if (limit) {
            query.limit(limit);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error fetching mentions for snack:', error);
            return [];
        }
        return data;
    }
    async findRecent(days = 7, limit) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const query = this.supabaseService
            .getClient()
            .from('snack_mentions')
            .select('*, snack_name:snack_id(name)')
            .gte('published_at', cutoffDate.toISOString())
            .order('published_at', { ascending: false });
        if (limit) {
            query.limit(limit);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error fetching recent mentions:', error);
            return [];
        }
        return data;
    }
    async findBySource(source, limit) {
        const query = this.supabaseService
            .getClient()
            .from('snack_mentions')
            .select('*, snack_name:snack_id(name)')
            .eq('source', source)
            .order('published_at', { ascending: false });
        if (limit) {
            query.limit(limit);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Error fetching mentions by source:', error);
            return [];
        }
        return data;
    }
};
exports.MentionsService = MentionsService;
exports.MentionsService = MentionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], MentionsService);
//# sourceMappingURL=mentions.service.js.map