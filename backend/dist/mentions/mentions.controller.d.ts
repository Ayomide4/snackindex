import { MentionsService } from './mentions.service';
export declare class MentionsController {
    private readonly mentionsService;
    constructor(mentionsService: MentionsService);
    findAll(limit?: string): Promise<any[]>;
    findRecent(days?: string, limit?: string): Promise<any[]>;
    findBySnackId(id: string, limit?: string): Promise<any[]>;
    findBySource(source: string, limit?: string): Promise<any[]>;
}
