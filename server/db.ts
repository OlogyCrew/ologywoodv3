import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  artistProfiles, InsertArtistProfile, ArtistProfile,
  venueProfiles, InsertVenueProfile, VenueProfile,
  riderTemplates, InsertRiderTemplate, RiderTemplate,
  availability, InsertAvailability, Availability,
  bookings, InsertBooking, Booking,
  messages, InsertMessage, Message,
  subscriptions, InsertSubscription, Subscription,
  reviews, InsertReview, Review,
  venueReviews, InsertVenueReview, VenueReview,
  favorites, InsertFavorite, Favorite,
  bookingTemplates, InsertBookingTemplate, BookingTemplate,
  profileViews, InsertProfileView, ProfileView,
  bookingReminders, InsertBookingReminder, BookingReminder,
  contracts, InsertContract, Contract,
  signatures, InsertSignature, Signature,
  contractTemplates, InsertContractTemplate, ContractTemplate
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { eq, sql } from "drizzle-orm";

let _db: ReturnType<typeof drizzle> | null = null;

// ============= CONTRACT FUNCTIONS =============

export async function createContract(data: InsertContract): Promise<Contract> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Build insert data, only including defined fields
  const insertData: any = {
    contractData: data.contractData,
    status: data.status,
  };

  // Only add optional fields if they're defined
  if (data.bookingId !== undefined && data.bookingId !== null) {
    insertData.bookingId = data.bookingId;
  }
  if (data.artistId !== undefined && data.artistId !== null) {
    insertData.artistId = data.artistId;
  }
  if (data.venueId !== undefined && data.venueId !== null) {
    insertData.venueId = data.venueId;
  }

  await db.insert(contracts).values(insertData);
  
  // Get the latest inserted contract
  const latestContracts = await db.select({
    id: contracts.id,
    bookingId: contracts.bookingId,
    artistId: contracts.artistId,
    venueId: contracts.venueId,
    contractData: contracts.contractData,
    status: contracts.status,
    createdAt: contracts.createdAt,
    updatedAt: contracts.updatedAt,
  }).from(contracts).orderBy(contracts.id).limit(1);
  
  if (!latestContracts || latestContracts.length === 0) {
    throw new Error('Failed to retrieve created contract');
  }
  
  return latestContracts[0] as Contract;
}

export async function getContractById(id: number): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    // Select only columns that exist in the database
    const result = await db.select({
      id: contracts.id,
      bookingId: contracts.bookingId,
      artistId: contracts.artistId,
      venueId: contracts.venueId,
      contractData: contracts.contractData,
      status: contracts.status,
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
    }).from(contracts).where(eq(contracts.id, id)).limit(1);
    return result[0] as any;
  } catch (error) {
    console.error('[getContractById] Error:', error);
    return undefined;
  }
}

export async function getContractByBookingId(bookingId: number): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contracts).where(eq(contracts.bookingId, bookingId)).limit(1);
  return result[0];
}

export async function getContractsByArtistId(artistId: number): Promise<Contract[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contracts).where(eq(contracts.artistId, artistId));
}

export async function getContractsByVenueId(venueId: number): Promise<Contract[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contracts).where(eq(contracts.venueId, venueId));
}

export async function updateContract(id: number, data: Partial<InsertContract>): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(contracts).set(data).where(eq(contracts.id, id));
  return await getContractById(id);
}

export async function updateContractStatus(id: number, status: string): Promise<Contract | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  try {
    await db.update(contracts).set({ status }).where(eq(contracts.id, id));
    const updated = await getContractById(id);
    if (updated) {
      return updated;
    }
    console.warn('[updateContractStatus] Contract not found after update:', id);
    return undefined;
  } catch (error) {
    console.error('[updateContractStatus] Error:', error);
    return undefined;
  }
}

// ============= SIGNATURE FUNCTIONS =============

export async function createSignature(data: InsertSignature): Promise<Signature> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.insert(signatures).values(data);
  const signatureId = (result as any).insertId;
  const signature = await db.select().from(signatures).where(eq(signatures.id, signatureId)).limit(1);
  return signature[0] as Signature;
}

export async function getSignatureById(id: number): Promise<Signature | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(signatures).where(eq(signatures.id, id)).limit(1);
  return result[0];
}

export async function getSignaturesByContractId(contractId: number): Promise<Signature[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(signatures).where(eq(signatures.contractId, contractId));
}

// ============= DATABASE CONNECTION =============

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER FUNCTIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

  if (existing.length > 0) {
    await db.update(users).set(user).where(eq(users.openId, user.openId));
  } else {
    await db.insert(users).values(user);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: 'artist' | 'venue') {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= ADMIN USER MANAGEMENT FUNCTIONS =============

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users);
}

