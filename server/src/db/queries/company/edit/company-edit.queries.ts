import type { CompanyEdit } from "./company-edit.types";

type CompanyEditIdentifier = { id: string };

type CompanyEditFilters =
  | { companyId: number }
  | { editorUuid: string }
  | { name: string }
  | { description: string }
  | { shortDescription: string }
  | { logoPath: string }
  | { bannerPath: string }
  | { galleryPaths: string[] }
  | { status: string }
  | { createdAt: Date }
  | { reviewedAt: Date };

type CompanyEditUpdate = CompanyEditFilters;
