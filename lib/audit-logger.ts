/**
 * Admin Audit Logger
 *
 * Non-blocking utility to log all admin actions to the database.
 * Logs are immutable and used for accountability and compliance.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type AdminAction =
  | 'approve_content'
  | 'reject_content'
  | 'generate_content'
  | 'publish_content'
  | 'delete_content'
  | 'update_order'
  | 'update_order_status'
  | 'update_review_status'
  | 'delete_generated_content'
  | 'run_agent'
  | 'publish_module'
  | 'generate_blog'
  | 'generate_social'
  | 'update_settings'
  | 'bulk_operation'
  | 'other';

export type ResourceType =
  | 'generated_content'
  | 'order'
  | 'blog_post'
  | 'social_post'
  | 'song'
  | 'video'
  | 'printable'
  | 'module'
  | 'character'
  | 'announcement'
  | 'game'
  | 'setting'
  | 'other';

export interface AuditLogEntry {
  admin_id: string;
  admin_email: string;
  action: AdminAction;
  resource_type: ResourceType;
  resource_id?: string;
  details?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    reason?: string;
    metadata?: Record<string, any>;
  };
  status: 'success' | 'error';
  error_message?: string;
  ip_address?: string;
}

/**
 * Log an admin action to the audit log table
 * This function is non-blocking - it runs in the background
 *
 * @param client - Supabase client (must have admin/service role permissions)
 * @param adminId - UUID of the admin user
 * @param adminEmail - Email of the admin user
 * @param action - The action being performed
 * @param resourceType - Type of resource being modified
 * @param resourceId - Optional ID of the specific resource
 * @param details - Optional details about what changed
 * @param ipAddress - Optional IP address of the request
 */
export async function logAdminAction(
  client: SupabaseClient,
  adminId: string,
  adminEmail: string,
  action: AdminAction,
  resourceType: ResourceType,
  resourceId?: string,
  details?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  try {
    // Non-blocking: fire and forget
    // We don't await this - it runs in the background
    client
      .from('admin_audit_logs')
      .insert({
        admin_id: adminId,
        admin_email: adminEmail,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        status: 'success',
        ip_address: ipAddress,
      })
      .then(({ error }) => {
        if (error) {
          console.error('[AUDIT LOG ERROR]', {
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            error: error.message,
          });
        }
      })
      .catch((e) => {
        console.error('[AUDIT LOG CRITICAL]', e.message);
      });
  } catch (error) {
    // Silently fail - we never want audit logging to crash the main operation
    console.error('[AUDIT LOG EXCEPTION]', error);
  }
}

/**
 * Log an admin action failure to the audit log table
 *
 * @param client - Supabase client (must have admin/service role permissions)
 * @param adminId - UUID of the admin user
 * @param adminEmail - Email of the admin user
 * @param action - The action that failed
 * @param resourceType - Type of resource
 * @param errorMessage - Error that occurred
 * @param resourceId - Optional ID of the specific resource
 * @param details - Optional additional details
 * @param ipAddress - Optional IP address of the request
 */
export async function logAdminActionError(
  client: SupabaseClient,
  adminId: string,
  adminEmail: string,
  action: AdminAction,
  resourceType: ResourceType,
  errorMessage: string,
  resourceId?: string,
  details?: Record<string, any>,
  ipAddress?: string
): Promise<void> {
  try {
    // Non-blocking: fire and forget
    client
      .from('admin_audit_logs')
      .insert({
        admin_id: adminId,
        admin_email: adminEmail,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        status: 'error',
        error_message: errorMessage,
        ip_address: ipAddress,
      })
      .then(({ error }) => {
        if (error) {
          console.error('[AUDIT LOG ERROR]', {
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            error: error.message,
          });
        }
      })
      .catch((e) => {
        console.error('[AUDIT LOG CRITICAL]', e.message);
      });
  } catch (error) {
    // Silently fail - we never want audit logging to crash the main operation
    console.error('[AUDIT LOG EXCEPTION]', error);
  }
}

/**
 * Extract IP address from a NextRequest or headers
 */
export function extractIpAddress(headers?: Record<string, string>): string | undefined {
  if (!headers) return undefined;

  return (
    headers['x-forwarded-for']?.split(',')[0].trim() ||
    headers['x-real-ip'] ||
    headers['cf-connecting-ip'] ||
    undefined
  );
}
