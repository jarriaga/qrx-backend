export class CreateOrderDto {
    qrContent: string;
    variantId: string;
    shippingAddress: {
        first_name: string;
        last_name: string;
        address1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone: string;
        email: string;
        shop_id: string;
    };
    paymentMethod: {
        type: string;
        details?: {
            number: string;
            expiry_month: number;
            expiry_year: number;
            cvc: string;
        };
    };
}
