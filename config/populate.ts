export const populateCompanyOpt = [
  {
    path: 'owner',
    select: 'firstName lastName image _id',
  },
  {
    path: 'employees',
    select: 'firstName lastName image role _id',
    options: { limit: 4 },
  },
  {
    path: 'accountant',
    select: 'firstName lastName email _id',
  },
  {
    path: 'products',
    select: 'name price _id',
    options: { limit: 4 },
  },
  {
    path: 'clients',
    select: 'firstName lastName phone _id',
    options: { limit: 4 },
  },
  {
    path: 'purchases',
    select: 'totalAmount status client _id',
    options: { limit: 4 },
    populate: [
      {
        path: 'client',
        select: 'firstName lastName _id',
      },
      {
        path: 'products',
        select: 'name price _id',
      },
    ],
  },
  {
    path: 'suppliers',
    select: 'firstName lastName phone email _id',
    options: { limit: 4 },
  },
  {
    path: 'expenses',
    select: 'totalAmount status date _id',
    options: { limit: 4 },
    populate: [
      {
        path: 'category',
        select: 'name _id',
      },
      {
        path: 'suppliers',
        select: 'firstName lastName _id',
      },
    ],
  },
  {
    path: 'categories',
    select: '_id name',
    options: { limit: 4 },
  },
];

export const populateClientOpt = [
  {
    path: 'purchases',
    select: 'date totalAmount status _id',
  },
  {
    path: 'createdBy',
    select: 'firstName lastName image _id',
  },
];

export const populateAccountantOpt = [
  {
    path: 'createdBy',
    select: 'firstName lastName image _id',
  },
];

export const populateProductOpt = [
  {
    path: 'purchases',
    select: 'date totalAmount status _id',
  },
  {
    path: 'createdBy',
    select: 'firstName lastName image _id',
  },
];

export const populatePurchaseOpt = [
  {
    path: 'client',
    select: 'firstName lastName _id',
  },
  {
    path: 'products',
    select: 'name price _id',
  },
  {
    path: 'createdBy',
    select: 'firstName lastName image _id',
  },
];

export const populateSupplierOpt = [
  {
    path: 'expenses',
    select: 'date totalAmount',
  },
  {
    path: 'createdBy',
    select: 'firstName lastName image _id',
  },
];

export const populateExpensesOpt = [
  {
    path: 'supplier',
    select: 'firstName lastName phone email _id',
  },
  {
    path: 'createdBy',
    select: 'firstName lastName image _id',
  },
];

export const populateCategoryOpt = [
  {
    path: 'expenses',
    select: 'totalAmount status _id',
  },
  {
    path: 'createdBy',
    select: 'firstName lastName image _id',
  },
];
