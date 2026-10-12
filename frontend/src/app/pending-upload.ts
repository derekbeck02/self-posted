export interface PendingUpload {
    id: string;
    postId: number;
    file: File;
    progress: number;
}