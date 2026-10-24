import { Attachment } from './attachment';
import { Category } from './category';

export interface Post {
    postId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    pinned: boolean;
    category: Category | null;
    attachments: Attachment[];
}