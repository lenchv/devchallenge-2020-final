import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { PeopleService } from './services/people.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly peopleService: PeopleService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/people')
  @HttpCode(201)
  async addPerson(
    @Body() personData: CreatePersonDto,
  ): Promise<CreatePersonDto> {
    const person = await this.peopleService.addPerson(personData);

    return CreatePersonDto.fromPerson(person);
  }
}
