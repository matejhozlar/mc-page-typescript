import type { Pool } from "pg";
import type { Company, CompanyCreate } from "./company.types";
import { BaseQueries } from "../base.queries";

type CompanyIdentifier = { id: number } | { name: string };

type CompanyFilters =
  | { founderUuid: string }
  | { description: string }
  | { shortDescription: string }
  | { footer: string };

type CompanyUpdate =
  | { founderUuid: string }
  | { description: string }
  | { shortDescription: string }
  | { footer: string };

export class CompanyQueries extends BaseQueries<
  Company,
  CompanyIdentifier,
  CompanyFilters,
  CompanyUpdate,
  CompanyCreate
> {
  protected readonly table = "companies";

  constructor(db: Pool) {
    super(db);
  }
}
