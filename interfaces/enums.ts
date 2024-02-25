export enum Roles {
  OWNER = 'owner',
  SENIOR_EMPLOY = 'senior_employ',
  EMPLOY = 'employ',
  UNCATEGORIZED = 'uncategorized',
}

export enum DefaultImage {
  PROFILE_IMAGE = 'https://i.imgur.com/KrDUZ06.png',
  LOGO = 'https://i.imgur.com/WPgl8tQ.png',
  EXPENSE_IMAGE = 'https://i.imgur.com/zhLkqWv.png',
}

export enum PaymentMethod {
  CREDIT_CARD = 'Credit card',
  PAYPAL = 'Paypal',
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank transfer',
  OTHER = 'Other',
}

export enum PurchaseExpenseStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

export enum EmailSubjects {
  EXPENSE = 'Δαπάνη',
  PURCHASE = 'Αγορά',
}
