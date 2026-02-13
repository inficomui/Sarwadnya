---
description: Notification Logic Implementation Plan
---
# Notification Logic Implementation

## Goal
Implement logic to display the count of unread notifications, decrement the count when marked as read, and show it properly in the UI.

## Changes Made

### 1. `components/dashboard/DashboardHeader.tsx`
- Added `useGetNotificationsQuery` to fetch the first 50 notifications.
- Calculated `unreadCount` by filtering notifications where `read_at` is null.
- Added a badge to the notification icon that displays the count (e.g., "1", "99+").
- Ensured the badge only appears when there are unread notifications.

### 2. Logic Verification
- Validated that `redux/apies/notificationApi.ts` provides the `Notifications` tag for `getNotifications` query.
- Validated that `markAsRead` mutation invalidates the `Notifications` tag.
- Confirmed that this invalidation will trigger a re-fetch in `DashboardHeader`, ensuring the badge count updates automatically when notifications are marked as read in `NotificationsScreen`.

## Files Modified
- `c:\sarwadnya\mobile\components\dashboard\DashboardHeader.tsx`

## Verification Steps
1. Open the app and observe the notification icon on the Home screen.
2. If there are unread notifications, a red badge with the count should appear.
3. Tap the notification icon to go to the Notifications screen.
4. Tap an unread notification to mark it as read.
5. Go back to the Home screen.
6. The badge count should be decremented or disappear if all are read.
