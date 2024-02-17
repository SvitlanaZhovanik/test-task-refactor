import { AxiosClient } from '@/services/api/endpoints/axios-client'

export class PaymentEndpoint {
  private readonly httpClient = new AxiosClient()
  constructor() {
    this.httpClient.setLogContext('PaymentEndpoint')
  }

  async subscription(payload: CardPayloadType) {
    const request = await this.httpClient.post<CardSubscriptionResponse>(
      'payment/init/card/subscription',
      payload
    )
    return request.data
  }

  async subscriptionAlternative(payload: AlternativePayloadType) {
    const request = await this.httpClient.post<AlternativeSubscriptionResponse>(
      'payment/init/alt/subscription',
      payload
    )
    return request.data
  }
}

export type CardPayloadType = {
  productId: string
  trafficSource?: string
}

export interface CardSubscriptionResponse {
  id: string
  merchant: string
  signature: string
  paymentIntent: string
}

export type AlternativePayloadType = {
  customerEmail: string
  productId: string
  paymentMethod: string
  trafficSource?: string
}

export interface AlternativeSubscriptionResponse {
  customerId: string
  orderId: string
  amount: number
  currency: string
  status: string
  url: string
}
