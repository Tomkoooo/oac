declare module "szamlazz.js" {
    export class Seller {
        constructor(config: {
            email?: {
                replyToAddress?: string;
                subject?: string;
                message?: string;
            };
            issuerName?: string;
        });
    }

    export class Client {
        constructor(config: {
            authToken: string;
            eInvoice?: boolean;
            requestInvoiceDownload?: boolean;
        });
        issueInvoice(invoice: Invoice): Promise<any>;
        getInvoiceData(params: {
            invoiceId: string;
            orderNumber?: string;
            pdf?: boolean;
        }): Promise<any>;
    }

    export class Buyer {
        constructor(config: {
            name: string;
            address: string;
            zip: string;
            city: string;
        });
    }

    export class Item {
        constructor(config: {
            label: string;
            quantity: number;
            unit: string;
            vat: number;
            netUnitPrice: number;
        });
    }

    export class Invoice {
        constructor(config: {
            paymentMethod: string;
            currency: string;
            language: string;
            seller: Seller | Promise<Seller>;
            buyer: Buyer;
            items: Item[];
            noNavReport?: boolean;
            eInvoice?: boolean;
            dueDate?: Date;
        });
    }

    export const Currency: {
        Ft: string;
        [key: string]: string;
    };

    export const Language: {
        Hungarian: string;
        [key: string]: string;
    };

    export const PaymentMethod: {
        BankTransfer: string;
        [key: string]: string;
    };
}