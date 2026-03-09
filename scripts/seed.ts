import * as dotenv from "dotenv";
dotenv.config();
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const existingAdmin = await db.query.users.findFirst({
        where: eq(users.username, "admin")
    });

    if (!existingAdmin) {
        await db.insert(users).values({
            id: "admin-id-1",
            username: "admin",
            password: "admin123",
            name: "Sistem Yöneticisi",
            role: "ADMIN"
        });
        console.log("Admin seeded successfully.");
    } else {
        console.log("Admin already exists.");
    }
}

main().catch(console.error);
