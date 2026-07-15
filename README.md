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
* JWT Authentication

---

# Base URL

```
https://class-management-backend-53hu.onrender.com/
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
| rollNo   | Number           | ✓        | ✓      | Requied and Unique                      |
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

# API Overview

The API follows REST principles and is organized into feature-based resources.

---

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user account. |
| POST | `/api/v1/auth/login` | Authenticate a user and issue access/refresh tokens. |
| POST | `/api/v1/auth/logout` | Invalidate the current session or refresh token. |
| POST | `/api/v1/auth/refresh` | Generate a new access token using a valid refresh token. |

---

## Subject Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subjects` | Retrieve all subjects available to the authenticated user. |
| GET | `/api/v1/subjects/:subjectId` | Retrieve details of a specific subject. |
| POST | `/api/v1/subjects` | Create a new subject. |
| PUT | `/api/v1/subjects/:subjectId` | Update an existing subject. |
| DELETE | `/api/v1/subjects/:subjectId` | Delete a subject. |

---

## Period Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/periods` | Retrieve all periods available to the authenticated user. |
| GET | `/api/v1/periods/:periodId` | Retrieve details of a specific period. |
| GET | `/api/v1/subjects/:subjectId/periods` | Retrieve all periods belonging to a subject. |
| POST | `/api/v1/subjects/:subjectId/periods` | Create a new period for a subject. |
| PUT | `/api/v1/periods/:periodId` | Update an existing period. |
| DELETE | `/api/v1/periods/:periodId` | Delete a period. |

---

## Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/attendance` | Retrieve attendance information for the authenticated user. |
| GET | `/api/v1/subjects/:subjectId/attendance` | Retrieve attendance summary for a subject. |
| GET | `/api/v1/periods/:periodId/attendance` | Retrieve attendance records for a specific period. |
| POST | `/api/v1/periods/:periodId/attendance` | Mark attendance for a period. |
| DELETE | `/api/v1/periods/:periodId/attendance/:userId` | Remove a user's attendance record from a period. |

---

## Announcements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/announcements` | Retrieve all announcements for the authenticated user's group. |
| POST | `/api/v1/announcements` | Create a new announcement. |
| PUT | `/api/v1/announcements/:announcementId` | Update an existing announcement. |
| DELETE | `/api/v1/announcements/:announcementId` | Delete an announcement. |

---

## User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Retrieve the authenticated user's profile. |
| PUT | `/api/v1/users/me` | Update the authenticated user's profile. |

---

# API Endpoints

---

# AUTH

---

## Send  Otp

```
POST /api/v1/auth/send-otp
```

### Authentication

Not Required

### Request Body

```json
{
    "email" : "user@gmail.com",
}
```

### Response

```json
{
    "success": true,
    "message": "OTP sent successfully"
}
```

### Notes

*


---

## Register

```
POST /api/v1/auth/register
```

### Authentication

Not Required

### Request Body

```json
{
    "rollNo" : 123456,
    "name" : "User",
    "email" : "user@gmail.com",
    "password" : "pwd@123$",
    "group" : {
        "year" : 1,
        "dept" : "CSE",
        "sec" : "A"
    },
    "role" : "ROLE_USER",
    "otp" : "123456"
}
```

### Response

```json
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "token": "asdfw54f34t43t34ggf345y345",
        "user": {
            "rollNo" : 123456,
            "name" : "User",
            "email" : "user@gmail.com",
            "groupId" : "6a5632a7afae49887f9e5b5d"
            "role" : "ROLE_USER",
            "_id": "6a5634a373112138a578bbb5",
            "createdAt": "2026-07-14T13:07:47.448Z",
            "updatedAt": "2026-07-14T13:07:47.448Z",
            "__v": 0
        }
    }
}
```

### Notes

*

---

## Login

```
POST /api/v1/auth/login
```

### Authentication

Not Required

### Request Body

```json
{
    "email" : "user@gmail.com",
    "password" : "pwd@123$"
}
```

### Response

```json
{
    "success": true,
    "message": "Signed In successfully",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTU2N2UwZGUzNDI2MDAxYjc0ZDcyOTIiLCJyb2xlIjoiUk9MRV9VU0VSIiwidG9rZW5WZXJzaW9uIjoxLCJpYXQiOjE3ODQwNTMzMjEsImV4cCI6MTc4NjY0NTMyMX0.aBjcdiRdDMYgGmdaB6lXPBYstXgSpsJjD4tvhZ6TZWQ",
        "user": {
            "_id": "6a567e0de3426001b74d7292",
            "rollNo": 425054,
            "name": "User",
            "email": "user@gmail.com",
            "password": null,
            "groupId": "6a5632a7afae49887f9e5b5d",
            "role": "ROLE_USER",
            "tokenVersion": 1,
            "createdAt": "2026-07-14T18:21:01.201Z",
            "updatedAt": "2026-07-14T18:21:01.201Z",
            "__v": 0
        }
    }
}
```

