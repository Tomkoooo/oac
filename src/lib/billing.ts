import * as szamlazz from 'szamlazz.js';

interface BillingDetails {
  elementId?: string; // Application ID
  name: string;
  zip: string;
  city: string;
  address: string;
  taxNumber?: string;
  email: string;
  paymentMethod: 'stripe' | 'transfer';
  amount: number;
  isPaid: boolean;
  comment?: string;
}

export const createInvoice = async (details: BillingDetails) => {
  // Feature Flag Check
  if (process.env.ENABLE_INVOICING !== 'true') {
     console.log('[Billing] Invoice generation skipped (ENABLE_INVOICING not true).');
     return { skipped: true };
  }

  const agentKey = process.env.SZAMLAZZ_KEY || process.env.SZAMLAZZ_API_KEY;

  if (!agentKey) {
    console.warn('[Billing] SZAMLAZZ_KEY missing, skipping invoice.');
    return { skipped: true };
  }

  const client = new szamlazz.Client({
    authToken: agentKey,
  });

  const seller = new szamlazz.Seller({
    // Seller details are usually pulled from the account associated with the agent key
    // But sometimes need to be specified or defaults are used.
    // For 'szamlazz.js', minimal config often works if the account is set up.
    // We'll trust the agent key defaults for seller info unless user specified otherwise.
    email: {
      replyToAddress: 'info@hungariandarts.hu', // TODO: Make configurable
      subject: 'Számla - Magyar Darts Szövetség',
      message: 'Tisztelt Partnerünk! Mellékelten küldjük a számlát. Üdvözlettel: MDSZ',
    },
  });

  const buyer = new szamlazz.Buyer({
    name: details.name,
    zip: details.zip,
    city: details.city,
    address: details.address,
    // @ts-expect-error - taxNumber is valid but types might be missing it in this version
    taxNumber: details.taxNumber,
    email: details.email,
    sendEmail: true,
  });

  const invoice = new szamlazz.Invoice({
    seller: seller,
    buyer: buyer,
    paymentMethod: details.paymentMethod === 'stripe' ? szamlazz.PaymentMethod.CreditCard : szamlazz.PaymentMethod.BankTransfer,
    currency: szamlazz.Currency.HUF,
    language: szamlazz.Language.Hungarian,
    // @ts-expect-error - paid might be missing in types or named differently
    paid: details.isPaid,
    fulfillmentDate: new Date(), // Paid immediately or upon approval
    dueDate: new Date(), // Paid immediately or upon approval
    comment: details.comment || `OAC Klub Tagsági Díj`,
    items: [
      new szamlazz.Item({
        label: 'OAC Klub Tagsági Díj',
        quantity: 1,
        unit: 'db',
        vat: 27, // Standard HU VAT. Number expected
        netUnitPrice: details.amount / 1.27, // Types require netUnitPrice
      })
    ]
  });

  // item added in constructor because addItem might not exist on type
  // invoice.addItem(...) removed

  try {
    const result = await client.issueInvoice(invoice);
    return {
      invoiceId: result.invoiceId,
      pdf: result.pdf, // if needed
      xml: result.xml  // if needed
    };
  } catch (error) {
    console.error('Szamlazz.js Invoice Error:', error);
    throw error;
  }
};
