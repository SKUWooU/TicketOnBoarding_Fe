export class PaymentProviderUnavailableError extends Error {
  constructor() {
    super("실제 결제 제공자가 설정되지 않았습니다.");
    this.name = "PaymentProviderUnavailableError";
  }
}

export async function requestPayment() {
  throw new PaymentProviderUnavailableError();
}
