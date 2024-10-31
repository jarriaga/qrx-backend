export class Order {
    id: string;
    externalId: string;
    productId: string;
    variantId: string;
    quantity: number;
    status: string;
    printDetails: {
        front: string;
    };
    shippingAddress: any;
    paymentMethod: any;
}
