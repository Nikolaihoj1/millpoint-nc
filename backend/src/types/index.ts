/**
 * Shared TypeScript types for backend
 * Following Cursor Clause 4.5 Rules
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

/**
 * Program status enum
 */
export enum ProgramStatus {
  DRAFT = 'Draft',
  IN_REVIEW = 'In Review',
  APPROVED = 'Approved',
  RELEASED = 'Released',
  OBSOLETE = 'Obsolete',
}

/**
 * Machine status enum
 */
export enum MachineStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  MAINTENANCE = 'Maintenance',
}

/**
 * User role enum
 */
export enum UserRole {
  PROGRAMMER = 'programmer',
  QUALITY = 'quality',
  OPERATOR = 'operator',
  ADMIN = 'admin',
}


