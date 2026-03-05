import { SupabaseService } from '../supabase/supabase.service';
export declare class MetricsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findAll(): Promise<any>;
}
