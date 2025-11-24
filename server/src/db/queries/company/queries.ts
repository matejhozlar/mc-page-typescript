import { Pool } from "pg";
import { BaseQueries } from "../base.queries";
import { Company, CompanyCreate, CompanyRow } from "./types";
import { CompanyBalanceQueries } from "./balance";
import { CompanyImageQueries } from "./image";
import { CompanyInterestQueries } from "./interest";
import { CompanyMemberQueries } from "./member";
import { CompanyTransactionQueries } from "./transaction";
import { CompanyEditQueries } from "./edit";
import { CompanyPendingQueries } from "./pending";
import { CompanyRejectedQueries } from "./rejected";

type Identifier = { id: number } | { name: string };

type Filters = {
  founderUuid: string;
  description: string;
  shortDescription: string;
  footer: string;
  createdAt: Date;
};

type Update = Filters & { name: string };

export class CompanyQueries extends BaseQueries<{
  Entity: Company;
  DbEntity: CompanyRow;
  Identifier: Identifier;
  Filters: Filters;
  Update: Update;
  Create: CompanyCreate;
}> {
  protected readonly table = "companies";

  private _balance?: CompanyBalanceQueries;

  private _image?: CompanyImageQueries;

  private _interest?: CompanyInterestQueries;

  private _member?: CompanyMemberQueries;

  private _transaction?: CompanyTransactionQueries;

  private _edit?: CompanyEditQueries;

  private _pending?: CompanyPendingQueries;

  private _rejected?: CompanyRejectedQueries;

  constructor(db: Pool) {
    super(db);
  }

  get balance(): CompanyBalanceQueries {
    if (!this._balance) {
      this._balance = new CompanyBalanceQueries(this.db);
    }
    return this._balance;
  }

  get image(): CompanyImageQueries {
    if (!this._image) {
      this._image = new CompanyImageQueries(this.db);
    }
    return this._image;
  }

  get interest(): CompanyInterestQueries {
    if (!this._interest) {
      this._interest = new CompanyInterestQueries(this.db);
    }
    return this._interest;
  }

  get member(): CompanyMemberQueries {
    if (!this._member) {
      this._member = new CompanyMemberQueries(this.db);
    }
    return this._member;
  }

  get transaction(): CompanyTransactionQueries {
    if (!this._transaction) {
      this._transaction = new CompanyTransactionQueries(this.db);
    }
    return this._transaction;
  }

  get edit(): CompanyEditQueries {
    if (!this._edit) {
      this._edit = new CompanyEditQueries(this.db);
    }
    return this._edit;
  }

  get pending(): CompanyPendingQueries {
    if (!this._pending) {
      this._pending = new CompanyPendingQueries(this.db);
    }
    return this._pending;
  }

  get rejected(): CompanyRejectedQueries {
    if (!this._rejected) {
      this._rejected = new CompanyRejectedQueries(this.db);
    }
    return this._rejected;
  }
}
