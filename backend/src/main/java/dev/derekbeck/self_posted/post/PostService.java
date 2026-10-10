package dev.derekbeck.self_posted.post;

import java.util.List;

import org.springframework.stereotype.Service;

import dev.derekbeck.self_posted.attachment.AttachmentRepository;
import jakarta.transaction.Transactional;

@Service 
public class PostService {
    
    private final PostRepository postRepository;

    private final AttachmentRepository attachmentRepository;

    public PostService(PostRepository postRepository, AttachmentRepository attachmentRepository) {
        this.postRepository = postRepository;
        this.attachmentRepository = attachmentRepository;
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

        return postRepository.save(existingPost);
    }

    @Transactional 
    public void deletePost(Long id) {
        Post existingPost = getPostById(id);
        attachmentRepository.deleteByPostPostId(id);
        postRepository.delete(existingPost);
    }
}
