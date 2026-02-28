import { Module, Global } from '@nestjs/common';
import { StorageService, STORAGE_ADAPTER } from './storage.service';
import { IStorageAdapter } from './interfaces/storage-adapter.interface';
import { MinIOStorageAdapter } from './adapters/minio-storage.adapter';
import { SupabaseStorageAdapter } from './adapters/supabase-storage.adapter';

function createStorageAdapter(): IStorageAdapter {
  const provider = process.env.STORAGE_PROVIDER || 'minio';
  if (provider === 'supabase') {
    return new SupabaseStorageAdapter();
  }
  return new MinIOStorageAdapter();
}

@Global()
@Module({
  providers: [
    {
      provide: STORAGE_ADAPTER,
      useFactory: createStorageAdapter,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
