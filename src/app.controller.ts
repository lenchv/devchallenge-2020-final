import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { BroadcastMessage } from './dto/broadcast-message.dto';
import { CreatePersonDto } from './dto/create-person.dto';
import { MessageResponse } from './dto/message-response.dto';
import { TrustConnectionPairDto } from './dto/trust-connection-pair.dto';
import { PeopleService } from './services/people.service';

@Controller('api')
export class AppController {
    constructor(private readonly appService: AppService, private readonly peopleService: PeopleService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('/people')
    @HttpCode(201)
    async addPerson(@Body() personData: CreatePersonDto): Promise<CreatePersonDto> {
        const person = await this.peopleService.addPerson(personData);

        return CreatePersonDto.fromPerson(person);
    }

    @Post('/people/:id/trust_connections')
    @HttpCode(201)
    async addTrustConnections(@Param('id') personId: string, @Body() pairs: TrustConnectionPairDto): Promise<void> {
        await this.peopleService.addTrustConnections(personId, pairs);
    }

    @Post('/messages')
    @HttpCode(201)
    broadcastMessage(@Body() message: BroadcastMessage): Promise<MessageResponse> {
        return;
    }
}
