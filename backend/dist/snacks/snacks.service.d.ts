import { SupabaseService } from 'src/supabase/supabase.service';
export declare class SnacksService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findAll(): Promise<any[]>;
    findOne(id: number): Promise<any>;
    getAllWithMetrics(): Promise<any[]>;
    getTrending(): Promise<any[]>;
    search(query: string): Promise<any[]>;
    getMetrics(id: number, days?: number): Promise<any[]>;
    getDetail(id: number): Promise<any>;
    private calculateOverallScore;
    private calculateTrendsChange;
    private calculateStockChange;
}
