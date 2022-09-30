import { Injectable } from '@nestjs/common';
import { Person } from '../entities/Person';

@Injectable()
export class NotificationService {
    send(sender: Person, recipient: Person, message: string): Promise<void> {
        console.log(`From: ${sender.id}; To: ${recipient.id}; Message: ${message}`);

        return Promise.resolve();
    }
}
