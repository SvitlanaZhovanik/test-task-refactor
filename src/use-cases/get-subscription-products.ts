import React from "react";

export enum PaymentPlanId {
  MONTHLY = "pdf_master_monthly_49_99_in_all_countries_with_trial_0_99",
  MONTHLY_FULL = "pdf_master_monthly_with_trial_1_99",
  ANNUAL = "pdf_master_yearly_299_00_no_trial+UK_auth_settle",

  MONTHLY_THIRD_EMAIL = 'pdf_master_monthly_49_99_50%_discount_with_trial_free',
  MONTHLY_FULL_THIRD_EMAIL = 'pdf_master_monthly_49_99_50%_discount_with_trial_free_full',
  MONTHLY_SECOND_EMAIL = 'pdf_master_monthly_49_99_50%_discount_with_trial_0_99',
  MONTHLY_FULL_SECOND_EMAIL = 'pdf_master_monthly_49_99_50%_discount_with_trial_0_99_full',
}

type Price = {
  country: string | null
  currency: string
  price: number
  trial_price: number
}

export type Product = {
  id: string
  name: PaymentPlanId
  trial_payment_action: string | null
  price: Price
}

interface IGetSubscriptionProducts {
  products: Product[];
}

/**
 * @description Chooses right products (aka subscriptions) to display, depending on queries, ab-tests etc
 * 1. Wait for remote-config (object with ab-tests) to load
 * 2. Send request for all products to the backend
 * 3. Filter the products with names from paymentPlans
 * 3. Sort this productsToSort array in different arrays (usual products, second and third email, ab-test products etc)
 * 4. Return the right products depending on query (for remarketing email), ab-test etc
 */
export function useGetSubscriptionProducts(): IGetSubscriptionProducts {
  const products:Product[] = [{
    id: '7263778346846873jdbsbd4738749',
    name: PaymentPlanId.MONTHLY,
    trial_payment_action: null,
    price: {
      country: null,
      currency: 'USD',
      price: 4999,
      trial_price: 99
    }
  },
  {
    id: '7263778346846873jdbsb687r76877676587',
    name: PaymentPlanId.MONTHLY_FULL,
    trial_payment_action: null,
    price: {
      country: null,
      currency: 'USD',
      price: 4999,
      trial_price: 199
    }
  },
  {
    id: '7263778346846873jdbsb687r76877676587hgcvjhvhgv',
    name: PaymentPlanId.ANNUAL,
    trial_payment_action: 'auth_void',
    price: {
      country: null,
      currency: 'USD',
      price: 29900,
      trial_price: null
    }
  }];

  return { products };
}
