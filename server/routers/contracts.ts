import { protectedProcedure, router } from "../_core/trpc";
import { z } from 'zod';
import * as db from '../db';
import { TRPCError } from '@trpc/server';
import * as email from '../email';
import { v4 as uuidv4 } from 'uuid';

// Helper to check if user is an artist
const artistProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'artist' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Artist access required' });
  }
  return next({ ctx });
});

// Helper to check if user is a venue
const venueProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'venue' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Venue access required' });
  }
  return next({ ctx });
});

export const contractsRouter = router({
  // Create a new contract (with or without a booking)
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      contractType: z.enum(['rider', 'service_agreement', 'performance_contract', 'booking_agreement', 'other']).default('rider'),
      terms: z.string().optional(),
      artistId: z.number().optional(),
      venueId: z.number().optional(),
      bookingId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // If bookingId is provided, verify access
      if (input.bookingId) {
        const booking = await db.getBookingById(input.bookingId);
        if (!booking) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
        }

        const isArtist = ctx.user.role === 'artist' && booking.artistId === ctx.user.id;
        const isVenue = ctx.user.role === 'venue' && booking.venueId === ctx.user.id;
        const isAdmin = ctx.user.role === 'admin';

        if (!isArtist && !isVenue && !isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized to create contract for this booking' });
        }
      }

      const contract = await db.createContract({
        bookingId: input.bookingId,
        artistId: input.artistId,
        venueId: input.venueId,
        contractData: {
          type: input.contractType,
          title: input.title,
          description: input.description,
          terms: input.terms,
        },
        status: 'draft',
      });

      return contract;
    }),

  // Get contract by ID
  getById: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const contract = await db.getContractById(input.contractId);
        if (!contract) {
          return null;
        }

        // Verify user has access
        const isArtist = ctx.user.role === 'artist' && contract.artistId === ctx.user.id;
        const isVenue = ctx.user.role === 'venue' && contract.venueId === ctx.user.id;
        const isAdmin = ctx.user.role === 'admin';

        if (!isArtist && !isVenue && !isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized to view this contract' });
        }

        return contract || null;
      } catch (error) {
        console.error('[Contracts.getById] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch contract' });
      }
    }),

  // Get all contracts
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const isAdmin = ctx.user.role === 'admin';
        if (isAdmin) {
          // Admins can see all contracts
          return await db.getAllContracts?.() || [];
        } else {
          // Regular users see only their contracts
          return await db.getUserContracts?.(ctx.user.id) || [];
        }
      } catch (error) {
        console.error('[Contracts.getAll] Error:', error);
        return [];
      }
    }),

  // Get contract by booking ID
  getByBookingId: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const contract = await db.getContractByBookingId(input.bookingId);
      if (!contract) {
        return null;
      }

      // Verify user has access
      const isArtist = ctx.user.role === 'artist' && contract.artistId === ctx.user.id;
      const isVenue = ctx.user.role === 'venue' && contract.venueId === ctx.user.id;
      const isAdmin = ctx.user.role === 'admin';

      if (!isArtist && !isVenue && !isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized to view this contract' });
      }

      return contract;
    }),

  // Update contract status
  updateStatus: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      status: z.enum(['draft', 'pending_signatures', 'signed', 'executed', 'archived']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const isAdmin = ctx.user.role === 'admin';
        if (!isAdmin) {
          const contract = await db.getContractById(input.contractId);
          if (!contract) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
          }
          const isArtist = ctx.user.role === 'artist' && contract.artistId === ctx.user.id;
          const isVenue = ctx.user.role === 'venue' && contract.venueId === ctx.user.id;
          if (!isArtist && !isVenue) {
            throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized to update this contract' });
          }
        }
        const updated = await db.updateContractStatus(input.contractId, input.status);
        if (!updated) {
          console.warn('[Contracts.updateStatus] Update returned undefined');
          return { id: input.contractId, status: input.status };
        }
        return updated;
      } catch (error) {
        console.error('[Contracts.updateStatus] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update contract status' });
      }
    }),

  // Send contract to artist
  sendToArtist: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      artistId: z.number(),
      artistEmail: z.string().email(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const contract = await db.getContractById(input.contractId);
        if (!contract) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contract not found' });
        }

        // Verify user is the contract creator (venue)
        const isVenue = ctx.user.role === 'venue' && contract.venueId === ctx.user.id;
        const isAdmin = ctx.user.role === 'admin';

        if (!isVenue && !isAdmin) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only contract creator can send to artist' });
        }

        // Update contract with artist ID and change status to pending_signatures
        const updated = await db.updateContractStatus(input.contractId, 'pending_signatures');
        
        // Send email notification to artist
        const contractData = contract.contractData as any;
        const contractTitle = contractData?.title || `Contract #${contract.id}`;
        
        await email.sendEmail({
          to: input.artistEmail,
          subject: `New Contract: ${contractTitle}`,
          template: 'contract-sent',
          data: {
            artistName: 'Artist',
            contractTitle,
            contractId: contract.id,
            message: input.message || 'Please review and sign this contract.',
            contractLink: `${process.env.VITE_APP_URL}/contract/${contract.id}`,
          },
        });

        return { success: true, contract: updated };
      } catch (error) {
        console.error('[Contracts.sendToArtist] Error:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to send contract' });
      }
    }),

});
