import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class CompaniesService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll(): Promise<any[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      throw new Error(error.message);
    }

    return data;
  }
}
