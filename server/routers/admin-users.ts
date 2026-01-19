import { router, protectedProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const adminUsersRouter = router({
  // Get all users
  getAllUsers: protectedProcedure
    .query(async ({ ctx }) => {
      // Check if user is admin
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        });
      }

      try {
        const allUsers = await db.getAllUsers();
        
        return allUsers.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status || 'active',
          createdAt: u.createdAt?.toISOString?.()?.split('T')[0] || 'Unknown',
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    }),

  // Update user role and status
  updateUser: protectedProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(['artist', 'venue', 'admin', 'user']),
      status: z.enum(['active', 'inactive', 'suspended']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        });
      }

      try {
        // Update user in database
        const result = await db.updateUser(input.userId, {
          role: input.role,
          status: input.status,
        });

        if (!result) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        return {
          success: true,
          message: `User updated successfully`,
        };
      } catch (error) {
        console.error('Error updating user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
        });
      }
    }),

  // Suspend user
  suspendUser: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        });
      }

      try {
        await db.updateUser(input.userId, {
          status: 'suspended',
        });

        return {
          success: true,
          message: 'User suspended successfully',
        };
      } catch (error) {
        console.error('Error suspending user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to suspend user',
        });
      }
    }),

  // Reactivate user
  reactivateUser: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        });
      }

      try {
        await db.updateUser(input.userId, {
          status: 'active',
        });

        return {
          success: true,
          message: 'User reactivated successfully',
        };
      } catch (error) {
        console.error('Error reactivating user:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reactivate user',
        });
      }
    }),
});
