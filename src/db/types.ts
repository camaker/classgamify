import { apikey, user } from "./auth.schema";
import { activity, assignment, attempt, userFiles, payment } from "./app.schema";

export type User = typeof user.$inferSelect;
export type ApiKey = typeof apikey.$inferSelect;
export type UserFiles = typeof userFiles.$inferSelect;
export type Payment = typeof payment.$inferSelect;
export type Activity = typeof activity.$inferSelect;
export type Assignment = typeof assignment.$inferSelect;
export type Attempt = typeof attempt.$inferSelect;
