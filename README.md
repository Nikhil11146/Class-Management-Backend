# Class Management Tool Backend

## Overview

A production-oriented REST API for a **Class Management Tool** built with **Node.js**, **Express.js**, and **MongoDB**.

The backend provides functionality for:

* Authentication & Authorization
* Subject Management
* Period (Class) Management
* Attendance Tracking
* Announcements
* User Management

---

# Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Refresh Token Authentication

---

# Base URL

```
/api/v1
```

---

# Authentication

Most endpoints require a valid **JWT Access Token**.

Example Header:

```http
Authorization: Bearer <access_token>
```

---

# Database Models

---

## Group

Represents a class/section.

| Field        | Type            | Required | Unique | Description            |
| ------------ | --------------- | -------- | ------ | ---------------------- |
| _id          | ObjectId        | ✓        | -      | MongoDB ID             |
| year         | Number          | ✓        | -      | Academic Year          |
| dept         | String          | ✓        | -      | Department             |
| sec          | String          | ✓        | -      | Section                |
| moderatorId  | ObjectId (User) | ✓        | -      | Moderator of the class |
| studentCount | Number          | ✓        | -      | Total students         |

### Relationships

* One Group → Many Users
* One Group → Many Subjects
* One Group → Many Periods
* One Group → Many Announcements

---

## User

Represents a student, moderator or admin.

| Field    | Type             | Required | Unique | Notes                                   |
| -------- | ---------------- | -------- | ------ | --------------------------------------- |
| _id      | ObjectId         | ✓        | -      | MongoDB ID                              |
| name     | String           | ✓        | -      | Max Length: 25                          |
| email    | String           | ✓        | ✓      | Lowercase, Trimmed                      |
| password | String           | ✓        | -      | Hashed, `select:false`                  |
| groupId  | ObjectId (Group) | ✓        | -      | User's group                            |
| role     | String           | ✓        | -      | ROLE_ADMIN / ROLE_MODERATOR / ROLE_USER |

### Indexes

* email (unique)
* groupId + role

---

## Faculty

Represents a faculty member.

| Field | Type     | Required | Unique | Notes          |
| ----- | -------- | -------- | ------ | -------------- |
| _id   | ObjectId | ✓        | -      | MongoDB ID     |
| name  | String   | ✓        | -      | Max Length: 25 |
| dept  | String   | ✓        | -      | Department     |

---

## Subject

Represents an academic subject.

| Field     | Type               | Required | Unique | Notes            |
| --------- | ------------------ | -------- | ------ | ---------------- |
| _id       | ObjectId           | ✓        | -      | MongoDB ID       |
| name      | String             | ✓        | -      | Trimmed          |
| facultyId | ObjectId (Faculty) | Optional | -      | Assigned faculty |
| credits   | Number             | ✓        | -      | 1-6 Credits      |
| groupId   | ObjectId (Group)   | ✓        | -      | Owning class     |

### Indexes

Unique Compound Index

```
groupId + name
```

Meaning:

A class cannot contain two subjects with the same name.

---

## Period

Represents one conducted class.

| Field     | Type               | Required | Notes      |
| --------- | ------------------ | -------- | ---------- |
| _id       | ObjectId           | ✓        | MongoDB ID |
| subjectId | ObjectId (Subject) | ✓        | Subject    |
| groupId   | ObjectId (Group)   | ✓        | Group      |
| date      | Date               | ✓        | Class Date |
| startTime | Date               | ✓        | Start Time |
| endTime   | Date               | ✓        | End Time   |
| createdBy | ObjectId (User)    | ✓        | Creator    |

### Relationships

One Subject

↓

Many Periods

---

## AttendanceRecord

Represents attendance of one student in one period.

If no document exists, the student is considered absent.

| Field    | Type              | Required |
| -------- | ----------------- | -------- |
| _id      | ObjectId          | ✓        |
| periodId | ObjectId (Period) | ✓        |
| userId   | ObjectId (User)   | ✓        |

