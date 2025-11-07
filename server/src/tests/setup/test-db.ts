import { Pool } from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class TestDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.TEST_DATABASE_URL,
      max: 5,
    });
  }

  async setup(): Promise<void> {
    const schemaPath = path.join(__dirname, "../../../../db/init.sql");
    const schemaSql = readFileSync(schemaPath, "utf-8");

    await this.pool.query(schemaSql);
  }

  async cleanup(): Promise<void> {
    await this.pool.query(`
      TRUNCATE 
        users,
        user_funds,
        admins,
        ai_message_log,
        applications
      CASCADE
    `);
  }

  async tearDown(): Promise<void> {
    await this.pool.query(`
      DROP TABLE IF EXISTS 
        users,
        user_funds,
        admins,
        ai_message_log,
        applications
      CASCADE
    `);

    await this.pool.query(`
      DROP EXTENSION IF EXISTS pg_trgm CASCADE;
      DROP EXTENSION IF EXISTS unaccent CASCADE;
    `);

    await this.pool.end();
  }

  getPool(): Pool {
    return this.pool;
  }

  async seedUsers(count: number = 3): Promise<void> {
    const values = Array.from({ length: count }, (_, i) => {
      const uuid = randomUUID();
      const name = `TestUser${i + 1}`;
      const discordId = `test_discord_${i + 1}_${Date.now()}`;
      const online = i % 2 === 0;
      const playTime = i * 3600;

      return `('${uuid}', '${name}', ${online}, now(), '${discordId}', ${playTime}, NULL, now())`;
    }).join(",");

    await this.pool.query(`
      INSERT INTO users (uuid, name, online, last_seen, discord_id, play_time_seconds, session_start, first_joined) 
      VALUES ${values}
    `);
  }

  async seedUser(data: {
    uuid?: string;
    name: string;
    online?: boolean;
    discord_id: string;
    play_time_seconds?: number;
    session_start?: Date | null;
  }): Promise<void> {
    const uuid = data.uuid || randomUUID();
    const online = data.online ?? false;
    const playTime = data.play_time_seconds ?? 0;

    await this.pool.query(
      `
      INSERT INTO users (uuid, name, online, discord_id, play_time_seconds, session_start)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        uuid,
        data.name,
        online,
        data.discord_id,
        playTime,
        data.session_start || null,
      ]
    );
  }

  async getUserCount(): Promise<number> {
    const result = await this.pool.query("SELECT COUNT(*) FROM users");
    return parseInt(result.rows[0].count);
  }

  async getAllUsers(): Promise<any[]> {
    const result = await this.pool.query(
      "SELECT * FROM users ORDER BY first_joined"
    );
    return result.rows;
  }
}
