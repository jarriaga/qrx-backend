export class Order {
    id: number;
    externalId?: string;
    recipient: {
        name: string;
        address1: string;
        address2?: string;
        city: string;
        state_code?: string;
        country_code: string;
        zip: string;
    };

    items: {
        sync_variant_id: number;
        quantity: number;
}[];

status: string; 
shipping: string;
created: string
updated: string;
}