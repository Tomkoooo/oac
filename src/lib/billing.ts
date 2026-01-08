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
    requestInvoiceDownload: true, // CRITICAL: Required to get PDF back in issueInvoice result
  });

  const seller = new szamlazz.Seller({
    // Seller details are usually pulled from the account associated with the agent key
    email: {
      replyToAddress: 'office@magyardarts.hu',
      subject: 'Számla - Magyar Darts Szövetség',
      message: 'Tisztelt Partnerünk! Mellékelten küldjük a számlát. Üdvözlettel: MDSZ',
    },
    issuerName: 'Magyar Darts Szövetség',
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
    paymentMethod: details.paymentMethod === 'stripe' ? 'Bankkártya' : 'Átutalás',
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
    console.log(`[Billing] Issuing invoice for ${details.name} (${details.email})...`);
    const result = await client.issueInvoice(invoice);
    console.log(`[Billing] Invoice issued: ${result.invoiceId}`);

    let pdfData = result.pdf;
    
    // Fallback: If PDF is not in the result even with requestInvoiceDownload: true
    if (!pdfData && result.invoiceId) {
      console.log(`[Billing] PDF not found in issuance result, attempting manual fetch for ${result.invoiceId}...`);
      try {
        const fetchResult = await client.getInvoiceData({
          invoiceId: result.invoiceId,
          pdf: true
        });
        pdfData = fetchResult.pdf;
        console.log(`[Billing] Manual PDF fetch result present: ${!!pdfData}`);
      } catch (fErr) {
        console.error(`[Billing] Manual PDF fetch failed:`, fErr);
      }
    }

    // Send custom email with PDF attachment
    console.log(`[Billing] Checking for invoice email. ID: ${result.invoiceId}, PDF Present: ${!!pdfData}`);
    if (result.invoiceId && pdfData) {
      try {
        const { sendEmail } = await import('./mailer');
        const pdfBuffer = await processPdfData(pdfData, result.invoiceId);
        
        if (pdfBuffer) {
           console.log(`[Billing] Sending custom invoice email to ${details.email}...`);
           const { getEmailTemplates } = await import('./config');
           const templates = await getEmailTemplates();
           const message = templates.stripePaymentSuccess;

           await sendEmail({
             to: details.email,
             subject: process.env.OAC_INVOICE_SUBJECT || 'tDarts OAC - Elektronikus számla',
             text: `Kedves ${details.name}!\n\n${message}\n\nÜdvözlettel,\ntDarts OAC Csapat`,
             html: `<p>Kedves <strong>${details.name}</strong>!</p><p>${message}</p><p>Üdvözlettel,<br>tDarts OAC Csapat</p>`,
             attachments: [
               {
                 filename: `szamla_${result.invoiceId}.pdf`,
                 content: pdfBuffer,
                 contentType: 'application/pdf'
               }
             ]
           });
           console.log('[Billing] Custom invoice email sent successfully.');
        }
      } catch (emailErr) {
        console.error('[Billing] Failed to send custom invoice email:', emailErr);
      }
    }

    return {
      invoiceId: result.invoiceId,
      pdf: result.pdf,
      xml: result.xml
    };
  } catch (error) {
    console.error('[Billing] Szamlazz.js Invoice Error:', error);
    throw error;
  }
};

/**
 * Retrieves the PDF of an existing invoice by its ID.
 */
export const getInvoicePdf = async (invoiceId: string) => {
  try {
    const agentKey = process.env.SZAMLAZZ_KEY || process.env.SZAMLAZZ_API_KEY;
    if (!agentKey) {
      throw new Error('SZAMLAZZ_KEY not set');
    }

    const client = new szamlazz.Client({
      authToken: agentKey,
    });

    const result = await client.getInvoiceData({
      invoiceId: invoiceId,
      pdf: true
    });

    return await processPdfData(result.pdf, invoiceId);
  } catch (err) {
    console.error('Error fetching Számlázz.hu invoice PDF:', err);
    throw err;
  }
};

/**
 * Internal helper to process raw PDF data from Számlázz.hu API
 */
export const processPdfData = async (pdfData: any, invoiceId: string): Promise<Buffer | null> => {
  try {
    if (!pdfData) {
      console.warn(`[Billing] No PDF data to process for invoice ${invoiceId}`);
      return null;
    }

    console.log(`[Billing] Processing PDF for ${invoiceId}. Raw type: ${typeof pdfData}, isArray: ${Array.isArray(pdfData)}`);
    
    let processedData = pdfData;

    // Handle the case where pdfData is an array
    if (Array.isArray(processedData) && processedData.length > 0) {
      processedData = processedData[0];
    }

    // Handle the case where pdfData is an object
    if (typeof processedData === 'object' && processedData !== null && !(processedData instanceof Uint8Array) && !Buffer.isBuffer(processedData)) {
      if (processedData._) {
          processedData = processedData._;
      } else if (processedData.content) {
          processedData = processedData.content;
      }
    }

    if (typeof processedData === 'string') {
      const preview = processedData.substring(0, 50);
      if (preview.startsWith('%PDF')) {
           processedData = Buffer.from(processedData, 'binary');
      } else {
          try {
              processedData = Buffer.from(processedData, 'base64');
          } catch (e) {
              console.error('[Billing] Failed to convert string to base64 buffer', e);
          }
      }
    }

    const buffer = Buffer.from(processedData as any);
    console.log(`[Billing] Processed PDF size: ${buffer.length} bytes for ${invoiceId}`);
    return buffer;
  } catch (err) {
    console.error('[Billing] Error in processPdfData:', err);
    return null;
  }
};