### Notes

*

---

## Verify OTP

```
POST /api/v1/auth/verify-otp
```

### Authentication

Not Required

### Request Body

```json
{
    "email" : "user@gmail.com",
    "otp" : "123456"
}
```

### Response

```json
{
    "success": true,
    "message": "OTP Verified Succesfully",
}
```

### Notes

*

---


## Logout All

```
POST /api/v1/auth/logout-all
```

### Authentication

Token Required

### Request Body

```json
{
}
```

### Response

```json
{
    "success": true,
    "message": "Logged Out of all devices successfully"
}
```

### Notes

*

---


## Forgot Password

```
POST /api/v1/auth/forgot-password
```

### Authentication

Not Required

### Request Body

```json
{
    "email": "user@gmail.com",
    "otp": "756910",
    "password": "newPassword"
}
```

### Response

```json
{
    "success": true,
    "message": "Updated Password"
}
```

### Notes

*

---

# FACULTY

---

## Create Faculty

```
POST /api/v1/faculties
```

### Authentication

Not Required

### Request Body

```json
{
    "name": "Faculty Test2",
    "dept": "CSE"
}
```

### Response

```json
{
    "success": true,
    "message": "Faculty created successfully",
    "data": {
        "faculty": {
            "name": "Faculty Test2",
            "dept": "CSE",
            "_id": "6a5768ec73d4eb3b094835a9",
            "createdAt": "2026-07-15T11:03:08.040Z",
            "updatedAt": "2026-07-15T11:03:08.040Z",
            "__v": 0
        }
    }
}
```

### Notes

*


---


# SUBJECT

---

## Get Subject

```
GET /api/v1/subjects/:subjectId
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
    "success": true,
    "message": "Subject Found",
    "data": {
        "subject": {
            "_id": "6a576c01e498e5d967e02db9",
            "name": "Subejct Test10",
            "facultyId": {
                "_id": "6a5768c773d4eb3b094835a7",
                "name": "Faculty Test",
                "dept": "CSE"
            },
            "credits": 0,
            "groupId": {
                "_id": "6a5632a7afae49887f9e5b5d",
                "year": 2,
                "dept": "CSE",
                "sec": "B"
            },
            "createdAt": "2026-07-15T11:16:17.940Z",
            "updatedAt": "2026-07-15T14:54:22.381Z",
            "__v": 0
        }
    }
}
```

---

## Get Subjects

```
GET /api/v1/subjects
```

### Authentication

Required

### Query Parameters

```
(Optional)
```

### Response

```json
{
    "success": true,
    "message": "Subjects Found",
    "data": {
        "subjects": [
            {
                "_id": "6a576c01e498e5d967e02db9",
                "name": "Subejct Test10",
                "facultyId": {
                    "_id": "6a5768c773d4eb3b094835a7",
                    "name": "Faculty Test",
                    "dept": "CSE"
                },
                "credits": 0,
                "groupId": {
                    "_id": "6a5632a7afae49887f9e5b5d",
                    "year": 2,
                    "dept": "CSE",
                    "sec": "B"
                },
                "createdAt": "2026-07-15T11:16:17.940Z",
                "updatedAt": "2026-07-15T14:54:22.381Z",
                "__v": 0
            },
            {
                "_id": "6a577443e1e782fee49f5bd4",
                "name": "Subejct Test4",
                "facultyId": {
                    "_id": "6a5768c773d4eb3b094835a7",
                    "name": "Faculty Test",
                    "dept": "CSE"
                },
                "credits": 3,
                "groupId": {
                    "_id": "6a5632a7afae49887f9e5b5d",
                    "year": 2,
                    "dept": "CSE",
                    "sec": "B"
                },
                "createdAt": "2026-07-15T11:51:31.310Z",
                "updatedAt": "2026-07-15T11:51:31.310Z",
                "__v": 0
            }
        ]
    }
}
```

---

## Create Subject

```
POST /api/v1/subjects
```

### Authentication

Required

### Request Body

```json
{ 
    "name": "Subejct Test7", 
    "facultyId": "6a5768c773d4eb3b094835a7",
    "credits": 3,
    "moderatorId": "6a567e0de3426001b74d7292"
}
```

