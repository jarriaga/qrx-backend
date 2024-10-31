export class VariantOptionDto {
    name: string;
    value: string;
}

export class VariantDto {
    id: string;
    price: number;
    is_enabled?: boolean;
    sku?: string;
    options: VariantOptionDto[];
}
