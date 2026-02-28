import { Injectable, Inject } from '@nestjs/common';
import { Readable } from 'stream';
import { IStorageAdapter } from './interfaces/storage-adapter.interface';

export const STORAGE_ADAPTER = 'STORAGE_ADAPTER';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_ADAPTER) private readonly adapter: IStorageAdapter,
  ) {}

  async upload(key: string, buffer: Buffer): Promise<void> {
    return this.adapter.upload(key, buffer);
  }

  async getStream(key: string): Promise<Readable> {
    return this.adapter.getStream(key);
  }

  async delete(key: string): Promise<void> {
    return this.adapter.delete(key);
  }
}
