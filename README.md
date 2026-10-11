# Self-Posted

Self-Posted is a self-hosted web app for sending notes and files between your own devices.

It provides a simple personal feed where posts can contain text, images, and other attachments.

> This project is still under active development.

## Features

- Text and file posts
- Multiple attachments per post
- Image previews
- File type icons
- Attachment downloads
- Post editing and deletion
- Soft-deleted attachments with files retained on disk
- Search across post text and attachment filenames
- Upload progress
- Auto-growing post composer
- Ctrl+Enter / Cmd+Enter to post
- Responsive dark UI
- Docker Compose deployment

## Tech Stack

- Angular
- TypeScript
- Java 21
- Spring Boot
- PostgreSQL
- Docker
- Docker Compose

## Getting Started

### Requirements

- Docker
- Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/derekbeck02/self-posted.git
cd self-posted
```

### 2. Create the environment file

Linux/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then set a password in `.env`:

```env
POSTGRES_PASSWORD=your-password-here
```

### 3. Start the application

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:4200
```

Backend:

```text
http://localhost:8085
```

## Storage

Post and attachment metadata is stored in PostgreSQL.

Uploaded files are stored in:

```text
uploads/
```

The uploads directory is ignored by Git.

Deleting an attachment hides it from the app but currently keeps the physical file on disk.

## Security

Self-Posted does not currently include authentication.

Do not expose it directly to the public internet without adding appropriate access controls.

## License

MIT License. See [LICENSE](LICENSE).
