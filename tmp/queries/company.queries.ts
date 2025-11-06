import type { Pool } from "pg";
import type {
  Company,
  PendingCompany,
  RejectedCompany,
  CompanyEdit,
  RejectedCompanyEdit,
  CompanyMember,
  CompanyFunds,
  CompanyTransaction,
  CompanyInterestLedger,
  CompanyBalanceHistory,
  CompanyImage,
  CompanyFullDetails,
  CompanyCreateParams,
  PendingCompanyCreateParams,
  CompanyEditCreateParams,
} from "@/types/models/company";
import logger from "@/logger";

export class CompanyQueries {
  constructor(private db: Pool) {}

  /**
   * Finds a company by ID
   */
  async findById(id: number): Promise<Company | null> {
    try {
      const result = await this.db.query<Company>(
        `SELECT * FROM companies WHERE id = $1 LIMIT 1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find company by ID:", error);
      throw error;
    }
  }

  /**
   * Finds a company by name
   */
  async findByName(name: string): Promise<Company | null> {
    try {
      const result = await this.db.query<Company>(
        `SELECT * FROM companies WHERE name = $1 LIMIT 1`,
        [name]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find company by name:", error);
      throw error;
    }
  }

  /**
   * Gets all companies
   */
  async getAll(): Promise<Company[]> {
    try {
      const result = await this.db.query<Company>(
        `SELECT * FROM companies ORDER BY created_at DESC`
      );

      return result.rows;
    } catch (error) {
      logger.error("Failed to get all companies:", error);
      throw error;
    }
  }

  /**
   * Gets companies founded by a specific user
   */
  async getByFounder(founderUuid: string): Promise<Company[]> {
    try {
      const result = await this.db.query<Company>(
        `SELECT * FROM companies
             WHERE founder_uuid = $1
             ORDER BY created_at DESC`,
        [founderUuid]
      );

      return result.rows;
    } catch (error) {
      logger.error("Failed to get companies by founder:", error);
      throw error;
    }
  }

  /**
   * Creates a new company
   */
  async create(params: CompanyCreateParams): Promise<Company> {
    try {
      const result = await this.db.query<Company>(
        `INSERT INTO companies (id, founder_uuid, name, description, short_description, footer)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
        [
          params.id,
          params.founder_uuid,
          params.name,
          params.description || null,
          params.short_description || null,
          params.footer || null,
        ]
      );

      logger.info(`Company created: ${params.name} (ID: ${params.id})`);
      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create company:", error);
      throw error;
    }
  }