export async function updateUser(userId: number, updates: { role?: string; status?: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: any = {};
  // Only update role since the users table doesn't have a status column
  if (updates.role) {
    updateData.role = updates.role;
  }
  // Note: status field is not in the users table schema, so we skip it
  // If status tracking is needed, consider adding it to the schema

  if (Object.keys(updateData).length === 0) {
    return await getUserById(userId);
  }

  try {
    const result = await db.update(users).set(updateData).where(eq(users.id, userId));
    console.log(`[DB] Updated user ${userId}:`, updateData);
    const updatedUser = await getUserById(userId);
    console.log(`[DB] User after update:`, updatedUser);
    return updatedUser;
  } catch (error) {
    console.error(`[DB] Error updating user ${userId}:`, error);
    throw error;
  }
}

export async function getAllArtists() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(artistProfiles);
}

// ============= ARTIST PROFILE FUNCTIONS =============

export async function createArtistProfile(profile: InsertArtistProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(artistProfiles).values(profile);
  return result;
}

export async function getArtistProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(artistProfiles).where(eq(artistProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArtistProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(artistProfiles).where(eq(artistProfiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateArtistProfile(id: number, updates: Partial<ArtistProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(artistProfiles).set(updates).where(eq(artistProfiles.id, id));
}

export async function searchArtists(filters: {
  genre?: string[];
  location?: string;
  minFee?: number;
  maxFee?: number;
  availableFrom?: string;
  availableTo?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(artistProfiles);
  
  // Note: Genre filtering with JSON arrays requires custom SQL or post-processing
  // For MVP, we'll return all and filter in application code if needed
  
  const results = await query;
  
  // Apply filters in application code for MVP
  let filtered = results;
  
  if (filters.location) {
    filtered = filtered.filter(a => 
      a.location?.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  
  if (filters.minFee !== undefined) {
    filtered = filtered.filter(a => 
      a.feeRangeMin !== null && a.feeRangeMin >= filters.minFee!
    );
  }
  
  if (filters.maxFee !== undefined) {
    filtered = filtered.filter(a => 
      a.feeRangeMax !== null && a.feeRangeMax <= filters.maxFee!
    );
  }
  
  // Filter by availability dates if provided
  if (filters.availableFrom || filters.availableTo) {
    // Get availability for all artists
    const artistIds = filtered.map(a => a.id);
    const availabilities = await db.select().from(availability).where(
      sql`${availability.artistId} IN (${sql.join(artistIds.map(id => sql`${id}`), sql`, `)})`
    );
    
    // Filter artists who have availability in the requested date range
    filtered = filtered.filter(artist => {
      const artistAvailability = availabilities.filter(av => av.artistId === artist.id);
      if (artistAvailability.length === 0) return false;
      
      return artistAvailability.some(av => {
        const avDate = new Date(av.date);
        const fromDate = filters.availableFrom ? new Date(filters.availableFrom) : null;
        const toDate = filters.availableTo ? new Date(filters.availableTo) : null;
        
        if (fromDate && avDate < fromDate) return false;
        if (toDate && avDate > toDate) return false;
        return true;
      });
    });
  }
  
  return filtered;
}

export async function getArtistsByGenre(genres: string[]) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(artistProfiles);
  
  // Filter by genres in application code
  return results.filter(artist => {
    if (!artist.genres || !Array.isArray(artist.genres)) return false;
    return genres.some(g => artist.genres.includes(g));
  });
}

// ============= VENUE PROFILE FUNCTIONS =============

export async function createVenueProfile(profile: InsertVenueProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(venueProfiles).values(profile);
  return result;
}

export async function getVenueProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(venueProfiles).where(eq(venueProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getVenueProfileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(venueProfiles).where(eq(venueProfiles.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateVenueProfile(id: number, updates: Partial<VenueProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(venueProfiles).set(updates).where(eq(venueProfiles.id, id));
}

export async function searchVenues(filters: {
  location?: string;
  capacity?: number;
  type?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const results = await db.select().from(venueProfiles);
  
  let filtered = results;
  
  if (filters.location) {
    filtered = filtered.filter(v => 
      v.location?.toLowerCase().includes(filters.location!.toLowerCase())
    );
  }
  
  if (filters.capacity !== undefined) {
    filtered = filtered.filter(v => 
      v.capacity !== null && v.capacity >= filters.capacity!
    );
  }
  
  if (filters.type) {
    filtered = filtered.filter(v => 
      v.type?.toLowerCase() === filters.type!.toLowerCase()
    );
  }
  
  return filtered;
}

// ============= RIDER TEMPLATE FUNCTIONS =============

export async function createRiderTemplate(template: InsertRiderTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(riderTemplates).values(template);
  return result;
}

export async function getRiderTemplatesByArtistId(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(riderTemplates).where(eq(riderTemplates.artistId, artistId));
}

export async function getRiderTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(riderTemplates).where(eq(riderTemplates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateRiderTemplate(id: number, updates: Partial<RiderTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(riderTemplates).set(updates).where(eq(riderTemplates.id, id));
}

export async function deleteRiderTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Soft delete by setting isActive to false
  await db.update(riderTemplates).set({ isActive: false }).where(eq(riderTemplates.id, id));
}

// ============= AVAILABILITY FUNCTIONS =============

export async function createAvailability(availability_data: InsertAvailability) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(availability).values(availability_data);
  return result;
}

export async function getAvailabilityByArtistId(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(availability).where(eq(availability.artistId, artistId));
}

export async function getAvailabilityByDate(artistId: number, date: Date) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(availability).where(
    sql`${availability.artistId} = ${artistId} AND DATE(${availability.date}) = DATE(${date})`
  ).limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAvailability(id: number, updates: Partial<Availability>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(availability).set(updates).where(eq(availability.id, id));
}

export async function setAvailability(data: { artistId: number; date: Date; status: string; notes?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if availability already exists for this artist and date
  const existing = await db.select().from(availability).where(
    sql`${availability.artistId} = ${data.artistId} AND DATE(${availability.date}) = DATE(${data.date})`
  ).limit(1);
  
  if (existing.length > 0) {
    // Update existing availability
    await db.update(availability).set({
      status: data.status as any,
      notes: data.notes,
      updatedAt: new Date(),
    }).where(eq(availability.id, existing[0].id));
  } else {
    // Create new availability
    await db.insert(availability).values({
      artistId: data.artistId,
      date: data.date,
      status: data.status as any,
      notes: data.notes,
    });
  }
}

export async function deleteAvailability(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Note: In a real app, you might want to soft delete
  // For now, we'll just update the status
}

// ============= BOOKING FUNCTIONS =============

export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function getBookingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBookingsByArtistId(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(bookings).where(eq(bookings.artistId, artistId));
  } catch (error) {
    console.error(`[DB] Error fetching bookings for artist ${artistId}:`, error);
    return [];
  }
}

export async function getBookingsByVenueId(venueId: number) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(bookings).where(eq(bookings.venueId, venueId));
  } catch (error) {
    console.error(`[DB] Error fetching bookings for venue ${venueId}:`, error);
    return [];
  }
}

export async function updateBooking(id: number, updates: Partial<Booking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bookings).set(updates).where(eq(bookings.id, id));
}

// ============= MESSAGE FUNCTIONS =============

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(message);
  return result;
}

export async function getMessagesByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(messages).where(eq(messages.bookingId, bookingId));
}

export async function getUnreadMessageCountByBooking(bookingId: number, userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select().from(messages).where(
    sql`${messages.bookingId} = ${bookingId} AND ${messages.recipientId} = ${userId} AND ${messages.isRead} = false`
  );
  
  return result.length;
}

export async function getTotalUnreadMessageCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  try {
    const result = await db.select().from(messages).where(
      sql`${messages.recipientId} = ${userId} AND ${messages.isRead} = false`
    );
    return result.length;
  } catch (error) {
    console.warn("[Database] Failed to get unread message count:", error);
    return 0;
  }
}

export async function markMessagesAsRead(bookingId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(messages).set({ isRead: true }).where(
    sql`${messages.bookingId} = ${bookingId} AND ${messages.recipientId} = ${userId}`
  );
}

// ============= SUBSCRIPTION FUNCTIONS =============

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(subscriptions).values(subscription);
  return result;
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  try {
    const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error('[DB] Error fetching subscription for user', userId, ':', error);
    return undefined;
  }
}

export async function updateSubscription(userId: number, updates: Partial<Subscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(subscriptions).set(updates).where(eq(subscriptions.userId, userId));
}

// ============= REVIEW FUNCTIONS =============

export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(reviews).values(review);
  return result;
}

export async function getReviewsByArtistId(artistId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(reviews).where(eq(reviews.artistId, artistId));
}

export async function getReviewsByVenueId(venueId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(venueReviews).where(eq(venueReviews.venueId, venueId));
}

// ============= FAVORITE FUNCTIONS =============

export async function addFavorite(userId: number, artistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(favorites).values({ userId, artistId });
  return result;
}

export async function removeFavorite(userId: number, artistId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(favorites).where(
    sql`${favorites.userId} = ${userId} AND ${favorites.artistId} = ${artistId}`
  );
}

export async function getFavoritesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function isFavorited(userId: number, artistId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(favorites).where(
    sql`${favorites.userId} = ${userId} AND ${favorites.artistId} = ${artistId}`
  ).limit(1);
  
  return result.length > 0;
}

// ============= BOOKING TEMPLATE FUNCTIONS =============

export async function createBookingTemplate(template: InsertBookingTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bookingTemplates).values(template);
  return result;
}

export async function getBookingTemplatesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bookingTemplates).where(eq(bookingTemplates.userId, userId));
}

