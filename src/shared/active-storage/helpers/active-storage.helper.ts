import { createHash, randomBytes } from "crypto";

export class ActiveStorageHelper {

  static generateKey() {
    return randomBytes(16).toString('hex') + randomBytes(2).toString('hex');
  }
  
  static getChecksum(buffer: Buffer) {
    return createHash('md5').update(buffer).digest('hex');
  }
}