import { Readable } from 'stream';

export interface IStorageAdapter {
  upload(key: string, buffer: Buffer): Promise<void>;
  getStream(key: string): Promise<Readable>;
  delete(key: string): Promise<void>;
}
