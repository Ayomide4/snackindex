import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class MetricsService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll(): Promise<any> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('daily_metrics')
      // .select('*, snacks:snack_id(snack_name:name)')
      .select('*, snack_name:snack_id(name)')
      .order('snack_id')
      .order('date')

    if (error) {
      console.error('Error fetching metrics:', error);
      return [];
    }

    return data;
  }
}
