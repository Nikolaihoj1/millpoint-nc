/**
 * File storage utility for handling NC files, CAD files, and media
 * Following Cursor Clause 4.5 Rules
 */

import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { FileUploadResult } from '../types';

/**
 * File storage service for local filesystem
 * Handles file uploads, retrieval, and deletion
 */
export class FileStorageService {
  private basePath: string;

  constructor(basePath: string = process.env.STORAGE_PATH || './storage') {
    this.basePath = basePath;
  }

  /**
   * Initialize storage directories
   * Creates necessary directories if they don't exist
   */
  async initialize(): Promise<void> {
    const dirs = [
      path.join(this.basePath, 'nc'),
      path.join(this.basePath, 'cad'),
      path.join(this.basePath, 'dxf'),
      path.join(this.basePath, 'media'),
      path.join(this.basePath, 'documents'),
      path.join(this.basePath, 'versions'),
    ];

    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }

    console.log('✅ File storage initialized');
  }

  /**
   * Save uploaded file to storage
   * 
   * @param file - Express multer file object
   * @param category - File category ('nc', 'cad', 'dxf', 'media', 'documents')
   * @returns File upload result with path and metadata
   */
  async saveFile(
    file: Express.Multer.File,
    category: string
  ): Promise<FileUploadResult> {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const filepath = path.join(this.basePath, category, filename);

    await fs.writeFile(filepath, file.buffer);

    return {
      filename,
      filepath,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };
  }

  /**
   * Get file from storage
   * 
   * @param filepath - File path relative to storage base
   * @returns File buffer
   */
  async getFile(filepath: string): Promise<Buffer> {
    return await fs.readFile(filepath);
  }

  /**
   * Delete file from storage
   * 
   * @param filepath - File path relative to storage base
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  /**
   * Check if file exists
   * 
   * @param filepath - File path to check
   * @returns True if file exists
   */
  async fileExists(filepath: string): Promise<boolean> {
    try {
      await fs.access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file stats
   * 
   * @param filepath - File path
   * @returns File stats
   */
  async getFileStats(filepath: string) {
    return await fs.stat(filepath);
  }

  /**
   * Create version backup of a file
   * 
   * @param filepath - Original file path
   * @param versionNumber - Version number
   * @returns Path to versioned file
   */
  async createVersion(filepath: string, versionNumber: number): Promise<string> {
    const filename = path.basename(filepath);
    const versionPath = path.join(
      this.basePath,
      'versions',
      `v${versionNumber}-${filename}`
    );

    await fs.copyFile(filepath, versionPath);
    return versionPath;
  }
}

// Export singleton instance
export const fileStorage = new FileStorageService();


