import { router, publicProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import dbFAQ from "../db-faq";

export const faqRouter = router({
  // Get all FAQs with optional filtering
  getAll: publicProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      return dbFAQ.getFAQs(input?.category, input?.search);
    }),

  // Get FAQ by ID
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input: id }) => {
      // Increment views
      await dbFAQ.incrementFAQViews(id);
      return dbFAQ.getFAQById(id);
    }),

  // Get all categories
  getCategories: publicProcedure.query(async () => {
    return dbFAQ.getFAQCategories();
  }),

  // Mark FAQ as helpful
  markHelpful: publicProcedure
    .input(
      z.object({
        id: z.number(),
        helpful: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return dbFAQ.markFAQHelpful(input.id, input.helpful);
    }),

  // Admin: Create FAQ
  create: adminProcedure
    .input(
      z.object({
        category: z.string(),
        question: z.string(),
        answer: z.string(),
        order: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return dbFAQ.createFAQ(input);
    }),

  // Admin: Update FAQ
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        category: z.string().optional(),
        question: z.string().optional(),
        answer: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return dbFAQ.updateFAQ(id, data);
    }),

  // Admin: Delete FAQ
  delete: adminProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      return dbFAQ.deleteFAQ(id);
    }),
});
