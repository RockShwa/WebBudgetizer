import sql from "mssql"
import { config } from "$lib/server/db";

await sql.connect(config);

export async function addCategory(name: string) {
    // get category goal & default goal later
    await sql.query`
                INSERT INTO Categories (name, goal, defaultGoal)
                VALUES (${name}, ${0}, ${0})
            `;
}

export async function deleteCategory(name: string) {
    await sql.query`
                DELETE FROM Categories WHERE name=${name}
            `;    
}