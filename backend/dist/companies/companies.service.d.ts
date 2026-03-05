import { SupabaseService } from '../supabase/supabase.service';
export declare class CompaniesService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findAll(): Promise<any[]>;
}
