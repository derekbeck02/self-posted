import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from './post';

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
}
