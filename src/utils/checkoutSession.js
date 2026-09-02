const CHECKOUT_SESSION_KEY = "ticketonboarding.active-checkout.v1";

function isCheckoutSession(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      value.concertId &&
      value.checkoutKey &&
      value.reservationKey &&
      value.reservationData &&
      value.checkout?.merchantUid,
  );
}

export function saveCheckoutSession(value) {
  sessionStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify(value));
}

export function loadCheckoutSession() {
  const storedValue = sessionStorage.getItem(CHECKOUT_SESSION_KEY);
  if (!storedValue) return null;

  try {
    const value = JSON.parse(storedValue);
    if (isCheckoutSession(value)) return value;
  } catch {
    // Invalid or legacy data is discarded below.
  }

  clearCheckoutSession();
  return null;
}

export function clearCheckoutSession() {
  sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
}
