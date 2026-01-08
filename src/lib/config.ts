import dbConnect from './db';
import { Config } from '@/models';

/**
 * Fetches a configuration value by key.
 */
export async function getConfig(key: string, defaultValue: any = null) {
  try {
    await dbConnect();
    const config = await Config.findOne({ key });
    return config ? config.value : defaultValue;
  } catch (error) {
    console.error(`[Config] Error fetching key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Specifically for email templates.
 */
export async function getEmailTemplates() {
  const defaultTemplates = {
    applicationReceived: 'Köszönjük az OAC jelentkezését! Hamarosan feldolgozzuk és értesítjük a döntésről.',
    applicationApproved: 'Gratulálunk! Az OAC jelentkezése jóváhagyva. A ligája aktiválva lett.',
    applicationRejected: 'Sajnálattal értesítjük, hogy az OAC jelentkezését elutasítottuk.',
    bankTransferInstructions: 'A regisztráció véglegesítéséhez kérjük utald át az éves tagsági díjat.',
    stripePaymentSuccess: 'Sikeres fizetés! Mellékelten küldjük az elektronikus számlát.',
    applicationRemoval: 'Az OAC jelentkezése törlésre került.'
  };

  const templates = await getConfig('oac_email_templates', defaultTemplates);
  return { ...defaultTemplates, ...templates };
}
