import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Relation {
    @Prop()
    id: string;

    @Prop()
    trustLevel: number;
}

@Schema()
export class Person {
    @Prop({ unique: true })
    id: string;

    @Prop({ index: true })
    topics: string[];

    @Prop([Relation])
    pairs: Relation[];
}

export type PersonDocument = Person & Document;

export const PersonSchema = SchemaFactory.createForClass(Person);
