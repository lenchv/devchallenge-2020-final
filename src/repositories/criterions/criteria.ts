export interface Criteria<T> {
    query(entities: T[]): T[];
}
