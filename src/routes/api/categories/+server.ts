import { json } from '@sveltejs/kit';
import sql from "mssql"
import { config } from '$lib/server/db.js';

export async function POST({request}) {
    await sql.connect(config);
    const { name } = await request.json();
    await sql.query`
        INSERT INTO Categories (name, goal, defaultGoal, categoryTotal)
        VALUES (${name}, ${0}, ${0}, ${0})
    `;
    return json({ name })
} 

export async function DELETE({ request }) {
    await sql.connect(config);
    const { name } = await request.json();
    await sql.query`
        DELETE FROM Categories WHERE name = ${name}
    `;
    return json({ success: true });
}

export async function PATCH({ request }) {
    const { action, name, goal } = await request.json();

    sql.connect(config);

    if (action === 'UPDATE_GOAL') {
        await sql.query`
            UPDATE Categories
            SET goal = ${goal}
            WHERE name = ${name}`;
    }        
    if (action === 'UPDATE_DEFAULT_GOAL') {
        await sql.query`
            UPDATE Categories
            SET defaultGoal = ${goal}
            WHERE name = ${name}`;
    }       

    return json({ success: true });
}