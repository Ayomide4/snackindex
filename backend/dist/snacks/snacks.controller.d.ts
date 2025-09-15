import { SnacksService } from './snacks.service';
export declare class SnacksController {
    private readonly snacksService;
    constructor(snacksService: SnacksService);
    findAll(): Promise<any[]>;
}
