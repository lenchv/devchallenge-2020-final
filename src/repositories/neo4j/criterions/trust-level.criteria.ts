import { Level } from '../../../valueObjects/level';
import { Criteria } from '../../criteria';

export class TrustLevelCriteria implements Criteria<string> {
    constructor(private minTrustLevel: Level) {}

    query(filter: string): string {
        return `r.level >= ${Number(this.minTrustLevel)}`;
    }
}
