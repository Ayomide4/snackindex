import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';


@Injectable()
export class SnacksService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll(): Promise<any[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('snacks')
      .select('id, name, created_at, company_name:companies(name)');

    if (error) {
      console.error('Error fetching snacks:', error);
      throw new Error(error.message);
    }

    return data;
  }
}
