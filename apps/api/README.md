# SendMail API

This document outlines the API key system and public API endpoints available in the SendMail platform.

## API Key System

The API key system allows you to create and manage API keys for authenticating requests to the public API endpoints.

### Managing API Keys

#### Create an API Key

```
POST /api/keys
```

Request body:
```json
{
  "projectId": "your-project-id",
  "name": "My API Key",
  "expiresAt": "2025-12-31T23:59:59Z" // Optional
}
```

Response:
```json
{
  "message": "API key created successfully",
  "apiKey": {
    "id": "key-id",
    "name": "My API Key",
    "projectId": "your-project-id",
    "createdAt": "2025-03-26T14:57:14Z",
    "expiresAt": "2025-12-31T23:59:59Z"
  },
  "key": "sk_abc123..." // This is shown only once, save it securely
}
```

#### List API Keys

```
GET /api/keys/project/:projectId
```

Response:
```json
{
  "apiKeys": [
    {
      "id": "key-id",
      "name": "My API Key",
      "projectId": "your-project-id",
      "lastUsedAt": "2025-03-26T14:57:14Z",
      "expiresAt": "2025-12-31T23:59:59Z",
      "createdAt": "2025-03-26T14:57:14Z"
    }
  ]
}
```

#### Delete an API Key

```
DELETE /api/keys/:id
```

Request body:
```json
{
  "projectId": "your-project-id"
}
```

Response:
```json
{
  "message": "API key deleted successfully"
}
```

## Public API Endpoints

All public API endpoints are prefixed with `/v1` and require API key authentication.

### Authentication

To authenticate your requests, include your API key in one of the following ways:

1. **Authorization header**:
   ```
   Authorization: Bearer your-api-key
   ```

2. **Query parameter**:
   ```
   ?api_key=your-api-key
   ```

### Available Endpoints

#### Send an Email

```
POST /v1/email/send
```

Request body:
```json
{
  "from": "sender@example.com",
  "to": "recipient@example.com",
  "subject": "Hello from SendMail API",
  "body": "This is a test email sent via the SendMail API."
}
```

Response:
```json
{
  "success": true,
  "messageId": "message-id"
}
```

#### Get Contacts

```
GET /v1/contacts
```

Response:
```json
{
  "success": true,
  "contacts": [
    {
      "id": "contact-id",
      "email": "contact@example.com",
      "name": "John Doe",
      "status": "SUBSCRIBED",
      "createdAt": "2025-03-26T14:57:14Z"
    }
  ]
}
```

#### Create a Contact

```
POST /v1/contacts
```

Request body:
```json
{
  "email": "new-contact@example.com",
  "name": "Jane Doe",
  "metadata": {
    "company": "Example Inc.",
    "role": "Developer"
  }
}
```

Response:
```json
{
  "success": true,
  "contact": {
    "id": "contact-id",
    "email": "new-contact@example.com",
    "name": "Jane Doe",
    "status": "SUBSCRIBED",
    "metadata": {
      "company": "Example Inc.",
      "role": "Developer"
    },
    "createdAt": "2025-03-26T14:57:14Z"
  }
}
```

#### Get Campaigns

```
GET /v1/campaigns
```

Response:
```json
{
  "success": true,
  "campaigns": [
    {
      "id": "campaign-id",
      "name": "Welcome Campaign",
      "status": "COMPLETED",
      "createdAt": "2025-03-26T14:57:14Z"
    }
  ]
}
```

#### Get Campaign Details

```
GET /v1/campaigns/:id
```

Response:
```json
{
  "success": true,
  "campaign": {
    "id": "campaign-id",
    "name": "Welcome Campaign",
    "status": "COMPLETED",
    "contacts": [...],
    "emails": [...],
    "createdAt": "2025-03-26T14:57:14Z"
  }
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes and error messages in the following format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common status codes:
- `400`: Bad Request - Missing or invalid parameters
- `401`: Unauthorized - Invalid or missing API key
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Something went wrong on the server
