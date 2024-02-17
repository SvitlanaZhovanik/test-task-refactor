import { InternalFileType } from "../../modules/choose-plan-page/interactor";

export interface ApiFile {
  id: string;
  size: number;
  filename: string;
  created_at: Date;
  aws_url: string;
  internal_type: InternalFileType;
}

export interface ApiConvertedFile extends ApiFile {
  processing_status: "READY" | "FAILED";
}

export interface UserSubscription {
  isTrial: boolean;
  expiresAt: Date;
  price: number;
  trial_price: number;
  billingPeriod: BillingPeriod;
  cancelCode: string | null;
  currency: string;
  id: string;
}

export interface User {
  id: string;
  email: string | null;
  status: UserStatus;
  subscription: UserSubscription | null;
  ab_test: string[];
  hadSubscription: boolean;
}

export enum BillingPeriod {
  MONTHLY = "MONTHLY",
  ANNUAL = "ANNUAL",
}

export enum UserStatus {
  ANONYMOUS = "ANONYMOUS",
  REGISTERED = "REGISTERED",
  DELETED = "DELETED",
  BLACKLISTED = "BLACKLISTED",
}
