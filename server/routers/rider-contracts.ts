import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, desc } from "drizzle-orm";

/**
 * Rider Contract Router
 * Handles CRUD operations for artist rider contracts and templates
 */

// Validation schemas
const technicalRequirementsSchema = z.object({
  soundSystem: z.object({
    paWattage: z.number().optional(),
    mixerChannels: z.number().optional(),
    microphones: z.number().optional(),
    monitors: z.boolean().optional(),
  }).optional(),
  lighting: z.object({
    required: z.boolean().optional(),
    spotlights: z.number().optional(),
    colorWash: z.boolean().optional(),
    specialEffects: z.boolean().optional(),
  }).optional(),
  stage: z.object({
    minWidth: z.number().optional(),
    minDepth: z.number().optional(),
    height: z.number().optional(),
    riser: z.boolean().optional(),
  }).optional(),
  equipment: z.array(z.string()).optional(),
  recording: z.object({
    audioAllowed: z.boolean().optional(),
    videoAllowed: z.boolean().optional(),
    streamingAllowed: z.boolean().optional(),
  }).optional(),
}).optional();

const hospitalityRequirementsSchema = z.object({
  meals: z.object({
    required: z.boolean().optional(),
    type: z.string().optional(),
    count: z.number().optional(),
  }).optional(),
  beverages: z.object({
    alcoholic: z.boolean().optional(),
    nonAlcoholic: z.boolean().optional(),
    quantity: z.number().optional(),
  }).optional(),
  dressingRoom: z.object({
    required: z.boolean().optional(),
    amenities: z.array(z.string()).optional(),
  }).optional(),
  parking: z.object({
    spaces: z.number().optional(),
    type: z.string().optional(),
  }).optional(),
  accommodations: z.object({
    required: z.boolean().optional(),
    nights: z.number().optional(),
    quality: z.string().optional(),
  }).optional(),
  security: z.object({
    required: z.boolean().optional(),
    staffCount: z.number().optional(),
  }).optional(),
}).optional();

const restrictionsSchema = z.object({
  smokingAllowed: z.boolean().optional(),
  alcoholAllowed: z.boolean().optional(),
  pyrotechnicsAllowed: z.boolean().optional(),
  setlistApprovalRequired: z.boolean().optional(),
  songRestrictions: z.array(z.string()).optional(),
}).optional();

const staffRequiredSchema = z.object({
  soundEngineer: z.boolean().optional(),
  lightingTechnician: z.boolean().optional(),
  stageManager: z.boolean().optional(),
  other: z.array(z.string()).optional(),
}).optional();

const createRiderContractSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
  performanceDuration: z.number().optional(),
  minFee: z.number().optional(),
  maxFee: z.number().optional(),
  technicalRequirements: technicalRequirementsSchema,
  hospitalityRequirements: hospitalityRequirementsSchema,
  loadInTime: z.string().optional(),
  soundcheckDuration: z.number().optional(),
  staffRequired: staffRequiredSchema,
  restrictions: restrictionsSchema,
  insuranceRequired: z.boolean().optional(),
  insuranceCoverageAmount: z.number().optional(),
  cancellationNoticeDays: z.number().optional().default(14),
  cancellationFeePercent: z.number().optional().default(0),
  specialRequests: z.string().optional(),
});

