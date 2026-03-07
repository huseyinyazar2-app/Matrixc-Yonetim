import * as dotenv from "dotenv";
dotenv.config();
import { db } from "../src/db";
import { users } from "../src/db/schema";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
    const existingAdmin = await db.query.users.findFirst({
        where: eq(users.username, "admin")
    });

    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash("admin123", 10);
        await db.insert(users).values({
            id: "admin-id-1",
            username: "admin",
            passwordHash,
            name: "Sistem Yöneticisi",
            role: "ADMIN"
        });
        console.log("Admin seeded successfully.");
    } else {
        console.log("Admin already exists.");
    }
}

main().catch(console.error);
