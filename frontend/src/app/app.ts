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
}