export const riderContractsRouter = router({
  /**
   * Create a new rider contract for the authenticated artist
   */
  createRiderContract: protectedProcedure
    .input(createRiderContractSchema)
    .mutation(async ({ input, ctx }) => {
      // For now, we'll return a mock response since the table isn't created yet
      // This demonstrates the API structure
      return {
        id: Math.floor(Math.random() * 10000),
        artistId: ctx.user.id,
        name: input.name,
        description: input.description || "",
        isDefault: input.isDefault || false,
        performanceDuration: input.performanceDuration,
        minFee: input.minFee,
        maxFee: input.maxFee,
        technicalRequirements: input.technicalRequirements,
        hospitalityRequirements: input.hospitalityRequirements,
        loadInTime: input.loadInTime,
        soundcheckDuration: input.soundcheckDuration,
        staffRequired: input.staffRequired,
        restrictions: input.restrictions,
        insuranceRequired: input.insuranceRequired || false,
        insuranceCoverageAmount: input.insuranceCoverageAmount,
        cancellationNoticeDays: input.cancellationNoticeDays || 14,
        cancellationFeePercent: input.cancellationFeePercent || 0,
        specialRequests: input.specialRequests,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  /**
   * Get all rider contracts for the authenticated artist
   */
  getArtistRiderContracts: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    }))
    .query(async ({ input, ctx }) => {
      // Mock response - would query database when table is created
      return {
        contracts: [],
        total: 0,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get a specific rider contract by ID
   */
  getRiderContract: publicProcedure
    .input(z.object({
      contractId: z.number(),
    }))
    .query(async ({ input }) => {
      // Mock response
      return {
        id: input.contractId,
        name: "Standard Rider",
        description: "Standard requirements for most venues",
        isDefault: true,
        performanceDuration: 60,
        minFee: 50000, // $500
        maxFee: 200000, // $2000
        technicalRequirements: {
          soundSystem: {
            paWattage: 2000,
            mixerChannels: 8,
            microphones: 2,
            monitors: true,
          },
          lighting: {
            required: true,
            spotlights: 2,
            colorWash: true,
            specialEffects: false,
          },
        },
        hospitalityRequirements: {
          meals: {
            required: true,
            type: "catering",
            count: 4,
          },
          beverages: {
            alcoholic: true,
            nonAlcoholic: true,
            quantity: 12,
          },
          dressingRoom: {
            required: true,
            amenities: ["mirror", "seating", "bathroom"],
          },
        },
        restrictions: {
          smokingAllowed: false,
          alcoholAllowed: true,
          pyrotechnicsAllowed: false,
          setlistApprovalRequired: false,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  /**
   * Update a rider contract
   */
  updateRiderContract: protectedProcedure
    .input(z.object({
      contractId: z.number(),
      data: createRiderContractSchema.partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Mock response
      return {
        id: input.contractId,
        ...input.data,
        updatedAt: new Date(),
      };
    }),

  /**
   * Delete a rider contract
   */
  deleteRiderContract: protectedProcedure
    .input(z.object({
      contractId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, deletedId: input.contractId };
    }),

  /**
   * Set a rider contract as default for the artist
   */
  setDefaultRiderContract: protectedProcedure
    .input(z.object({
      contractId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      return { success: true, defaultContractId: input.contractId };
    }),

  /**
   * Get pre-built rider contract templates
   */
  getRiderContractTemplates: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      // Return mock templates
      return [
        {
          id: 1,
          name: "Small Venue",
          category: "small_venue",
          description: "Ideal for intimate venues and clubs",
          usageCount: 245,
          isPublic: true,
        },
        {
          id: 2,
          name: "Festival",
          category: "festival",
          description: "Optimized for festival performances",
          usageCount: 189,
          isPublic: true,
        },
        {
          id: 3,
          name: "Corporate Event",
          category: "corporate",
          description: "For corporate and private events",
          usageCount: 156,
          isPublic: true,
        },
        {
          id: 4,
          name: "Wedding",
          category: "wedding",
          description: "Customized for wedding performances",
          usageCount: 203,
          isPublic: true,
        },
        {
          id: 5,
          name: "Tour",
          category: "tour",
          description: "For multi-date tours",
          usageCount: 112,
          isPublic: true,
        },
      ];
    }),

  /**
   * Create a rider contract from a template
   */
  createFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      customName: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        id: Math.floor(Math.random() * 10000),
        artistId: ctx.user.id,
        name: input.customName || "New Rider Contract",
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),

  /**
   * Get rider contract for a specific booking
   */
  getBookingRiderContract: publicProcedure
    .input(z.object({
      bookingId: z.number(),
    }))
    .query(async ({ input }) => {
      // Mock response
      return {
        bookingId: input.bookingId,
        riderContractId: 1,
        acceptedByVenue: true,
        acceptedByArtist: true,
        modificationStatus: "none",
        riderSnapshot: {
          name: "Standard Rider",
          performanceDuration: 60,
          minFee: 50000,
        },
      };
    }),

  /**
   * Accept or reject rider contract modifications for a booking
   */
  respondToRiderModifications: protectedProcedure
    .input(z.object({
      instanceId: z.number(),
      accept: z.boolean(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        success: true,
        instanceId: input.instanceId,
        accepted: input.accept,
        respondedAt: new Date(),
      };
    }),

  /**
   * Export rider contract as PDF
   */
  exportRiderContractPDF: publicProcedure
    .input(z.object({
      contractId: z.number(),
    }))
    .query(async ({ input }) => {
      return {
        success: true,
        contractId: input.contractId,
        downloadUrl: `/api/rider-contracts/${input.contractId}/download`,
        fileName: `rider-contract-${input.contractId}.pdf`,
      };
    }),

  /**
   * Get rider contract statistics for an artist
   */
  getRiderContractStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalContracts: 0,
      defaultContract: null,
      mostUsedTemplate: null,
      bookingsWithRiders: 0,
      acceptanceRate: 0,
    };
  }),
});