### Response

```json
{
    "success": true,
    "message": "Subject created successfully",
    "data": {
        "subject": {
            "name": "Subejct Test7",
            "facultyId": {
                "_id": "6a5768c773d4eb3b094835a7",
                "name": "Faculty Test",
                "dept": "CSE"
            },
            "credits": 3,
            "groupId": {
                "_id": "6a5632a7afae49887f9e5b5d",
                "year": 2,
                "dept": "CSE",
                "sec": "B"
            },
            "_id": "6a57b215e033bb2010bd20e2",
            "createdAt": "2026-07-15T16:15:17.414Z",
            "updatedAt": "2026-07-15T16:15:17.414Z",
            "__v": 0
        }
    }
}
```

---

## Update Subject

```
PUT /api/v1/subjects/:subjectId
```

### Authentication

Required

### Request Body

```json
{ 
    "name": "Subejct Test10", 
    "facultyId": "6a5768c773d4eb3b094835a7",
    "credits": 0
}
```

### Response

```json
{
    "success": true,
    "message": "Subject Updated successfully",
    "data": {
        "subject": {
            "_id": "6a576c01e498e5d967e02db9",
            "name": "Subejct Test10",
            "facultyId": {
                "_id": "6a5768c773d4eb3b094835a7",
                "name": "Faculty Test",
                "dept": "CSE"
            },
            "credits": 0,
            "groupId": {
                "_id": "6a5632a7afae49887f9e5b5d",
                "year": 2,
                "dept": "CSE",
                "sec": "B"
            },
            "createdAt": "2026-07-15T11:16:17.940Z",
            "updatedAt": "2026-07-15T14:54:22.381Z",
            "__v": 0
        }
    }
}
```

---

## Delete Subject

```
DELETE /api/v1/subjects/:subjectId
```

### Authentication

Required

### Response

```json
{
    "success": true,
    "message": "Subject deleted successfully",
    "data": {
        "subject": {
            "_id": "6a576c01e498e5d967e02db9",
            "name": "Subejct Test10",
            "facultyId": {
                "_id": "6a5768c773d4eb3b094835a7",
                "name": "Faculty Test",
                "dept": "CSE"
            },
            "credits": 0,
            "groupId": {
                "_id": "6a5632a7afae49887f9e5b5d",
                "year": 2,
                "dept": "CSE",
                "sec": "B"
            },
            "createdAt": "2026-07-15T11:16:17.940Z",
            "updatedAt": "2026-07-15T14:54:22.381Z",
            "__v": 0
        }
    }
}
```

---

# PERIOD

---

## Get Period

```
GET /api/v1/periods/:periodId
```

### Authentication

Required

### Response

```json
{
    "success": true,
    "message": "Period retrieved successfully",
    "data": {
        "period": {
            "_id": "6a57bd881c45143ba32c6a0a",
            "subjectId": {
                "_id": "6a576c3ae498e5d967e02dba",
                "name": "Subejct Test3"
            },
            "groupId": "6a5632a7afae49887f9e5b5d",
            "startTime": "2026-07-16T09:00:00.000Z",
            "endTime": "2026-07-16T09:50:00.000Z",
            "createdBy": {
                "_id": "6a567e0de3426001b74d7292",
                "rollNo": 425054,
                "name": "Nikhil"
            },
            "createdAt": "2026-07-15T17:04:08.525Z",
            "updatedAt": "2026-07-15T17:04:08.525Z",
            "__v": 0
        }
    }
}
```

---

## Get Periods

```
GET /api/v1/periods
```

### Authentication

Required

### Response

```json
{
    "success": true,
    "message": "Periods retrieved successfully",
    "data": {
        "periods": [
            {
                "_id": "6a57bd881c45143ba32c6a0a",
                "subjectId": {
                    "_id": "6a576c3ae498e5d967e02dba",
                    "name": "Subejct Test3"
                },
                "groupId": "6a5632a7afae49887f9e5b5d",
                "startTime": "2026-07-16T09:00:00.000Z",
                "endTime": "2026-07-16T09:50:00.000Z",
                "createdBy": {
                    "_id": "6a567e0de3426001b74d7292",
                    "rollNo": 425054,
                    "name": "Nikhil"
                },
                "createdAt": "2026-07-15T17:04:08.525Z",
                "updatedAt": "2026-07-15T17:04:08.525Z",
                "__v": 0
            }
        ]
    }
}
```

---

## Get Subject Periods

```
GET /api/v1/subjects/:subjectId/periods
```

