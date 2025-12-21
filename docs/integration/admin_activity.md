# Admin Activity Feed Integration

The OAC Portal Admin Dashboard includes an "Activity Feed" widget that displays recent system events, such as user logins, new club applications, and configuration changes.

Currently, this feed uses mock data. To integrate with the real backend (tDarts platform), the OAC Portal expects the following API contract.

## API Endpoint

**GET** `/api/admin/activity`

### Request Headers
- `Authorization`: Bearer `[JWT_TOKEN]` (Standard Admin Authentication)

### Response Format

Success Response (200 OK):

```json
{
  "activities": [
    {
      "id": "uuid-string-1",
      "user": {
        "name": "Kiss János",
        "email": "janos@example.com",
        "image": "https://url-to-avatar.jpg" // optional
      },
      "action": "Új klub jelentkezést küldött be: Debreceni Darts Klub",
      "date": "2024-05-20T14:30:00Z", // ISO 8601 string
      "type": "info" // enum: 'success' | 'warning' | 'error' | 'info'
    },
    {
      "id": "uuid-string-2",
      "user": {
        "name": "Rendszer",
        "email": "system@oac.hu"
      },
      "action": "Sikertelen bejelentkezési kísérlet",
      "date": "2024-05-20T12:00:00Z",
      "type": "warning"
    }
  ]
}
```

### Data Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the activity log. |
| `user.name` | string | Display name of the user who performed the action. |
| `user.email` | string | Email address of the user. |
| `user.image` | string | (Optional) URL to the user's avatar. |
| `action` | string | Human-readable description of the event. |
| `date` | string | Timestamp of the event (ISO 8601 preferred). The frontend will format this relative to now (e.g., "2 hours ago"). |
| `type` | string | Severity level. Determines the color of the indicator dot.<br>- `info` (Blue): General updates<br>- `success` (Green): Create/Update actions<br>- `warning` (Yellow): Failed logins, high-risk actions<br>- `error` (Red): System errors, failures |

## Implementation Notes

- The frontend currently slices the list to show the most recent items.
- Pagination is not currently implemented in the widget, so returning the last ~20-50 events is sufficient.
