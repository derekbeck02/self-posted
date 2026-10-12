import { Service, inject } from '@angular/core';
import { HttpClient, HttpEvent} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from './post';
import { Attachment } from './attachment'

@Service()
export class PostService {
    private http = inject(HttpClient);
    private readonly apiUrl = '/api/posts';

    getPosts(): Observable<Post[]> {
        return this.http.get<Post[]>(this.apiUrl);
    }

    createPost(content: string): Observable<Post> {
        return this.http.post<Post>(this.apiUrl, { content });
    }

    deletePost(postId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${postId}`);
    }

    updatePost(postId: number, content: string): Observable<Post> {
        return this.http.put<Post>(`${this.apiUrl}/${postId}`, { content });
    }

    uploadAttachment(postId: number, file: File): Observable<HttpEvent<Attachment>> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<Attachment>(
            `/api/attachments/post/${postId}`,
            formData,
            {
                observe: 'events',
                reportProgress: true
            }
        );
    }
    
    deleteAttachment(id: number) {
        return this.http.delete<void>(`/api/attachments/${id}`)
    }
}
