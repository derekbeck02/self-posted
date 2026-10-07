import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild, computed } from '@angular/core';
import { HttpEventType } from '@angular/common/http'
import { PostService } from './post.service';
import { Post } from './post';
import {  forkJoin, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})

export class App implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('postsContainer')
  postsContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('postsContent')
  postsContent!: ElementRef<HTMLDivElement>;

  private postService = inject(PostService);
  private resizeObserver?: ResizeObserver;
  private stickToBottom = true;

  protected uploadProgress = signal(0);
  protected uploadError = signal('');
  protected posts = signal<Post[]>([]);
  protected newPostContent = signal('');
  protected searchQuery = signal('');
  selectedFiles: File[] = [];

  ngOnInit() {
    this.loadPosts();
  }

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.stickToBottom) {
        requestAnimationFrame(() => this.scrollToBottom());
      }
    });

    this.resizeObserver.observe(this.postsContent.nativeElement);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  loadPosts() {
    this.postService.getPosts().subscribe(posts => {
      this.posts.set(posts);
      this.scrollToBottom();
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

  protected filteredPosts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    let posts = [...this.posts()].sort(
      (a, b) => 
        new Date(a.createdAt).getTime() - 
        new Date(b.createdAt).getTime()
    );

    if (query) {
      posts = posts.filter(post =>
        post.content.toLowerCase().includes(query) ||
        post.attachments.some(attachment =>
          attachment.originalFilename.toLowerCase().includes(query)
        )
      );
    }
    return posts;
  });

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

  formatDate(date: string) {
    const parsedDate = new Date(date);

    const datePart = parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const timePart = parsedDate.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit'
    });

    return `${datePart} • ${timePart}`;
  }

  scrollToBottom() {
    const container = this.postsContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }

  onPostsScroll() {
    const container = this.postsContainer.nativeElement;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;

    this.stickToBottom = distanceFromBottom < 50;
  }
}