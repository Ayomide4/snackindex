import { SupabaseService } from 'src/supabase/supabase.service';
export declare class CompaniesService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findAll(): Promise<any[]>;
}
