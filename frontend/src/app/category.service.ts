import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Category } from './category';

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private http = inject(HttpClient);

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>('/api/categories');
    }

    createCategory(name: string, color: string): Observable<Category> {
        return this.http.post<Category>(
            '/api/categories',
            { name, color }
        );
    }

    updateCategory(categoryId: number, name: string, color: string): Observable<Category> {
        return this.http.put<Category>(
            `/api/categories/${categoryId}`,
            { name, color }
        );
    }

    deleteCategory(categoryId: number): Observable<void> {
        return this.http.delete<void>(
            `/api/categories/${categoryId}`
        );
    }
}