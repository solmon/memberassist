# Contract: Health Events & RSVP

**Module**: `EventsModule` | Controller path: `/events`

All endpoints require 🔒 `JwtAuthGuard`.

---

## GET /events 🔒

Return upcoming health events for the authenticated member's tenant, ordered by `startAt`
ascending.

### Headers

```
Authorization: Bearer <accessToken>
X-Tenant-ID: <tenantId>
```

### Query Parameters DTO

```typescript
// event-query.dto.ts
import { IsOptional, IsEnum, IsDateString, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { EventCategory } from '@prisma/client';

export class EventQueryDto {
  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @IsOptional()
  @IsDateString()
  from?: string;                // ISO 8601, default: now

  @IsOptional()
  @IsDateString()
  to?: string;                  // ISO 8601, default: +90 days

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  myRsvpOnly?: boolean;         // show only events the member has RSVPed to

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
  offset?: number;
}
```

### Response `200 OK`

```json
{
  "total": 6,
  "items": [
    {
      "id": "uuid",
      "title": "Virtual Nutrition Workshop",
      "category": "NUTRITION",
      "location": null,
      "isVirtual": true,
      "startAt": "2025-12-10T18:00:00Z",
      "endAt": "2025-12-10T19:30:00Z",
      "capacity": 100,
      "rsvpCount": 42,
      "myRsvpStatus": null
    }
  ]
}
```

`myRsvpStatus` is `null | "ATTENDING" | "WAITLISTED" | "CANCELLED"` for the requesting member.

---

## GET /events/:eventId 🔒

Return full event detail including the requesting member's RSVP status.

### Response `200 OK`

```json
{
  "id": "uuid",
  "title": "Virtual Nutrition Workshop",
  "description": "Join our registered dietitian for a live cooking demonstration...",
  "category": "NUTRITION",
  "location": null,
  "isVirtual": true,
  "meetingUrl": "https://meet.example.com/workshop-dec10",
  "startAt": "2025-12-10T18:00:00Z",
  "endAt": "2025-12-10T19:30:00Z",
  "capacity": 100,
  "rsvpCount": 42,
  "myRsvpStatus": "ATTENDING",
  "myRsvpId": "uuid"
}
```

### Notes

- `meetingUrl` is only included in the response if `myRsvpStatus = "ATTENDING"` (not leaked
  to non-attendees).

---

## POST /events/:eventId/rsvp 🔒

Register the authenticated member for an event.

### Request Body DTO

```typescript
// No body required — eventId from URL, memberId from JWT
export class CreateRsvpDto {}
```

### Response `201 Created`

```json
{
  "rsvpId": "uuid",
  "eventId": "uuid",
  "status": "ATTENDING",
  "registeredAt": "2025-11-20T10:00:00Z"
}
```

If capacity is full:

```json
{
  "rsvpId": "uuid",
  "eventId": "uuid",
  "status": "WAITLISTED",
  "registeredAt": "2025-11-20T10:00:00Z"
}
```

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `409` | `ALREADY_REGISTERED` | Member already has a non-cancelled RSVP |
| `404` | `EVENT_NOT_FOUND` | Event not in tenant or `isActive = false` |

---

## DELETE /events/:eventId/rsvp 🔒

Cancel the authenticated member's RSVP for an event. Soft-cancels: sets `status = CANCELLED`
and `cancelledAt`. Does not delete the row.

### Response `204 No Content`

### Error Responses

| Status | Code | Trigger |
|---|---|---|
| `404` | `RSVP_NOT_FOUND` | No active RSVP for this member and event |
