# Moozup Admin Panel API Endpoints List

This document lists the API endpoints used by the Moozup Admin Panel (React/Vite).

## 1. Authentication (`/api/auth`)
- `POST /auth/login` - Admin login (email/password)
- `POST /auth/refresh-token` - Refresh admin authentication token

## 2. Dashboard (`/api/dashboard`)
- `GET /dashboard/stats` - Fetch overall statistics for the admin dashboard (Total users, events, communities, etc.)

## 3. Event Management (`/api/events`)
- `GET /events/getEvent` - List all events
- `GET /events/event/details/:id` - Fetch detailed information for a specific event
- `POST /events/createEvent` - Create a new event (Multipart/Form-data for media)

## 4. Directory & People (`/api/directory`)
- `GET /directory/allPeople` - List all users/members in the directory
- `GET /directory/people/event/:eventId` - List users associated with a specific event
- `POST /directory/people` - Create a new directory user/member (Multipart/Form-data)
- `PATCH /directory/people/status/:userId` - Update user status (Active/Inactive)
- `GET /directory/get-all-participation` - Fetch all participation types

## 5. Community Management (`/api/admin/communities`)
- `GET /admin/communities` - List all communities
- `POST /admin/communities` - Create a new community
- `PUT /admin/communities/:id` - Update community details
- `DELETE /admin/communities/:id` - Delete a community
