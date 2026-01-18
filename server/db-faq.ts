import { getDb } from "./db";
import { faqs } from "../drizzle/schema";
import { eq, like, and } from "drizzle-orm";

export async function getFAQs(category?: string, search?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(faqs).where(eq(faqs.isPublished, true));

  if (category) {
    query = query.where(eq(faqs.category, category));
  }

  if (search) {
    query = query.where(
      like(faqs.question, `%${search}%`)
    );
  }

  return query.orderBy(faqs.order, faqs.createdAt);
}

export async function getFAQById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const faq = await db
    .select()
    .from(faqs)
    .where(and(eq(faqs.id, id), eq(faqs.isPublished, true)))
    .limit(1);

  return faq[0] || null;
}

export async function getFAQCategories() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .selectDistinct({ category: faqs.category })
    .from(faqs)
    .where(eq(faqs.isPublished, true))
    .orderBy(faqs.category);

  return result.map(r => r.category);
}

export async function incrementFAQViews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(faqs)
    .set({ views: faqs.views + 1 })
    .where(eq(faqs.id, id));
}

export async function markFAQHelpful(id: number, helpful: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const field = helpful ? faqs.helpful : faqs.notHelpful;
  return db
    .update(faqs)
    .set({ [field.name]: field + 1 })
    .where(eq(faqs.id, id));
}

export async function createFAQ(data: {
  category: string;
  question: string;
  answer: string;
  order?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(faqs).values({
    ...data,
    order: data.order ?? 0,
    isPublished: true,
  });
}

export async function updateFAQ(
  id: number,
  data: Partial<{
    category: string;
    question: string;
    answer: string;
    order: number;
    isPublished: boolean;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(faqs).set(data).where(eq(faqs.id, id));
}

export async function deleteFAQ(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(faqs).where(eq(faqs.id, id));
}

export default {
  getFAQs,
  getFAQById,
  getFAQCategories,
  incrementFAQViews,
  markFAQHelpful,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
