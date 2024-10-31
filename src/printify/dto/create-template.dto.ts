import { VariantDto } from './variant.dto';

export class CreateTemplateDto {
    title: string;
    description: string;
    blueprintId: string;
    printProviderId: number;
    variants: VariantDto[];
    shopId: string;
}
