import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PostService } from './post.service';
import { Post } from './post';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})

export class App implements OnInit {
  private postService = inject(PostService);

  protected readonly title = signal('frontend');
  protected posts = signal<Post[]>([]);
  protected newPostContent = signal('');
  selectedFile: File | null = null;

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

    this.postService.createPost(content).subscribe(() => {
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
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile);
    }
  }
}