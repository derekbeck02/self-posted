import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpEventType } from '@angular/common/http'
import { PostService } from './post.service';
import { Post } from './post';
import {  forkJoin, tap } from 'rxjs';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})

export class App implements OnInit {
  private postService = inject(PostService);

  protected uploadProgress = signal(0);
  protected readonly title = signal('frontend');
  protected posts = signal<Post[]>([]);
  protected newPostContent = signal('');
  selectedFiles: File[] = [];

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts().subscribe(posts => {
      this.posts.set(posts);
    });
  }

  createPost() {
    const content = this.newPostContent().trim();
    
    if (!content) {
      return;
    }

    this.postService.createPost(content).subscribe(post => {
      if (this.selectedFiles.length > 0) {
        
        const totalBytes = this.selectedFiles.reduce(
          (total, file) => total + file.size,
          0
        );

        const uploadedBytes = new Map<File, number>();

        const uploadRequests = this.selectedFiles.map(file =>
          this.postService.uploadAttachment(post.postId, file).pipe(
            tap(event => {
              if (event.type === HttpEventType.UploadProgress) {
                uploadedBytes.set(file, event.loaded);

              const uploadedTotal = Array.from(uploadedBytes.values()).reduce((total, loaded) => total + loaded, 0);

              const percentage = Math.round(
                (uploadedTotal / totalBytes) * 100
              );

              this.uploadProgress.set(percentage);
              }
            })
          )
        );

        forkJoin(uploadRequests).subscribe(() => {
          this.uploadProgress.set(100);
          this.selectedFiles = [];
          this.newPostContent.set('');
          this.loadPosts();
        });

        return;
      }

      this.newPostContent.set('');
      this.loadPosts();
    });
  }

  deletePost(postId: number) {
    this.postService.deletePost(postId).subscribe(() => {
      this.loadPosts();
    });
  }

  editPost(post: Post) {
    const updatedContent = prompt('Edit your post:', post.content);

    if (updatedContent === null) {
      return;
    }

    const content = updatedContent.trim();

    if (!content) {
      return;
    }

    this.postService.updatePost(post.postId, content).subscribe(() => {
      this.loadPosts();
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFiles = Array.from(input.files);
    }
  }
}