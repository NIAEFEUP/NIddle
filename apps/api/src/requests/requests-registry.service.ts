import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Requestable } from "./interfaces/requestable.interface";
import { RequestType } from "./entities/request.entity";
import { EventsService } from "@/events/events.service";
import { ServicesService } from "@/services/services.service";

@Injectable()
export class RequestRegistry {
    private readonly handlers = new Map<RequestType, Requestable>();

    constructor(
        private readonly eventsService: EventsService,
        private readonly servicesService: ServicesService,
    ) {
        this.handlers.set(RequestType.EVENT, eventsService);
        this.handlers.set(RequestType.SERVICE, servicesService);
    }

    get(type: RequestType): Requestable {
        const handler = this.handlers.get(type);

        if(!handler) {
            throw new InternalServerErrorException(`No handler registered for request type: ${type}`);
        }

        return handler;
    }
}