package dev.derekbeck.self_posted.post;

import java.util.List;

import org.springframework.stereotype.Service;

@Service 
public class PostService {
    
    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
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

    public void deletePost(Long id) {
        Post existingPost = getPostById(id);
        postRepository.delete(existingPost);
    }
}
