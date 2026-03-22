import sql from "mssql"

// create database configuration
export const config: sql.config = {
    user: "budgetUser",
    password: "budgetUser1229",
    server: "localhost",
    database: "WebBudgetizer",
    options: {
        trustServerCertificate: true
    },    
};

// function for querying the database with a given string query
export async function queryDatabase(query: string) {
  const pool = await sql.connect(config);
  const result = await pool.request().query(query);
  return result.recordset;
}