### Authentication

Required

### Response

```json
{
    "success": true,
    "message": "Periods retrieved successfully",
    "data": {
        "periods": [
            {
                "_id": "6a57bd881c45143ba32c6a0a",
                "subjectId": {
                    "_id": "6a576c3ae498e5d967e02dba",
                    "name": "Subejct Test3"
                },
                "groupId": "6a5632a7afae49887f9e5b5d",
                "startTime": "2026-07-16T09:00:00.000Z",
                "endTime": "2026-07-16T09:50:00.000Z",
                "createdBy": {
                    "_id": "6a567e0de3426001b74d7292",
                    "rollNo": 425054,
                    "name": "Nikhil"
                },
                "createdAt": "2026-07-15T17:04:08.525Z",
                "updatedAt": "2026-07-15T17:04:08.525Z",
                "__v": 0
            }
        ]
    }
}
```

---

## Create Period

```
POST /api/v1/subjects/:subjectId/periods
```

### Authentication

Required

### Request Body

```json
{
    "startTime": "2026-07-16T09:00:00.000Z",
    "endTime": "2026-07-16T09:50:00.000Z"
}
```

### Response

```json
{
    "success": true,
    "message": "Period created Successfully",
    "data": {
        "period": {
            "subjectId": {
                "_id": "6a576c3ae498e5d967e02dba",
                "name": "Subejct Test3"
            },
            "groupId": "6a5632a7afae49887f9e5b5d",
            "startTime": "2026-07-16T09:00:00.000Z",
            "endTime": "2026-07-16T09:50:00.000Z",
            "createdBy": {
                "_id": "6a567e0de3426001b74d7292",
                "rollNo": 425054,
                "name": "Nikhil"
            },
            "_id": "6a57bd881c45143ba32c6a0a",
            "createdAt": "2026-07-15T17:04:08.525Z",
            "updatedAt": "2026-07-15T17:04:08.525Z",
            "__v": 0
        }
    }
}
```

---

## Update Period

```
PUT /api/v1/periods/:periodId
```

### Authentication

Required

### Request Body

```json
{
    "startTime": "2026-08-16T09:00:00.000Z",
    "endTime": "2026-08-16T09:50:00.000Z"
}
```

### Response

```json
{
    "success": true,
    "message": "Period Updated Successfully",
    "data": {
        "period": {
            "_id": "6a57bd881c45143ba32c6a0a",
            "subjectId": {
                "_id": "6a576c3ae498e5d967e02dba",
                "name": "Subejct Test3"
            },
            "groupId": "6a5632a7afae49887f9e5b5d",
            "startTime": "2026-08-16T09:00:00.000Z",
            "endTime": "2026-08-16T09:50:00.000Z",
            "createdBy": {
                "_id": "6a567e0de3426001b74d7292",
                "rollNo": 425054,
                "name": "Nikhil"
            },
            "createdAt": "2026-07-15T17:04:08.525Z",
            "updatedAt": "2026-07-15T17:56:19.537Z",
            "__v": 0
        }
    }
}
```

---

## Delete Period

```
DELETE /api/v1/periods/:periodId
```

### Authentication

Required

### Response

```json
{
    "success": true,
    "message": "Period deleted successfully",
    "data": {
        "period": {
            "_id": "6a57bd881c45143ba32c6a0a",
            "subjectId": {
                "_id": "6a576c3ae498e5d967e02dba",
                "name": "Subejct Test3"
            },
            "groupId": "6a5632a7afae49887f9e5b5d",
            "startTime": "2026-08-16T09:00:00.000Z",
            "endTime": "2026-08-16T09:50:00.000Z",
            "createdBy": {
                "_id": "6a567e0de3426001b74d7292",
                "rollNo": 425054,
                "name": "Nikhil"
            },
            "createdAt": "2026-07-15T17:04:08.525Z",
            "updatedAt": "2026-07-15T17:56:19.537Z",
            "__v": 0
        }
    }
}
```

---

# ATTENDANCE

---

## Get My Attendance

```
GET /api/v1/attendance
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
GET /api/v1/subjects/:subjectId/attendance
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
GET /api/v1/periods/:periodId/attendance
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
POST /api/v1/periods/:periodId/attendance
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
DELETE /api/v1/periods/:periodId/attendance/:userId
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
GET /api/v1/announcements
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
POST /api/v1/announcements
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
PUT /api/v1/announcements/:announcementId
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
DELETE /api/v1/announcements/:announcementId
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
GET /api/v1/users/me
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
PUT /api/v1/users/me
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