  /**
   * Updates a company
   */
  async update(
    id: number,
    updates: Partial<Omit<Company, "id" | "created_at">>
  ): Promise<Company | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updates.name !== undefined) {
        fields.push(`name = $${paramCount++}`);
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.short_description !== undefined) {
        fields.push(`short_description = $${paramCount++}`);
        values.push(updates.short_description);
      }
      if (updates.footer !== undefined) {
        fields.push(`footer = $${paramCount++}`);
        values.push(updates.footer);
      }

      if (fields.length === 0) {
        return this.findById(id);
      }

      values.push(id);

      const result = await this.db.query<Company>(
        `UPDATE companies SET ${fields.join(
          ", "
        )} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update company:", error);
      throw error;
    }
  }

  /**
   * Deletes a company
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `DELETE FROM companies WHERE id = $1`,
        [id]
      );

      if ((result.rowCount ?? 0) > 0) {
        logger.info(`Company deleted: ID`, id);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete company:", error);
      throw error;
    }
  }

  /**
   * Checks if a company name already exists
   */
  async nameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      let query = `SELECT 1 FROM companies WHERE name = $1`;
      const params: any[] = [name];

      if (excludeId !== undefined) {
        query += ` AND id != $2`;
        params.push(excludeId);
      }

      query += ` LIMIT 1`;

      const result = await this.db.query(query, params);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Failed to check if company name exists:", error);
      throw error;
    }
  }

  /**
   * Gets all pending companies
   */
  async getAllPending(): Promise<PendingCompany[]> {
    try {
      const result = await this.db.query<PendingCompany>(
        `SELECT * FROM pending_companies WHERE status = 'pending' ORDER BY created_at ASC`
      );
      return result.rows;
    } catch (error) {
      logger.error("Failed to get all pending companies:", error);
      throw error;
    }
  }
  /**
   * Finds a pending company by ID
   */
  async findPendingById(id: number): Promise<PendingCompany | null> {
    try {
      const result = await this.db.query<PendingCompany>(
        `SELECT * FROM pending_companies WHERE id = $1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find pending company by ID:", error);
      throw error;
    }
  }

  /**
   * Creates a pending company submission
   */
  async createPending(
    params: PendingCompanyCreateParams
  ): Promise<PendingCompany> {
    try {
      const result = await this.db.query<PendingCompany>(
        `INSERT INTO pending_companies
             (id, founder_uuid, name, description, short_description, logo_url, banner_url, gallery_urls)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
        [
          params.id,
          params.founder_uuid,
          params.name,
          params.description || null,
          params.short_description || null,
          params.logo_url || null,
          params.banner_url || null,
          params.gallery_urls || null,
        ]
      );

      logger.info(`Pending company created: ${params.name} (ID: ${params.id})`);
      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create pending company:", error);
      throw error;
    }
  }

  /**
   * Updates pending company status
   */
  async updatePendingStatus(
    id: number,
    status: string,
    reviewedBy: string
  ): Promise<PendingCompany | null> {
    try {
      const result = await this.db.query<PendingCompany>(
        `UPDATE pending_companies
             SET status = $2, reviewed_at = NOW(), reviewed_by = $3
             WHERE id = $1
             RETURNING *`,
        [id, status, reviewedBy]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update pending company status:", error);
      throw error;
    }
  }

  /**
   * Deletes a pending company
   */
  async deletePending(id: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `DELETE FROM pending_companies WHERE id = $1`,
        [id]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Failed to delete pending company:", error);
      throw error;
    }
  }

  /**
   * Creates a rejected company entry
   */
  async createRejected(
    id: number,
    founderUuid: string,
    name: string,
    reason: string
  ): Promise<RejectedCompany> {
    try {
      const result = await this.db.query<RejectedCompany>(
        `INSERT INTO rejected_companies (id, founder_uuid, name, reason)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
        [id, founderUuid, name, reason]
      );

      logger.info(`Company rejected: ${name} (ID: ${id})`);
      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create rejected company:", error);
      throw error;
    }
  }

  /**
   * Gets all rejected companies for a user
   */
  async getRejectedByFounder(founderUuid: string): Promise<RejectedCompany[]> {
    try {
      const result = await this.db.query<RejectedCompany>(
        `SELECT * FROM rejected_companies
             WHERE founder_uuid = $1
             ORDER BY rejected_at DESC`,
        [founderUuid]
      );
      return result.rows;
    } catch (error) {
      logger.error("Failed to get rejected companies by founder:", error);
      throw error;
    }
  }

  /**
   * Gets all pending company edits
   */
  async getAllPendingEdits(): Promise<CompanyEdit[]> {
    try {
      const result = await this.db.query<CompanyEdit>(
        `SELECT * FROM company_edits WHERE status = 'pending' ORDER BY created_at ASC`
      );

      return result.rows;
    } catch (error) {
      logger.error("Failed to get all pending edits:", error);
      throw error;
    }
  }

  /**
   * Finds company edit by ID
   */
  async findEditById(id: number): Promise<CompanyEdit | null> {
    try {
      const result = await this.db.query<CompanyEdit>(
        `SELECT * FROM company_edits WHERE id = $1 LIMIT 1`,
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to find company edit by ID", error);
      throw error;
    }
  }

  /**
   * Creates a company edit submission
   */
  async createEdit(params: CompanyEditCreateParams): Promise<CompanyEdit> {
    try {
      const result = await this.db.query<CompanyEdit>(
        `INSERT INTO company_edits 
         (company_id, editor_uuid, name, description, short_description, logo_path, banner_path, gallery_paths)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          params.company_id,
          params.editor_uuid,
          params.name || null,
          params.description || null,
          params.short_description || null,
          params.logo_path || null,
          params.banner_path || null,
          params.gallery_paths || null,
        ]
      );

      logger.info(`Company edit created for company ID:`, params.company_id);
      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create company edit:", error);
      throw error;
    }
  }

  /**
   * Updates company edit status
   */
  async updateEditStatus(
    id: number,
    status: string,
    reviewedBy: string,
    reason?: string
  ): Promise<CompanyEdit | null> {
    try {
      const result = await this.db.query<CompanyEdit>(
        `UPDATE company_edits
             SET status = $2, reviewed_at = NOW(), reviewed_by = $3, reason = $4
             WHERE id = $1
             RETURNING *`,
        [id, status, reviewedBy, reason || null]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update company edit status:", error);
      throw error;
    }
  }

  /**
   * Gets all members of a company
   */
  async getMembers(id: number): Promise<CompanyMember[]> {
    try {
      const result = await this.db.query<CompanyMember>(
        `SELECT * FROM company_members WHERE company_id = $1 ORDER BY joined_at ASC`,
        [id]
      );

      return result.rows;
    } catch (error) {
      logger.error("Failed to get company members by ID", error);
      throw error;
    }
  }

  /**
   * Gets all companies a user is a member of
   */
  async getCompaniesByMember(userUuid: string): Promise<CompanyMember[]> {
    try {
      const result = await this.db.query<CompanyMember>(
        `SELECT * FROM company_members WHERE user_uuid = $1 ORDER BY joined_at DESC`,
        [userUuid]
      );

      return result.rows;
    } catch (error) {
      logger.error("Failed to get companies by member:", error);
      throw error;
    }
  }

  /**
   * Adds a member to a company
   */
  async addMember(
    userUuid: string,
    companyId: number,
    role: string = "Member"
  ): Promise<CompanyMember> {
    try {
      const result = await this.db.query<CompanyMember>(
        `INSERT INTO company_members (user_uuid, company_id, role)
             VALUES ($1, $2, $3)
             RETURNING *`,
        [userUuid, companyId, role]
      );

      logger.info(`Member added to company ${companyId}: ${userUuid}`);
      return result.rows[0];
    } catch (error) {
      logger.error("Failed to add company member:", error);
      throw error;
    }
  }

  /**
   * Updates a member's role
   */
  async updateMemberRole(
    userUuid: string,
    companyId: number,
    role: string
  ): Promise<CompanyMember | null> {
    try {
      const result = await this.db.query<CompanyMember>(
        `UPDATE company_members
             SET role = $1
             WHERE user_uuid = $1 AND company_id = $2
             RETURNING *`,
        [userUuid, companyId, role]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update member role:", error);
      throw error;
    }
  }

  /**
   * Removes a member from a company
   */
  async removeMember(userUuid: string, companyId: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `DELETE FROM company_members WHERE user_uuid = $1 AND company_id = $2`,
        [userUuid, companyId]
      );

      if ((result.rowCount ?? 0) > 0) {
        logger.info(`Member removed from company ${companyId}: ${userUuid}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to remove company member:", error);
      throw error;
    }
  }

  /**
   * Checks if a user is a member of a company
   */
  async isMember(userUuid: string, companyId: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `SELECT 1 FROM company_members WHERE user_uuid = $1 AND company_id = $2 LIMIT 1`,
        [userUuid, companyId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Failed to check if user is member:", error);
      throw error;
    }
  }

  /**
   * Gets company funds/balance
   */
  async getFunds(companyId: number): Promise<CompanyFunds | null> {
    try {
      const result = await this.db.query<CompanyFunds>(
        `SELECT * FROM company_funds WHERE company_id = $1 LIMIT 1`,
        [companyId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to get company funds:", error);
      throw error;
    }
  }

  /**
   * Initializes company funds (creates entry with 0 balance)
   */
  async initializeFunds(companyId: number): Promise<CompanyFunds> {
    try {
      const result = await this.db.query<CompanyFunds>(
        `INSERT INTO company_funds (company_id, balance)
             VALUES ($1, 0)
             ON CONFLICT (company_id) DO NOTHING
             RETURNING *`,
        [companyId]
      );

      return result.rows[0];
    } catch (error) {
      logger.error("Failed to initialize company funds:", error);
      throw error;
    }
  }

  /**
   * Updates company balance
   */
  async updateBalance(
    companyId: number,
    newBalance: string
  ): Promise<CompanyFunds | null> {
    try {
      const result = await this.db.query<CompanyFunds>(
        `UPDATE company_funds
             SET balance = $2
             WHERE company_id = $1
             RETURNING *`,
        [companyId, newBalance]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to update company balance:", error);
      throw error;
    }
  }

  /**
   * Adds to company balance
   */
  async addToBalance(
    companyId: number,
    amount: string
  ): Promise<CompanyFunds | null> {
    try {
      const result = await this.db.query<CompanyFunds>(
        `UPDATE company_funds
             SET balance = balance + $2
             WHERE company_id = $1
             RETURNING *`,
        [companyId, amount]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to add company balance:", error);
      throw error;
    }
  }

  /**
   * Substracts from company balance
   */
  async substractFromBalance(
    companyId: number,
    amount: string
  ): Promise<CompanyFunds | null> {
    try {
      const result = await this.db.query<CompanyFunds>(
        `UPDATE company_funds
             SET balance = balance - $2
             WHERE company_id = $1
             RETURNING *`,
        [companyId, amount]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error("Failed to substract from company balance:", error);
      throw error;
    }
  }

  /**
   * Gets all transactions for a company
   */
  async getTransactions(
    companyId: number,
    limit?: number
  ): Promise<CompanyTransaction[]> {
    try {
      let query = `SELECT * FROM company_transactions WHERE company_id = $1 ORDER BY created_at DESC`;
      const params: any[] = [companyId];

      if (limit) {
        query += ` LIMIT $2`;
        params.push(limit);
      }

      const result = await this.db.query<CompanyTransaction>(query, params);
      return result.rows;
    } catch (error) {
      logger.error("Failed to get company transactions:", error);
      throw error;
    }
  }

  /**
   * Creates a company transaction
   */
  async createTransaction(
    companyId: number,
    userUuid: string,
    type: string,
    amount: string
  ): Promise<CompanyTransaction> {
    try {
      const result = await this.db.query<CompanyTransaction>(
        `INSERT INTO company_transactions (company_id, user_uuid, type, amount)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
        [companyId, userUuid, type, amount]
      );

      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create company transaction:", error);
      throw error;
    }
  }

  /**
   * Gets all images for a company
   */
  async getImages(companyId: number, type?: string): Promise<CompanyImage[]> {
    try {
      let query = `SELECT * FROM company_images WHERE company_id = $1`;
      const params: any[] = [companyId];

      if (type) {
        query += ` AND type = $2`;
        params.push(type);
      }

      query += ` ORDER BY position ASC, uploaded_at DESC`;

      const result = await this.db.query<CompanyImage>(query, params);
      return result.rows;
    } catch (error) {
      logger.error("Failed to get company images:", error);
      throw error;
    }
  }

  /**
   * Adds an image to a company
   */
  async addImage(
    companyId: number,
    url: string,
    type: string = "gallery",
    position: number = 0
  ): Promise<CompanyImage> {
    try {
      const result = await this.db.query<CompanyImage>(
        `INSERT INTO company_images (company_id, url, type, position)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
        [companyId, url, type, position]
      );

      return result.rows[0];
    } catch (error) {
      logger.error("Failed to add company image:", error);
      throw error;
    }
  }

  /**
   * Deletes a company image
   */
  async deleteImage(imageId: number): Promise<boolean> {
    try {
      const result = await this.db.query(
        `DELETE FROM company_images WHERE id = $1`,
        [imageId]
      );

      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      logger.error("Failed to delete company image:", error);
      throw error;
    }
  }

  /**
   * Gets interest ledger entires for a company
   */
  async getInterestLedger(
    companyId: number,
    limit?: number
  ): Promise<CompanyInterestLedger[]> {
    try {
      let query = `SELET * FROM company_interest_ledger WHERE company_id = $1 ORDER BY created_at DESC`;
      const params: any[] = [companyId];

      if (limit) {
        query += ` LIMIT $2`;
        params.push(limit);
      }

      const result = await this.db.query<CompanyInterestLedger>(query, params);
      return result.rows;
    } catch (error) {
      logger.error(
        "Failed to get interest ledger entries for a company:",
        error
      );
      throw error;
    }
  }

  /**
   * Creates an interest ledger entry
   */
  async createInterestEntry(
    companyId: number,
    interestAmount: string,
    ratePerHour: string,
    balanceBefore: string,
    balanceAfter: string
  ): Promise<CompanyInterestLedger> {
    try {
      const result = await this.db.query<CompanyInterestLedger>(
        `INSERT INTO company_interest_ledger 
         (company_id, interest_amount, rate_per_hour, balance_before, balance_after)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [companyId, interestAmount, ratePerHour, balanceBefore, balanceAfter]
      );

      return result.rows[0];
    } catch (error) {
      logger.error("Failed to create interest ledger entry:", error);
      throw error;
    }
  }

  /**
   * Records a balance shapshot
   */
  async recordBalanceHistory(
    companyId: number,
    balance: string
  ): Promise<CompanyBalanceHistory> {
    try {
      const result = await this.db.query<CompanyBalanceHistory>(
        `INSERT INTO company_balance_history (company_id, balance)
         VALUES ($1, $2)
         RETURNING *`,
        [companyId, balance]
      );

      return result.rows[0];
    } catch (error) {
      logger.error("Failed to record company balance history:", error);
      throw error;
    }
  }

  /**
   * Gets balance history for a company
   */
  async getBalanceHistory(
    companyId: number,
    limit?: number
  ): Promise<CompanyBalanceHistory[]> {
    try {
      let query = `SELECT * FROM company_balance_history WHERE company_id = $1 ORDER BY recorded_at DESC`;
      const params: any[] = [companyId];

      if (limit) {
        query += ` LIMIT $2`;
        params.push(limit);
      }

      const result = await this.db.query<CompanyBalanceHistory>(query, params);
      return result.rows;
    } catch (error) {
      logger.error("Failed to get company balance history:", error);
      throw error;
    }
  }

  /**
   * Gets full company data with related data
   */
  async getFullDetails(companyId: number): Promise<CompanyFullDetails | null> {
    try {
      const [company, funds, members, images] = await Promise.all([
        this.findById(companyId),
        this.getFunds(companyId),
        this.getMembers(companyId),
        this.getImages(companyId),
      ]);

      if (!company) return null;

      return {
        ...company,
        balance: funds?.balance || "0",
        members,
        images,
      };
    } catch (error) {
      logger.error("Failed to get full company details:", error);
      throw error;
    }
  }

  /**
   * Gets company statistics
   */
  async getStats(companyId: number): Promise<{
    memberCount: number;
    transactionCount: number;
    totalInterestEarned: string;
  }> {
    try {
      const memberCountQuery = this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM company_members WHERE company_id = $1`,
        [companyId]
      );

      const transactionCountQuery = this.db.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM company_transactions WHERE company_id = $1`,
        [companyId]
      );

      const interestQuery = this.db.query<{ total: string }>(
        `SELECT COALESCE(SUM(interest_amount), 0) as total 
         FROM company_interest_ledger 
         WHERE company_id = $1`,
        [companyId]
      );

      const [memberResult, transactionResult, interestResult] =
        await Promise.all([
          memberCountQuery,
          transactionCountQuery,
          interestQuery,
        ]);

      return {
        memberCount: parseInt(memberResult.rows[0].count, 10),
        transactionCount: parseInt(transactionResult.rows[0].count, 10),
        totalInterestEarned: interestResult.rows[0].total || "0",
      };
    } catch (error) {
      logger.error("Failed to get company stats:", error);
      throw error;
    }
  }
}
