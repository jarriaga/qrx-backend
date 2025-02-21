export class Template {
    id: number; 
    shopId: number;
    name: string; 
    description?: string; 
    printFileUrl: string; 
    syncProductId: number;
    variants: {
        sync_variant_id: number;
        retail_price: string;
    }[];
    isPersonalized: boolean;
}