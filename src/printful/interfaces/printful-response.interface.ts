export interface PrintfulProduct {
    id: number;
    name: string;
    description: string;
    variants: Array<{
        id: number;
        name: string;
        retail_price: string;
    }>;
}

export interface PrintfulOrder {
    id: number; 
    status: string;
    total: string; 
    items: Array<{
        sync_variant_id: number; 
        quantity: number;
        price: string;    }>;
}