package dev.derekbeck.self_posted.attachment;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import dev.derekbeck.self_posted.post.Post;

@Service 
public class AttachmentService {   

    private final AttachmentRepository attachmentRepository;

    private final Path uploadDirectory = Paths.get("uploads");

    public AttachmentService(AttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
    }

    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }

    public Attachment getAttachmentById(Long id) {
        return attachmentRepository.findById(id).orElseThrow(() -> new AttachmentNotFoundException(id)
        );
    }

    public Attachment saveAttachment(Attachment attachment) {
        return attachmentRepository.save(attachment);
    }

    public void deleteAttachment(Long id) {
        Attachment attachment = getAttachmentById(id);
        attachmentRepository.delete(attachment);
    }

    public Attachment saveUploadedFile(MultipartFile file, Post post) throws IOException {
        Files.createDirectories(uploadDirectory);

        String originalFilename = file.getOriginalFilename();
        String storedFilename = UUID.randomUUID() + "-" + originalFilename;

        Path filePath = uploadDirectory.resolve(storedFilename);

        Files.copy(file.getInputStream(), filePath);

        Attachment attachment = new Attachment();
        attachment.setOriginalFilename(originalFilename);
        attachment.setStoredFilename(storedFilename);
        attachment.setMimeType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setFilePath(filePath.toString());
        attachment.setPost(post);

        return attachmentRepository.save(attachment);
    }

    public Resource loadAttachmentFile(Attachment attachment) throws IOException {
        Path filePath = Paths.get(attachment.getFilePath());

        return new UrlResource(filePath.toUri());
    }
}