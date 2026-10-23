import { AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild, computed } from '@angular/core';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http'
import { PostService } from './post.service';
import { Post } from './post';
import {  forkJoin, tap } from 'rxjs';
import { NormalAirplaneIconComponent } from './icons/branding/normal-airplane-icon/normal-airplane-icon';
import { DamagedAirplaneIconComponent } from './icons/branding/damaged-airplane-icon/damaged-airplane-icon';
import { FileTypeIcon } from './icons/file-type-icon/file-type-icon';
import { IconTrash, IconPencil, IconDownload, IconArrowNarrowUp, IconPaperclip, IconPlus, TablerIconComponent, IconSettings, IconX, IconPin, IconPinnedOff, IconFilter } from '@tabler/icons-angular';
import { PendingUpload } from './pending-upload';
import { PostFilters } from './post-filters';

type AppTheme = 'default' | 'rose' | 'blue';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [
    NormalAirplaneIconComponent,
    DamagedAirplaneIconComponent,
    FileTypeIcon,
    TablerIconComponent,
],
})

export class App implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  @ViewChild('postsContainer')
  postsContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('postsContent')
  postsContent!: ElementRef<HTMLDivElement>;

  @ViewChild('postTextarea')
  postTextarea!: ElementRef<HTMLTextAreaElement>;

  private postService = inject(PostService);
  private resizeObserver?: ResizeObserver;
  private stickToBottom = true;
  private settingsOpen = false;
  
  protected uploadError = signal('');
  protected posts = signal<Post[]>([]);
  protected newPostContent = signal('');
  protected searchQuery = signal('');
  protected pendingUploads = signal<PendingUpload[]>([]);
  protected confirmBeforeDelete = signal(true);
  protected confirmBeforeAttachmentDelete = signal(true);
  protected showImagePreviews = signal(true);
  protected roundedCorners = signal(true);
  protected editingPostId = signal<number | null>(null);
  protected editPostContent = signal('');
  protected filterMenuOpen = signal(false);
  protected postFilters = signal<PostFilters>({pinnedOnly: false, categoryId: null});

  protected generalSettingsCategoryString = 'general';
  protected themeSettingsCategoryString = 'theme';
  protected selectedSettingsCategory = this.generalSettingsCategoryString;
  
  protected readonly iconDownload = IconDownload;
  protected readonly iconPencil = IconPencil;
  protected readonly iconTrash = IconTrash;
  protected readonly iconArrowNarrowUp = IconArrowNarrowUp;
  protected readonly iconPaperClip = IconPaperclip;
  protected readonly iconPlus = IconPlus;
  protected readonly iconSettings = IconSettings;
  protected readonly iconX = IconX;
  protected readonly iconPin = IconPin;
  protected readonly iconPinnedOff = IconPinnedOff;
  protected readonly iconFilter = IconFilter;
  protected currentTheme: AppTheme = 'default';

  selectedFiles: File[] = [];

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') as AppTheme | null;
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }

    const savedConfirmBeforeDelete = localStorage.getItem('confirmBeforeDelete');
    if(savedConfirmBeforeDelete !== null) {
      this.confirmBeforeDelete.set(savedConfirmBeforeDelete === 'true');
    }

    const savedConfirmBeforeAttachmentDelete = localStorage.getItem('confirmBeforeAttachmentDelete');
    if(savedConfirmBeforeAttachmentDelete !== null) {
      this.confirmBeforeAttachmentDelete.set(savedConfirmBeforeAttachmentDelete === 'true');
    }

    const savedShowImagePreviews = localStorage.getItem('showImagePreviews');
    if(savedShowImagePreviews !== null) {
      this.showImagePreviews.set(savedShowImagePreviews === 'true');
    }

    const savedRoundedCorners = localStorage.getItem('roundedCorners');
    if(savedRoundedCorners !== null) {
      this.roundedCorners.set(savedRoundedCorners === 'true');
    }

    this.applyTheme(this.currentTheme);
    this.applyRoundedCorners();
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

  loadPosts(scrollToBottom = true) {
    this.postService.getPosts().subscribe(posts => {
      this.posts.set(posts);

      if (scrollToBottom) {
        this.scrollToBottom();
      }
    });
  }

  createPost() {
    const content = this.newPostContent().trim();
    
    if (!content && this.selectedFiles.length === 0) {
      return;
    }

    const files = [...this.selectedFiles];

    this.postService.createPost(content).subscribe(post => {
      this.posts.update(posts => [
        ...posts,
        post
      ]);

      this.newPostContent.set('');
      this.selectedFiles = [];
      this.uploadError.set('');
      this.resetTextarea();

      if(this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }

      if (files.length === 0) {
        return;
      }

      const uploads: PendingUpload[] = files.map(file => ({
        id: this.createId(),
        postId: post.postId,
        file,
        progress: 0
      }));

      this.pendingUploads.update(current => [
        ...current,
        ...uploads
      ]);

      const uploadRequests = uploads.map(upload =>
        this.postService
          .uploadAttachment(post.postId, upload.file)
          .pipe(
            tap(event => {
              if (
                event.type === HttpEventType.UploadProgress &&
                event.total
              ) {
                const percentage = Math.round(
                  (event.loaded / event.total) * 100
                );

                this.pendingUploads.update(current =>
                  current.map(item =>
                    item.id === upload.id
                      ? {
                          ...item,
                          progress: percentage
                        }
                      : item
                  )
                );
              }

              if (
                event.type === HttpEventType.Response &&
                event.body
              ) {
                const attachment = event.body;

                this.posts.update(posts =>
                  posts.map(existingPost =>
                    existingPost.postId === post.postId
                      ? {
                          ...existingPost,
                          attachments: [
                            attachment,
                            ...existingPost.attachments
                          ]
                        }
                      : existingPost
                  )
                );

                this.pendingUploads.update(current =>
                  current.filter(
                    item => item.id !== upload.id
                  )
                );
              }

            })
          )
      );

      forkJoin(uploadRequests).subscribe({
        error: (error: HttpErrorResponse) => {
          console.error(
            'Failed to upload attachment:',
            error
          );

          this.uploadError.set(
            'Upload failed. Please try again.'
          );
          
          const uploadIds = new Set(
            uploads.map(upload => upload.id)
          );

          this.pendingUploads.update(current =>
            current.filter(
              upload => !uploadIds.has(upload.id)
            )
          );
        }
      });

      });
    }

  deletePost(postId: number) {
    if (this.confirmBeforeDelete() === true && !confirm('Are you sure you want to delete this post?')) {
      return;
    }

    this.postService.deletePost(postId).subscribe(() => {
      this.posts.update(posts => 
        posts.filter(post => post.postId !== postId)
      );
    });
  }

  startEditingPost(post: Post): void {
    this.editingPostId.set(post.postId);
    this.editPostContent.set(post.content);
  }

  cancelEditingPost(): void {
    this.editingPostId.set(null);
    this.editPostContent.set('');
  }

  saveEditedPost(post: Post): void {
    const content = this.editPostContent().trim();

    if (!content && post.attachments.length === 0) {
      return;
    }

    this.postService
      .updatePost(post.postId, content)
      .subscribe(updatedPost  => {
        this.posts.update(posts =>
          posts.map(existingPost =>
            existingPost.postId === post.postId
              ? {
                  ...existingPost, 
                  ...updatedPost,
                }
              : existingPost
          )
        );

        this.cancelEditingPost();
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
    const filters = this.postFilters();

    let posts = [...this.posts()].sort(
      (a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? 1 : -1;
        }
        return (
          new Date(a.createdAt).getTime() - 
          new Date(b.createdAt).getTime()
        )

    });

    if (filters.pinnedOnly) {
      posts = posts.filter(post => post.pinned);
    }

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

  protected deleteAttachment(attachmentId: number): void {
    if (this.confirmBeforeAttachmentDelete() && !confirm('Are you sure you want to delete this attachment?')) {
      return;
    }
    this.postService.deleteAttachment(attachmentId).subscribe({
      next: () => {
        this.posts.update(posts =>
          posts.map(post => ({
            ...post,
            attachments: post.attachments.filter(
              attachment => attachment.attachmentId !== attachmentId
            )
          }))
        );
      },
      error: (error: HttpErrorResponse) => {
        console.error('Failed to delete attachment:', error);
      }
      });
  }

  onPostKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.createPost();
    }
  }

  autoResizeTextarea(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const maxHeight = 180;

    textarea.style.height = 'auto';
    
    if (textarea.scrollHeight > maxHeight) {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.height = `${textarea.scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    }
  }

  resetTextarea() {
    if (this.postTextarea) {
      this.postTextarea.nativeElement.style.height = '';
      this.postTextarea.nativeElement.style.overflowY = 'hidden';
    }
  }

  onExistingPostFilesSelected(event: Event, postId: number) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);

    const uploads: PendingUpload[] = files.map(file => ({
      id: this.createId(),
      postId,
      file,
      progress: 0
    }));

    this.pendingUploads.update(current => [
      ...current,
      ...uploads
    ]);

    const uploadRequests = uploads.map(upload =>
      this.postService.uploadAttachment(postId, upload.file).pipe(
        tap(event => {
          if (
            event.type === HttpEventType.UploadProgress &&
            event.total
          ) {
            const percentage = Math.round(
              (event.loaded / event.total) * 100
            );

            this.pendingUploads.update(current =>
              current.map(item =>
                item.id === upload.id
                  ? { ...item, progress: percentage }
                  : item
              )
            );
          }

          if (
            event.type === HttpEventType.Response &&
            event.body
          ) {
            const attachment = event.body;

            this.posts.update(posts =>
              posts.map(post =>
                post.postId === postId
                  ? {
                    ...post,
                    attachments: [
                    attachment,
                    ...post.attachments
                    ]
                  }
                  : post
              )
            );

            this.pendingUploads.update(current =>
              current.filter(
                item => item.id !== upload.id
              )
            );
          }
        })
      )
    )

    forkJoin(uploadRequests).subscribe({
    next: () => {
      input.value = '';
    },

    error: (error: HttpErrorResponse) => {
      console.error('Failed to add attachment:', error);
      const uploadIds = new Set(
        uploads.map(upload => upload.id)
      );

      this.pendingUploads.update(current =>
        current.filter(
          upload => !uploadIds.has(upload.id)
        )
      );
    }
  });
  }

  getPendingUploadsForPost(postId: number) {
    return this.pendingUploads().filter(
      upload => upload.postId === postId
    );
  }

  clearSelectedFiles(event: Event) {
    event.stopPropagation();
    this.selectedFiles = [];
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
  }

  toggleConfirmBeforeDelete(): void {
    this.confirmBeforeDelete.set(!this.confirmBeforeDelete());
    localStorage.setItem('confirmBeforeDelete', String(this.confirmBeforeDelete()));
  }

  toggleConfirmBeforeAttachmentDelete(): void {
    this.confirmBeforeAttachmentDelete.set(!this.confirmBeforeAttachmentDelete());
    localStorage.setItem('confirmBeforeAttachmentDelete', String(this.confirmBeforeAttachmentDelete()));
  }

  toggleShowImagePreviews(): void {
    this.showImagePreviews.set(!this.showImagePreviews());
    localStorage.setItem('showImagePreviews', String(this.showImagePreviews()));
  }

  toggleRoundedCorners(): void {
    this.roundedCorners.set(!this.roundedCorners());
    localStorage.setItem('roundedCorners', String(this.roundedCorners()));
    this.applyRoundedCorners();
  }

  changeSettingsCategory(selectedSettingsCategoryId: string): void {
    if (
      selectedSettingsCategoryId !== this.generalSettingsCategoryString &&
      selectedSettingsCategoryId !== this.themeSettingsCategoryString
    ) {
      console.warn(
        `Could not find settings category: ${selectedSettingsCategoryId}`
      );
      return;
    }

    this.selectedSettingsCategory = selectedSettingsCategoryId;
  }

  changeTheme(newTheme: AppTheme): void {
    this.currentTheme = newTheme;
    localStorage.setItem('theme', newTheme);
    this.applyTheme(newTheme);
  }

  private applyTheme(theme: AppTheme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  private applyRoundedCorners(): void {
    document.documentElement.setAttribute('data-rounded', String(this.roundedCorners()));
  }

  wasEdited(post: Post): boolean {
    return post.updatedAt !== post.createdAt;
  }

  togglePinned(post: Post): void {
    const pinned = !post.pinned;

    this.postService.updatePinned(post.postId, pinned).subscribe(updatePost => {
      this.posts.update(posts =>
        posts.map(existingPost =>
          existingPost.postId === post.postId
            ? {
              ...existingPost,
              ...updatePost
              }
            : existingPost
        )
      );

      requestAnimationFrame(() => {
        document.getElementById(`post-${post.postId}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      });
    });
  }

  togglePinnedFilter(): void {
    this.postFilters.update(filters => ({
      ...filters,
      pinnedOnly: !filters.pinnedOnly
    }));
  }

  protected activeFilterCount = computed(() => {
    const filters = this.postFilters();
    let count = 0;

    if (filters.pinnedOnly) {
      count++;
    }

    if (filters.categoryId !== null) {
      count ++;
    }

    return count;
  })
}