// ============= PROFILE VIEW FUNCTIONS =============

export async function trackProfileView(artistId: number, viewerUserId?: number, ipAddress?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(profileViews).values({
    artistId,
    viewerUserId,
    ipAddress,
    viewedAt: new Date(),
  });
  
  return result;
}

// ============= BOOKING REMINDER FUNCTIONS =============

export async function createBookingReminder(reminder: InsertBookingReminder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bookingReminders).values(reminder);
  return result;
}

export async function getBookingRemindersByBookingId(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bookingReminders).where(eq(bookingReminders.bookingId, bookingId));
}

// ============= AVAILABILITY HELPER FUNCTIONS =============

export async function getFavoritedArtistsAvailability(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const userFavorites = await getFavoritesByUser(userId);
  const artistIds = userFavorites.map(f => f.artistId);
  
  if (artistIds.length === 0) return [];
  
  const availabilities = await db.select().from(availability).where(
    sql`${availability.artistId} IN (${sql.join(artistIds.map(id => sql`${id}`), sql`, `)})`
  );
  
  return availabilities.filter(av => {
    const avDate = new Date(av.date);
    return avDate >= startDate && avDate <= endDate;
  });
}


// ============= GET ALL CONTRACTS =============
export async function getAllContracts(): Promise<Contract[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select({
      id: contracts.id,
      bookingId: contracts.bookingId,
      artistId: contracts.artistId,
      venueId: contracts.venueId,
      contractData: contracts.contractData,
      status: contracts.status,
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
    }).from(contracts);
    
    return result as Contract[];
  } catch (error) {
    console.error('[getAllContracts] Error:', error);
    return [];
  }
}

