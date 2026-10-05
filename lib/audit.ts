import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface LogAuditParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
  tx?: Prisma.TransactionClient;
}

export async function logAuditEvent({
  userId,
  action,
  entity,
  entityId,
  metadata,
  ipAddress,
  userAgent,
  tx,
}: LogAuditParams) {
  try {
    const client = tx || prisma;
    return await client.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        metadata: metadata ?? undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Audit log failure should be captured in server logs without disrupting operations
    console.error("[AuditLog Error]: Failed to create audit log entry:", error);
    return null;
  }
}

