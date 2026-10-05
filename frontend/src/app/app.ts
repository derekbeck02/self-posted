import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
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
  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  private postService = inject(PostService);

  protected uploadProgress = signal(0);
  protected uploadError = signal('');
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
    
    if (!content && this.selectedFiles.length === 0) {
      return;
    }

    this.postService.createPost(content).subscribe(post => {
      if (this.selectedFiles.length > 0) {
        this.uploadError.set('');
        this.uploadProgress.set(0);
        
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

        forkJoin(uploadRequests).subscribe({
          next: () => {
            this.uploadProgress.set(0);
            this.uploadError.set('');
            this.selectedFiles = [];
            this.newPostContent.set('');
            
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }

            this.loadPosts();
          },
          error: () => {
            this.uploadError.set('Upload failed. Please try again.');
            this.uploadProgress.set(0);
          }
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

    if (!content && post.attachments.length === 0) {
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

  formatBytes(bytes: number) {
    if (bytes < (2 ** 10)) return `${bytes.toFixed(2)} B`;
    else if ((bytes >= (2 ** 10)) && (bytes < (2 ** 20))) {
      const kilobytes = bytes / (2 ** 10);
      return `${kilobytes.toFixed(2)} KB`;
    }
    else if ((bytes >= (2 ** 20)) && (bytes < (2 ** 30))) {
      const megabytes = bytes / (2 ** 20);
      return `${megabytes.toFixed(2)} MB`;
    }
    else if ((bytes >= (2 ** 30)) && (bytes < (2 ** 40))) {
      const gigabytes = bytes / (2 ** 30);
      return `${gigabytes.toFixed(2)} GB`;
    }
    else if ((bytes >= (2 ** 40)) && (bytes < (2 ** 50))) {
      const terabytes = bytes / (2 ** 40);
      return `${terabytes.toFixed(2)} TB`;
    }
    else if ((bytes >= (2 ** 50)) && (bytes < (2 ** 60))) {
      const petabytes = bytes / (2 ** 50);
      return `${petabytes.toFixed(2)} PB`;
    }
    else if ((bytes >= (2 ** 60)) && (bytes < (2 ** 70))) {
      const exabytes = bytes / (2 ** 60);
      return `${exabytes.toFixed(2)} EB`;
    }
    else if ((bytes >= (2 ** 70)) && (bytes < (2 ** 80))) {
      const zettabytes = bytes / (2 ** 70);
      return `${zettabytes.toFixed(2)} ZB`;
    }
    else if ((bytes >= (2 ** 80)) && (bytes < (2 ** 90))) {
      const yottabytes = bytes / (2 ** 80);
      return `${yottabytes.toFixed(2)} YB`;
    }
    else {
      return '0 B';
    }
  }
}