// ============= GET USER CONTRACTS =============
export async function getUserContracts(userId: number): Promise<Contract[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.select({
      id: contracts.id,
      bookingId: contracts.bookingId,
      artistId: contracts.artistId,
      venueId: contracts.venueId,
      contractData: contracts.contractData,
      status: contracts.status,
      createdAt: contracts.createdAt,
      updatedAt: contracts.updatedAt,
    }).from(contracts).where(
      sql`${contracts.artistId} = ${userId} OR ${contracts.venueId} = ${userId}`
    );
    
    return result as Contract[];
  } catch (error) {
    console.error('[getUserContracts] Error:', error);
    return [];
  }
}


// ============= CONTRACT TEMPLATE FUNCTIONS =============
export async function createContractTemplate(data: InsertContractTemplate): Promise<ContractTemplate> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.insert(contractTemplates).values(data);
  
  // Get the created template
  const templates = await db.select().from(contractTemplates).where(
    eq(contractTemplates.id, result.insertId as any)
  ).limit(1);
  
  return templates[0] as ContractTemplate;
}

export async function getContractTemplateById(id: number): Promise<ContractTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id)).limit(1);
  return result[0];
}

export async function getContractTemplatesByArtistType(artistType: string): Promise<ContractTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contractTemplates).where(eq(contractTemplates.artistType, artistType));
}

export async function getContractTemplatesByContractType(contractType: string): Promise<ContractTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contractTemplates).where(eq(contractTemplates.contractType, contractType as any));
}

export async function getPublicContractTemplates(): Promise<ContractTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contractTemplates).where(eq(contractTemplates.isPublic, true));
}

export async function getUserContractTemplates(userId: number): Promise<ContractTemplate[]> {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(contractTemplates).where(eq(contractTemplates.userId, userId));
}

export async function updateContractTemplate(id: number, data: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(contractTemplates).set(data).where(eq(contractTemplates.id, id));
  return getContractTemplateById(id);
}

export async function deleteContractTemplate(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(contractTemplates).where(eq(contractTemplates.id, id));
  return true;
}
