import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as db from '../db';
import { TRPCError } from '@trpc/server';

export const favoritesRouter = router({
  // Get all favorites for the current user
  getVenueFavorites: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const favorites = await db.getFavoritesByUser(ctx.user.id);
        return favorites;
      } catch (error) {
        console.error('Error fetching favorites:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch favorites' });
      }
    }),

  // Toggle favorite status for an artist
  toggleFavorite: protectedProcedure
    .input(z.object({
      artistId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const isFav = await db.isFavorited(ctx.user.id, input.artistId);
        
        if (isFav) {
          await db.removeFavorite(ctx.user.id, input.artistId);
          return { favorited: false };
        } else {
          await db.addFavorite(ctx.user.id, input.artistId);
          return { favorited: true };
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to toggle favorite' });
      }
    }),

  // Check if an artist is favorited by current user
  isFavorited: protectedProcedure
    .input(z.object({
      artistId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const isFav = await db.isFavorited(ctx.user.id, input.artistId);
        return isFav;
      } catch (error) {
        console.error('Error checking favorite status:', error);
        return false;
      }
    }),

  // Get all venues that favorited a specific artist
  getVenuesWhoFavorited: publicProcedure
    .input(z.object({
      artistId: z.number(),
    }))
    .query(async ({ input }) => {
      try {
        const venues = await db.getVenuesWhoFavoritedArtist(input.artistId);
        return venues;
      } catch (error) {
        console.error('Error fetching venues who favorited artist:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch venues' });
      }
    }),
});
