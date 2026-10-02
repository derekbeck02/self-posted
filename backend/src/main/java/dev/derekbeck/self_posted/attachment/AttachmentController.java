package dev.derekbeck.self_posted.attachment;

import dev.derekbeck.self_posted.post.Post;
import dev.derekbeck.self_posted.post.PostService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.io.IOException;

@RestController 
@RequestMapping("/api/attachments")
public class AttachmentController {
    
    private final AttachmentService attachmentService;
    private final PostService postService;

    public AttachmentController(AttachmentService attachmentService, PostService postService) {
        this.attachmentService = attachmentService;
        this.postService = postService;
    }

    @GetMapping
    public List<Attachment> getAllAttachments() {
        return attachmentService.getAllAttachments();
    }

    @GetMapping("/{id}")
    public Attachment getAttachmentById(@PathVariable Long id) {
        return attachmentService.getAttachmentById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/post/{postId}")
    public Attachment uploadAttachment(@PathVariable Long postId, @RequestParam("file") MultipartFile file) throws IOException {
        Post post = postService.getPostById(postId);
        return attachmentService.saveUploadedFile(file, post);
    }
}