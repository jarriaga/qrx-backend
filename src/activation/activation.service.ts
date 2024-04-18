import { Injectable } from '@nestjs/common';

@Injectable()
export class ActivationService {

    async validateActivationCode(activationCode: string, tshirtId: string) {
        return `Activation code ${activationCode} is valid for tshirt ${tshirtId}`;
    }

}
