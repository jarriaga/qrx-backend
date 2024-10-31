export interface PrintifyProduct {
    id: string;
    title: string;
    description: string;
    variants: Array<{
        id: number;
        title: string;
        price: number;
    }>;
}

export interface PrintifyOrder {
    id: string;
    status: string;
    total: number;
    line_items: any[];
}
