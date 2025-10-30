/**
 * File upload middleware and handlers for Setup Sheet media
 * Following Cursor Clause 4.5 Rules
 */

import multer from 'multer';
import { Request, Response } from 'express';
import { fileStorage } from '../../utils/file-storage';
import { asyncHandler } from '../../middleware/error-handler';
import { db } from '../../db/client';
import path from 'path';

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimes.join(', ')}`));
    }
  },
});

/**
 * POST /api/setup-sheets/:id/upload
 * Upload media files for a setup sheet
 */
export const uploadMedia = [
  upload.array('files', 10), // Max 10 files at once
  asyncHandler(async (req: Request, res: Response) => {
    const setupSheetId = req.params.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    // Verify setup sheet exists
    const setupSheet = await db.setupSheet.findUnique({
      where: { id: setupSheetId },
    });

    if (!setupSheet) {
      return res.status(404).json({
        success: false,
        error: 'Setup sheet not found',
      });
    }

    // Upload files and create media records
    const uploadedMedia = await Promise.all(
      files.map(async (file) => {
        const uploadResult = await fileStorage.saveFile(file, 'media');
        
        // Determine type based on mimetype
        const type = file.mimetype.startsWith('image/') ? 'image' : 'video';
        
        // Create media record
        const media = await db.media.create({
          data: {
            setupSheetId,
            type,
            url: `/api/files/media/${uploadResult.filename}`, // URL to access the file
            caption: file.originalname,
            order: 0,
            annotations: [],
          },
        });

        return {
          id: media.id,
          type,
          url: media.url,
          caption: media.caption,
          filename: uploadResult.filename,
          size: uploadResult.size,
          mimetype: uploadResult.mimetype,
        };
      })
    );

    res.status(201).json({
      success: true,
      data: uploadedMedia,
      message: `Successfully uploaded ${uploadedMedia.length} file(s)`,
    });
  }),
];

/**
 * GET /api/files/media/:filename
 * Serve media files
 */
export const serveMedia = asyncHandler(async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filepath = path.join(process.env.STORAGE_PATH || './storage', 'media', filename);

  try {
    const fileBuffer = await fileStorage.getFile(filepath);
    const stats = await fileStorage.getFileStats(filepath);

    // Determine content type from extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
    };

    res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream');
    res.setHeader('Content-Length', stats.size);
    res.send(fileBuffer);
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'File not found',
    });
  }
});

/**
 * DELETE /api/setup-sheets/:id/media/:mediaId
 * Delete a media file from setup sheet
 */
export const deleteMedia = asyncHandler(async (req: Request, res: Response) => {
  const { id: setupSheetId, mediaId } = req.params;

  // Verify setup sheet exists
  const setupSheet = await db.setupSheet.findUnique({
    where: { id: setupSheetId },
    include: { media: true },
  });

  if (!setupSheet) {
    return res.status(404).json({
      success: false,
      error: 'Setup sheet not found',
    });
  }

  // Find media record
  const media = setupSheet.media.find((m) => m.id === mediaId);
  if (!media) {
    return res.status(404).json({
      success: false,
      error: 'Media not found',
    });
  }

  // Extract filename from URL
  const filename = path.basename(media.url);
  const filepath = path.join(process.env.STORAGE_PATH || './storage', 'media', filename);

  // Delete file from storage
  await fileStorage.deleteFile(filepath);

  // Delete media record
  await db.media.delete({
    where: { id: mediaId },
  });

  res.json({
    success: true,
    message: 'Media deleted successfully',
  });
});

