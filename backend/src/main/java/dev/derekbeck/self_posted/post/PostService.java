package dev.derekbeck.self_posted.post;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import dev.derekbeck.self_posted.attachment.AttachmentRepository;
import dev.derekbeck.self_posted.category.Category;
import dev.derekbeck.self_posted.category.CategoryService;
import jakarta.transaction.Transactional;

@Service 
public class PostService {
    
    private final PostRepository postRepository;

    private final AttachmentRepository attachmentRepository;

    private final CategoryService categoryService;

    public PostService(
        PostRepository postRepository,
        AttachmentRepository attachmentRepository,
        CategoryService categoryService
    ) {
        this.postRepository = postRepository;
        this.attachmentRepository = attachmentRepository;
        this.categoryService = categoryService;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id).orElseThrow(() -> new PostNotFoundException(id));
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public Post updatePost(Long id, Post updatedPost) {
        Post existingPost = getPostById(id);

        existingPost.setContent(updatedPost.getContent());
        existingPost.setUpdatedAt(LocalDateTime.now());

        return postRepository.save(existingPost);
    }

    public Post updatePinned(Long id, boolean pinned) {
        Post existingPost = getPostById(id);

        existingPost.setPinned(pinned);

        return postRepository.save(existingPost);
    }

    public Post updateCategory(Long postId, Long categoryId) {
        Post post = getPostById(postId);

        if (categoryId == null) {
            post.setCategory(null);
        } else {
            Category category = categoryService.getCategoryById(categoryId);
            post.setCategory(category);
        }

        return postRepository.save(post);
    }

    @Transactional 
    public void deletePost(Long id) {
        Post existingPost = getPostById(id);
        attachmentRepository.deleteByPostPostId(id);
        postRepository.delete(existingPost);
    }
}
