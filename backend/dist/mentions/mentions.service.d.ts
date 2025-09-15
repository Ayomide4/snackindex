import { SupabaseService } from 'src/supabase/supabase.service';
export declare class MentionsService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    findAll(limit?: number): Promise<any>;
    findBySnackId(snackId: number, limit?: number): Promise<any>;
    findRecent(days?: number, limit?: number): Promise<any>;
    findBySource(source: string, limit?: number): Promise<any>;
}
