# Contract: Communications Inbox

**Module**: `CommunicationsModule` | Controller path: `/communications`

All endpoints require 🔒 `JwtAuthGuard`.

---

## GET /communications/messages 🔒

Return paginated messages for the authenticated member. Results include both broker notices
and district alerts. `channel` filter allows segment separation (used by the two-tab inbox UI).

### Headers

```
Authorization: Bearer <accessToken>
X-Tenant-ID: <tenantId>
```

### Query Parameters DTO

```typescript
// message-query.dto.ts
import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageChannel } from '@prisma/client';

export class MessageQueryDto {
  @IsOptional()
  @IsEnum(MessageChannel)
  channel?: MessageChannel;     // BROKER_NOTICE | DISTRICT_ALERT

  @IsOptional()
  @Type(() => Boolean)
  unreadOnly?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number;               // default 20

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number;              // default 0
}
```

### Response `200 OK`

```json
{
  "total": 12,
  "unreadBrokerCount": 3,
  "unreadDistrictCount": 1,
  "items": [
    {
      "id": "uuid",
      "channel": "BROKER_NOTICE",
      "subject": "Open Enrollment: Action Required by Dec 31",
      "sentAt": "2025-11-01T09:00:00Z",
      "readAt": null,
      "isUnread": true
    }
  ]
}
```

---

## GET /communications/messages/:messageId 🔒

Return a single message's full body. Marks the message as read if `readAt` is null.

### Response `200 OK`

```json
{
  "id": "uuid",
  "channel": "BROKER_NOTICE",
  "subject": "Open Enrollment: Action Required by Dec 31",
  "body": "Dear Jane, your open enrollment window opens...",
  "sentAt": "2025-11-01T09:00:00Z",
  "readAt": "2025-11-02T14:30:00Z"
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `403` | `ACCESS_DENIED` | Message is not addressed to this member |
| `404` | `MESSAGE_NOT_FOUND` | No message with that ID in the tenant |

---

## PATCH /communications/messages/:messageId/read 🔒

Explicitly mark a message as read (idempotent — safe to call if already read).

### Response `204 No Content`

---

## GET /communications/unread-counts 🔒

Return unread counts per channel — used by the inbox tab badge.

### Response `200 OK`

```json
{
  "brokerNotices": 3,
  "districtAlerts": 1
}
```
