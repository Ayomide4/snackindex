import { Injectable } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class MentionsService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async findAll(limit?: number): Promise<any> {
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

  async findBySnackId(snackId: number, limit?: number): Promise<any> {
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
  async findRecent(days: number = 7, limit?: number): Promise<any> {
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

  async findBySource(source: string, limit?: number): Promise<any> {
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
}
