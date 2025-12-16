import { SnacksService } from './snacks.service';
export declare class SnacksController {
    private readonly snacksService;
    constructor(snacksService: SnacksService);
    findAll(): Promise<any[]>;
    getAllWithMetrics(): Promise<any[]>;
    getTrending(): Promise<any[]>;
    search(query: string): Promise<any[]>;
    findOne(id: number): Promise<any>;
    getMetrics(id: number, days?: number): Promise<any[]>;
    getDetail(id: number): Promise<any>;
}