### Unique Index

```
periodId + userId
```

A student cannot mark attendance twice for the same period.

---

## Announcement

Represents announcements visible to a group.

| Field     | Type             | Required |
| --------- | ---------------- | -------- |
| _id       | ObjectId         | ✓        |
| groupId   | ObjectId (Group) | ✓        |
| message   | String           | ✓        |
| createdBy | ObjectId (User)  | ✓        |

---

# API Endpoints

---

# AUTH

---

## Register

```
POST /api/auth/register
```

### Authentication

Not Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

### Notes

*

---

## Login

```
POST /api/auth/login
```

### Authentication

Not Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

### Notes

*

---

## Logout

```
POST /api/auth/logout
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

## Refresh Token

```
POST /api/auth/refresh
```

### Authentication

Refresh Token Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

# SUBJECT

---

## Get Subject

```
GET /api/subjects/:subjectId
```

### Authentication

Required

### Parameters

```
subjectId
```

### Response

```json
{
}
```

---

## Get Subjects

```
GET /api/subjects
```

### Authentication

Required

### Query Parameters

```
(Optional)
```

### Response

```json
[
]
```

---

## Create Subject

```
POST /api/subjects
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

## Update Subject

```
PUT /api/subjects/:subjectId
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

## Delete Subject

```
DELETE /api/subjects/:subjectId
```

### Authentication

Required

### Response

```json
{
}
```

---

# PERIOD

---

## Get Period

```
GET /api/periods/:periodId
```

### Authentication

Required

### Response

```json
{
}
```

---

## Get Periods

```
GET /api/periods
```

### Authentication

Required

### Response

```json
[
]
```

---

## Get Subject Periods

```
GET /api/subjects/:subjectId/periods
```

### Authentication

Required

### Response

```json
[
]
```

---

## Create Period

```
POST /api/subjects/:subjectId/periods
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

## Update Period

```
PUT /api/periods/:periodId
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

## Delete Period

```
DELETE /api/periods/:periodId
```

### Authentication

Required

### Response

```json
{
}
```

---

# ATTENDANCE

---

## Get My Attendance

```
GET /api/attendance
```

### Authentication

Required

### Response

```json
[
]
```

---

## Get Subject Attendance

```
GET /api/subjects/:subjectId/attendance
```

### Authentication

Required

### Response

```json
[
]
```

---

## Get Period Attendance

```
GET /api/periods/:periodId/attendance
```

### Authentication

Required

### Response

```json
[
]
```

---

## Mark Attendance

```
POST /api/periods/:periodId/attendance
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

## Remove Attendance

```
DELETE /api/periods/:periodId/attendance/:userId
```

### Authentication

Required

### Response

```json
{
}
```

---

# ANNOUNCEMENTS

---

## Get Announcements

```
GET /api/announcements
```

### Authentication

Required

### Response

```json
[
]
```

---

## Create Announcement

```
POST /api/announcements
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

## Update Announcement

```
PUT /api/announcements/:announcementId
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

## Delete Announcement

```
DELETE /api/announcements/:announcementId
```

### Authentication

Required

### Response

```json
{
}
```

---

# USER

---

## Get Current User

```
GET /api/users/me
```

### Authentication

Required

### Response

```json
{
}
```

---

## Update Current User

```
PUT /api/users/me
```

### Authentication

Required

### Request Body

```json
{
}
```

### Response

```json
{
}
```

---

# Response Format

Success

```json
{
    "success": true,
    "message": "",
    "data": {}
}
```

Error

```json
{
    "success": false,
    "message": "",
    "errors": {}
}
```

---

# Authorization

Suggested access control:

| Role           | Permissions                                         |
| -------------- | --------------------------------------------------- |
| ROLE_ADMIN     | Full Access                                         |
| ROLE_MODERATOR | Manage Subjects, Periods, Attendance, Announcements |
| ROLE_USER      | View Data, Mark Attendance, Update Own Profile      |

---

# Version

Current API Version

```
v1
```
