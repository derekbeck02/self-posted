import { Attachment } from './attachment';

export interface Post {
    postId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    attachments: Attachment[];
}