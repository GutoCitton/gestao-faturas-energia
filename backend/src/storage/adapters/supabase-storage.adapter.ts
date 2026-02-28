import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Readable } from 'stream';
import { IStorageAdapter } from '../interfaces/storage-adapter.interface';

@Injectable()
export class SupabaseStorageAdapter implements IStorageAdapter {
  private readonly client: SupabaseClient;
  private readonly bucket: string;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!url || !serviceKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_KEY are required when STORAGE_PROVIDER=supabase',
      );
    }

    this.client = createClient(url, serviceKey);
    this.bucket = process.env.SUPABASE_BUCKET || 'invoices';
  }

  async upload(key: string, buffer: Buffer): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
  }

  async getStream(key: string): Promise<Readable> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .download(key);

    if (error) {
      throw new Error(`Supabase download failed: ${error.message}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Readable.from(Buffer.from(arrayBuffer));
  }

  async delete(key: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([key]);

    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
  }
}
