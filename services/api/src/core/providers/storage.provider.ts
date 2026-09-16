import { Injectable, Logger } from "@nestjs/common";
import { StorageProvider, FileResult } from "@restovyn/types";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadDir = path.resolve(
    process.env.STORAGE_LOCAL_DIR || "./uploads",
  );

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    destinationPath: string,
  ): Promise<FileResult> {
    const fullPath = path.join(this.uploadDir, destinationPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, file.buffer);
    this.logger.log(`Uploaded file locally to: ${fullPath}`);

    return {
      fileId: destinationPath,
      url: `/uploads/${destinationPath}`,
      key: destinationPath,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    };
  }

  async download(key: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, key);
    return fs.promises.readFile(fullPath);
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, key);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async getUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }
}
