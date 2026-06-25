# Hotel Management System API Documentation

Generated from the backend implementation in `Backend/src`.

## Project Overview

### Purpose

This backend powers a hotel management system with user registration/login, role-based account management, hotel and room inventory, booking holds, Razorpay payment order creation, and Razorpay webhook confirmation.

### Architecture

The API is an Express 5 application using a modular layered structure:

- Routes define HTTP endpoints and middleware order.
- Controllers translate requests into service calls and format responses.
- Services contain business rules and transaction orchestration.
- Repositories isolate Mongoose queries.
- Models define MongoDB collections, indexes, soft-delete behavior, and schema validation.
- Middleware handles JWT authentication, role authorization, validation, uploads, file-content checks, resource loading, ownership checks, rate limiting, and webhook signatures.
- Jobs run recurring booking/payment expiry cleanup.

### Folder Structure

```text
Backend/
  package.json
  src/
    app.js
    server.js
    config/
      db.js
      razorpay.js
    jobs/
      bookingExpiration.job.js
      index.js
    middleware/
      authorize.middleware.js
      fileValidation.middleware.js
      rateLimit.middleware.js
      upload.middleware.js
      validate.middleware.js
      validateBookingId.middleware.js
      validateBookingOwnership.middleware.js
      validateHotelId.middleware.js
      validateHotelOwnership.middleware.js
      validateOwnerBookingAccess.middleware.js
      validatePaymentId.middleware.js
      validateRoomId.middleware.js
      validateUserId.middleware.js
      validateUserIdIncludingDeleted.middleware.js
      verifyToken.middleware.js
    modules/
      admin/
      auth/
      bookings/
      hotelOwner/
      hotels/
      payments/
      rooms/
      users/
    utils/
      apiError.js
      deleteImage.js
      escapeRegex.js
      generateToken.js
      logger.js
      nightsStayCalculationLogic.js
```

### Tech Stack

| Area | Technology |
|---|---|
| Runtime | Node.js, ES modules |
| Web framework | Express 5 |
| Database | MongoDB |
| ODM | Mongoose |
| Auth | JSON Web Tokens (`jsonwebtoken`) |
| Password hashing | `bcrypt` |
| Validation | Joi |
| File upload | Multer |
| File type inspection | `file-type` |
| Payments | Razorpay |
| Scheduled jobs | `node-cron` |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Winston |
| Date logic | Luxon |

### Base URL

The app does not define an API prefix. Routes are mounted directly at the server origin.

```text
http://localhost:{PORT}
```

### Authentication Flow

1. A user registers with `POST /auth/register`.
2. A user logs in with `POST /auth/login`.
3. Login returns a JWT signed with `JWT_SECRET`.
4. Protected routes require:

```http
Authorization: Bearer <jwt>
```

5. JWT payload contains:

```json
{
  "id": "userObjectId",
  "role": "user | owner | admin"
}
```

### Authorization Flow

Role checks use `authorize(...roles)` after `verifyToken`.

| Role | Capabilities |
|---|---|
| `user` | Profile access, own bookings, booking cancellation, own payment lookup |
| `owner` | Owner hotel/room management, owner booking visibility |
| `admin` | User administration, hotel status moderation, all booking visibility |

Several endpoints also enforce resource-level access:

- `validateHotelOwnership`: owner must own the hotel.
- `validateBookingOwnership`: authenticated user must own the booking.
- `validateOwnerBookingAccess`: owner must own the booking's hotel.
- `validatePaymentId`: authenticated user must own the payment.

### Database Collections and Relationships

| Collection | Model | Important Relationships |
|---|---|---|
| `users` | `User` | Owns hotels through `Hotel.owner`; owns bookings/payments through `Booking.userId` and `Payment.userId`; admins approve hotels through `Hotel.approvedBy` |
| `hotels` | `Hotel` | Belongs to owner user; has many rooms; has many bookings |
| `rooms` | `Room` | Belongs to hotel through `hotelId` |
| `bookings` | `Booking` | Belongs to user and hotel; references payment through `paymentId` |
| `payments` | `Payment` | Belongs to booking and user; stores Razorpay order/payment identifiers |

Soft-delete behavior:

- `User`, `Hotel`, `Room`, and `Booking` use `isDeleted`.
- `User`, `Hotel`, `Room`, and `Booking` add query middleware to hide deleted records in normal `find` operations.
- Deleted users can be fetched with `.setOptions({ includeDeleted: true })`.

### Environment Variables

Values are intentionally excluded.

| Variable | Purpose |
|---|---|
| `PORT` | Server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `NODE_ENV` | Runtime mode; affects error output and logging |
| `BCRYPT_SALT_ROUNDS` | Password hash salt rounds |
| `RAZORPAY_KEY_ID` | Razorpay API key id |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook HMAC secret |
| `FRONTEND_URL` | Optional CORS origin; defaults to `http://localhost:5173` |

### Third-party Integrations

| Integration | Usage |
|---|---|
| Razorpay | Payment order creation and payment webhooks |
| DiceBear Initials API | Default profile picture generation during registration and profile name changes |

### Global Middleware and API Behavior

| Middleware | Behavior |
|---|---|
| `helmet` | Security headers with cross-origin resource policy set to `cross-origin` |
| `cors` | Allows configured frontend origin and credentials |
| `compression` | Compresses responses |
| `express.json` / `express.urlencoded` | Parses JSON and URL-encoded bodies |
| `/uploads` static | Serves uploaded files |
| Global rate limiter | 500 requests per 15 minutes |
| Login rate limiter | 10 failed login attempts per 15 minutes; successful requests skipped |
| Error handler | Normalizes `ApiError`, duplicate key, Mongoose validation, cast, Multer, and fallback errors |

### Standard Error Shape

Most operational errors return:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

Validation errors return `message: "Validation Error"` and an `errors` array containing Joi messages.

### Swagger/OpenAPI

No Swagger/OpenAPI annotations were found in the backend source. The endpoint documentation below is inferred from route, controller, service, validation, middleware, and model code.

## Endpoint Index

| Method | URL | Auth | Role |
|---|---|---|---|
| GET | `/health` | No | Public |
| POST | `/auth/register` | No | Public |
| POST | `/auth/login` | No | Public |
| GET | `/users/me` | Yes | Any authenticated user |
| PATCH | `/users/me` | Yes | Any authenticated user |
| DELETE | `/users/me` | Yes | Any authenticated user |
| GET | `/users/bookings` | Yes | User owner of records |
| GET | `/users/bookings/:bookingId` | Yes | Booking owner |
| PATCH | `/users/bookings/:bookingId/cancel` | Yes | Booking owner |
| GET | `/admin/users` | Yes | Admin |
| GET | `/admin/users/deleted` | Yes | Admin |
| GET | `/admin/users/:userId` | Yes | Admin |
| PATCH | `/admin/users/:userId` | Yes | Admin |
| PATCH | `/admin/users/:userId/role` | Yes | Admin |
| PATCH | `/admin/users/:userId/restore` | Yes | Admin |
| DELETE | `/admin/users/:userId` | Yes | Admin |
| GET | `/admin/hotels` | Yes | Admin |
| GET | `/admin/hotels/:hotelId` | Yes | Admin |
| PATCH | `/admin/hotels/:hotelId/status` | Yes | Admin |
| GET | `/admin/bookings` | Yes | Admin |
| GET | `/admin/bookings/:bookingId` | Yes | Admin |
| POST | `/owner/hotels` | Yes | Owner |
| GET | `/owner/hotels` | Yes | Owner |
| GET | `/owner/hotels/:hotelId` | Yes | Owner of hotel |
| PATCH | `/owner/hotels/:hotelId` | Yes | Owner of hotel |
| DELETE | `/owner/hotels/:hotelId` | Yes | Owner of hotel |
| POST | `/owner/hotels/:hotelId/rooms` | Yes | Owner of hotel |
| PATCH | `/owner/hotels/:hotelId/rooms/:roomId` | Yes | Owner of hotel |
| DELETE | `/owner/hotels/:hotelId/rooms/:roomId` | Yes | Owner of hotel |
| GET | `/owner/bookings` | Yes | Owner |
| GET | `/owner/bookings/:bookingId` | Yes | Owner of booking hotel |
| GET | `/hotels` | No | Public |
| GET | `/hotels/:hotelId` | No | Public |
| GET | `/hotels/:hotelId/rooms` | No | Public |
| GET | `/hotels/:hotelId/rooms/:roomId` | No | Public |
| POST | `/hotels/:hotelId/bookings` | Yes | Authenticated user |
| POST | `/bookings/:bookingId/payments` | Yes | Booking owner |
| GET | `/payments/:paymentId` | Yes | Payment owner |
| POST | `/webhooks/payments` | Razorpay signature | Razorpay |

## Data Models

### User

| Field | Type | Rules |
|---|---|---|
| `firstName` | String | Required, trim |
| `lastName` | String | Required, trim |
| `email` | String | Required, unique, lowercase, indexed |
| `phoneNumber` | String | Required, unique |
| `password` | String | Required, selected false, bcrypt hashed before save |
| `dateOfBirth` | Date | Required |
| `gender` | String | `male`, `female` |
| `profilePicture` | String | URL string |
| `profilePictureType` | String | `default`, `uploaded`; default `default` |
| `role` | String | `admin`, `user`, `owner`; default `user` |
| `isVerified` | Boolean | Default `false` |
| `isDeleted` | Boolean | Default `false` |
| `deletedAt` | Date | Default `null` |

### Hotel

| Field | Type | Rules |
|---|---|---|
| `hotelName` | String | Required, lowercase, 2-120 chars |
| `description` | String | Lowercase, max 1000 |
| `address` | Object | Required street/city/state/zipCode/country |
| `images` | String[] | Max 10 |
| `amenities` | String[] | Default `[]` |
| `category` | String | `luxury`, `budget`, `business`, `family` |
| `totalRooms` | Number | Required, 1-10000 |
| `averageRating` | Number | 0-5, rounded to one decimal |
| `owner` | ObjectId | Ref `User`, required |
| `approvedBy` | ObjectId | Ref `User`, nullable |
| `status` | String | `pending`, `active`, `rejected`, `inactive`, `suspended` |
| `isDeleted` | Boolean | Default `false` |
| `deletedAt` | Date | Default `null` |

### Room

| Field | Type | Rules |
|---|---|---|
| `hotelId` | ObjectId | Ref `Hotel`, required |
| `roomNumber` | String | Required |
| `type` | String | `single`, `double`, `suite`, `deluxe`, `family` |
| `description` | String | 20-450 chars, default empty |
| `price` | Number | Required, greater than 0 |
| `capacity` | Number | Required, greater than 0 |
| `amenities` | String[] | Default `[]` |
| `operationalStatus` | String | `available`, `maintenance`, `inactive` |
| `images` | URL[] | Max 10 |
| `isDeleted` | Boolean | Default `false`, selected false |
| `deletedAt` | Date | Default `null`, selected false |

### Booking

| Field | Type | Rules |
|---|---|---|
| `userId` | ObjectId | Ref `User`, required |
| `hotelId` | ObjectId | Ref `Hotel`, required |
| `roomType` | String | `single`, `double`, `suite`, `deluxe`, `family` |
| `quantity` | Number | Required, min 1 |
| `totalPrice` | Number | Required, min 0 |
| `pricePerNight` | Number | Required, min 0 |
| `numberOfGuests` | Number | Required |
| `checkIn` | Date | Required |
| `checkOut` | Date | Required |
| `status` | String | `pending`, `confirmed`, `cancelled`, `expired` |
| `paymentStatus` | String | `none`, `initiated`, `paid`, `failed`, `refunded` |
| `paymentId` | ObjectId | Ref `Payment` |
| `expiresAt` | Date | Required booking hold expiry |
| `cancelReason` | String | Max 500 |
| `metadata` | Map<String,String> | Optional |
| `isDeleted` | Boolean | Default `false` |

### Payment

| Field | Type | Rules |
|---|---|---|
| `bookingId` | ObjectId | Ref `Booking`, required |
| `userId` | ObjectId | Ref `User`, required |
| `amount` | Number | Required, min 0 |
| `currency` | String | Default `INR` |
| `status` | String | `pending`, `paid`, `failed`, `cancelled`, `refunded` |
| `paymentMethod` | String | `card`, `upi`, `netbanking`, `wallet` |
| `razorpayOrderId` | String | Razorpay order id |
| `razorpayPaymentId` | String | Unique sparse |
| `razorpaySignature` | String | Stored field, not currently written by service |
| `idempotencyKey` | String | Unique sparse |
| `expiresAt` | Date | Logical payment expiry |
| `metadata` | Map<String,String> | Optional |
| `failureReason` | String | Optional |
| `gatewayResponse` | Mixed | Optional failure/debug payload |

## Authentication Endpoints

### Register User

| Item | Details |
|---|---|
| Endpoint Name | Register User |
| HTTP Method | `POST` |
| URL | `/auth/register` |
| Description | Creates a new user account. Accepts an optional profile image. |
| Authentication Requirement | No |
| User Role Required | Public |
| Request Headers | `Content-Type: multipart/form-data` when uploading `profilePicture`; otherwise JSON is accepted by validation after upload middleware |
| Path Parameters | None |
| Query Parameters | None |
| Database Tables Used | `users` |
| Related Models | `User` |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `firstName` | string | Yes | Trimmed |
| `lastName` | string | Yes | Trimmed |
| `email` | string | Yes | Valid email |
| `phoneNumber` | string | Yes | Required |
| `password` | string | Yes | Minimum 6 chars |
| `dateOfBirth` | date | Yes | Joi date |
| `gender` | string | Yes | `male`, `female` |
| `profilePicture` | file | No | JPG, PNG, WEBP; max 10 MB; content type verified |

Success Response:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "firstName": "Ahmed",
    "lastName": "Mochi",
    "email": "ahmed@example.com",
    "phoneNumber": "9876543210",
    "dateOfBirth": "2000-01-01T00:00:00.000Z",
    "gender": "male",
    "profilePicture": "https://api.dicebear.com/7.x/initials/svg?seed=Ahmed%20Mochi",
    "profilePictureType": "default",
    "role": "user",
    "isVerified": false,
    "id": "64f..."
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Joi validation failure, invalid file type/content, file too large |
| 409 | Email or phone number already exists |
| 500 | Unexpected server error |

Business Logic Summary:

- Checks unique email and phone number.
- Hashes password in `User` pre-save hook.
- Uses uploaded profile picture URL when present.
- Generates DiceBear initials profile picture when no upload is provided.
- Deletes uploaded file if registration fails after upload.

Example Request:

```http
POST /auth/register
Content-Type: multipart/form-data

firstName=Ahmed
lastName=Mochi
email=ahmed@example.com
phoneNumber=9876543210
password=secret123
dateOfBirth=2000-01-01
gender=male
profilePicture=@avatar.webp
```

Notes:

- Uploaded profile files are stored under `uploads/profiles`.
- Password is never returned.

### Login User

| Item | Details |
|---|---|
| Endpoint Name | Login User |
| HTTP Method | `POST` |
| URL | `/auth/login` |
| Description | Authenticates a user and returns a JWT. |
| Authentication Requirement | No |
| User Role Required | Public |
| Request Headers | `Content-Type: application/json` |
| Path Parameters | None |
| Query Parameters | None |
| Database Tables Used | `users` |
| Related Models | `User` |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `email` | string | Yes | Valid email |
| `password` | string | Yes | Minimum 6 chars |

Success Response:

```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "id": "64f...",
    "email": "ahmed@example.com",
    "role": "user"
  },
  "token": "jwt.token.value"
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Validation failure |
| 401 | Invalid email/password or soft-deleted user |
| 429 | Too many failed login attempts |

Business Logic Summary:

- Looks up user by email including password.
- Rejects missing, deleted, or password-mismatched users.
- Signs JWT with user id and role.

Example Request:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "secret123"
}
```

Notes:

- Login route has its own 10-request/15-minute limiter.

## User Endpoints

All `/users` routes require `Authorization: Bearer <token>`.

### Get Current User

| Item | Details |
|---|---|
| Endpoint Name | Get Current User |
| HTTP Method | `GET` |
| URL | `/users/me` |
| Description | Returns the authenticated user's profile. |
| Authentication Requirement | Yes |
| User Role Required | Any authenticated role |
| Request Headers | `Authorization: Bearer <token>` |
| Path Parameters | None |
| Query Parameters | None |
| Request Body | None |
| Validation Rules | JWT must be valid |
| Status Codes | `200`, `401`, `404` |
| Database Tables Used | `users` |
| Related Models | `User` |

Success Response:

```json
{
  "success": true,
  "message": "User Details Fetched Successfully",
  "data": {
    "id": "64f...",
    "firstName": "Ahmed",
    "role": "user"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 401 | Missing, invalid, or expired token |
| 404 | User does not exist |

Business Logic Summary:

- Uses JWT `id` to load the active user.

Example Request:

```http
GET /users/me
Authorization: Bearer <token>
```

Notes:

- Soft-deleted users are hidden by the model query middleware.

### Update Current User

| Item | Details |
|---|---|
| Endpoint Name | Update Current User |
| HTTP Method | `PATCH` |
| URL | `/users/me` |
| Description | Updates allowed profile fields and optionally profile picture. |
| Authentication Requirement | Yes |
| User Role Required | Any authenticated role |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: multipart/form-data` for image upload |
| Path Parameters | None |
| Query Parameters | None |
| Database Tables Used | `users` |
| Related Models | `User` |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `firstName` | string | No | 2-50 chars |
| `lastName` | string | No | 2-50 chars |
| `phoneNumber` | string | No | Exactly 10 digits |
| `gender` | string | No | `male`, `female` |
| `dateOfBirth` | date | No | Before now |
| `profilePicture` | file/string | No | Upload middleware expects file; Joi string rule expects image URL when body value is present |

Success Response:

```json
{
  "success": true,
  "message": "User Details Updated Successfully",
  "data": {
    "id": "64f...",
    "firstName": "Ahmed",
    "phoneNumber": "9876543210",
    "profilePictureType": "uploaded"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Validation failure, no valid fields, invalid file |
| 401 | Missing/invalid token |
| 404 | User not found |
| 409 | Phone number already in use |

Business Logic Summary:

- Filters updates to profile fields only.
- Regenerates DiceBear URL if name changes while the profile picture is still default.
- Replaces uploaded profile image and deletes previous uploaded image when applicable.

Example Request:

```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: multipart/form-data

firstName=Ahmed
phoneNumber=9876543210
profilePicture=@avatar.png
```

Notes:

- Email, password, role, and verification cannot be changed through this endpoint.

### Delete Current User

| Item | Details |
|---|---|
| Endpoint Name | Soft Delete Current User |
| HTTP Method | `DELETE` |
| URL | `/users/me` |
| Description | Soft deletes the authenticated user. |
| Authentication Requirement | Yes |
| User Role Required | Any authenticated role |
| Request Headers | `Authorization: Bearer <token>` |
| Request Body | None |
| Validation Rules | JWT must be valid |
| Status Codes | `200`, `401`, `404` |
| Database Tables Used | `users` |
| Related Models | `User` |

Success Response:

```json
{
  "success": true,
  "message": "User Record Is Deleted Successfully",
  "data": {
    "id": "64f...",
    "email": "ahmed@example.com"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 401 | Missing/invalid token |
| 404 | User does not exist |

Business Logic Summary:

- Sets `isDeleted = true` and `deletedAt`.
- Deletes uploaded profile image if the current profile picture is uploaded.

Example Request:

```http
DELETE /users/me
Authorization: Bearer <token>
```

Notes:

- The account is not physically removed from MongoDB.

### Get My Bookings

| Item | Details |
|---|---|
| Endpoint Name | Get My Bookings |
| HTTP Method | `GET` |
| URL | `/users/bookings` |
| Description | Lists bookings belonging to the authenticated user. |
| Authentication Requirement | Yes |
| User Role Required | Booking owner |
| Request Headers | `Authorization: Bearer <token>` |
| Path Parameters | None |
| Database Tables Used | `bookings` |
| Related Models | `Booking` |

Query Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `page` | number | No | Integer >= 1, default 1 |
| `limit` | number | No | Integer 1-100, default 10 |

Success Response:

```json
{
  "success": true,
  "data": {
    "bookings": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 0,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid query |
| 401 | Missing/invalid token |

Business Logic Summary:

- Filters bookings by `userId`.
- Sorts newest first.
- Returns pagination metadata.

Example Request:

```http
GET /users/bookings?page=1&limit=10
Authorization: Bearer <token>
```

Notes:

- Repository count includes `isDeleted: false`; query also uses Booking model pre-find soft-delete filtering.

### Get My Booking By ID

| Item | Details |
|---|---|
| Endpoint Name | Get My Booking By ID |
| HTTP Method | `GET` |
| URL | `/users/bookings/:bookingId` |
| Description | Returns a single booking owned by the authenticated user. |
| Authentication Requirement | Yes |
| User Role Required | Booking owner |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `bookings`, `hotels`, `users` |
| Related Models | `Booking`, `Hotel`, `User` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `bookingId` | ObjectId | Yes | Valid MongoDB ObjectId; existing non-deleted booking |

Success Response:

```json
{
  "success": true,
  "data": {
    "id": "65a...",
    "status": "pending",
    "paymentStatus": "none"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid booking id |
| 401 | Missing/invalid token |
| 403 | Booking does not belong to user |
| 404 | Booking not found |

Business Logic Summary:

- Loads booking and populates hotel/user summary.
- Ensures `booking.userId` equals JWT user id.

Example Request:

```http
GET /users/bookings/65a000000000000000000000
Authorization: Bearer <token>
```

Notes:

- This endpoint returns the populated booking loaded by middleware.

### Cancel My Booking

| Item | Details |
|---|---|
| Endpoint Name | Cancel My Booking |
| HTTP Method | `PATCH` |
| URL | `/users/bookings/:bookingId/cancel` |
| Description | Cancels a pending unpaid booking owned by the authenticated user. |
| Authentication Requirement | Yes |
| User Role Required | Booking owner |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| Database Tables Used | `bookings` |
| Related Models | `Booking` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `bookingId` | ObjectId | Yes | Valid ObjectId; existing non-deleted booking |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `reason` | string | No | Trimmed, max 500, may be empty |

Success Response:

```json
{
  "success": true,
  "message": "Booking Cancelled Successfully",
  "data": {
    "id": "65a...",
    "status": "cancelled",
    "paymentStatus": "none",
    "cancelReason": "Plans changed"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid id/body, booking not pending, or booking has payment status other than `none` |
| 401 | Missing/invalid token |
| 403 | Booking does not belong to user |
| 404 | Booking not found |

Business Logic Summary:

- Only allows cancellation when `status` is `pending`.
- Only allows cancellation when `paymentStatus` is `none`.
- Stores optional cancel reason.

Example Request:

```http
PATCH /users/bookings/65a000000000000000000000/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Plans changed"
}
```

Notes:

- Paid or payment-initiated bookings cannot be cancelled through this endpoint.

## Admin Endpoints

All `/admin` routes require `Authorization: Bearer <token>` and `role: admin`.

### Get All Active Users

| Item | Details |
|---|---|
| Endpoint Name | Get All Active Users |
| HTTP Method | `GET` |
| URL | `/admin/users` |
| Description | Lists non-deleted users with search, sort, and pagination. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `users` |
| Related Models | `User` |

Query Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `page` | number | No | Integer >= 1, default 1 |
| `limit` | number | No | Integer 1-100, default 10 |
| `search` | string | No | Trimmed |
| `sort` | string | No | `createdAt`, `firstName`, `lastName`, `email`; default `createdAt` |
| `order` | string | No | `asc`, `desc`; default `desc` |

Success Response:

```json
{
  "success": true,
  "message": "All active users fetched successfully",
  "data": {
    "users": [],
    "totalUsers": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "hasData": false
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid query |
| 401 | Missing/invalid token |
| 403 | Non-admin role |

Business Logic Summary:

- Escapes search text for regex safety.
- Searches first name, last name, email, phone number, and role.
- Uses model pre-find middleware to exclude soft-deleted users.

Example Request:

```http
GET /admin/users?search=owner&sort=email&order=asc&page=1&limit=20
Authorization: Bearer <admin-token>
```

Notes:

- Maximum limit is 100.

### Get Deleted Users

| Item | Details |
|---|---|
| Endpoint Name | Get Deleted Users |
| HTTP Method | `GET` |
| URL | `/admin/users/deleted` |
| Description | Lists soft-deleted users. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `users` |
| Related Models | `User` |

Query Parameters:

Same as `GET /admin/users`.

Success Response:

```json
{
  "success": true,
  "message": "Deleted users fetched successfully",
  "data": {
    "users": [],
    "totalUsers": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "hasData": false
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid query |
| 401 | Missing/invalid token |
| 403 | Non-admin role |

Business Logic Summary:

- Uses `includeDeleted` to bypass user model pre-find soft-delete filter.
- Filters `isDeleted: true`.

Example Request:

```http
GET /admin/users/deleted?page=1&limit=10
Authorization: Bearer <admin-token>
```

Notes:

- Sorting behavior is same as active user listing.

### Get User Details

| Item | Details |
|---|---|
| Endpoint Name | Get User Details |
| HTTP Method | `GET` |
| URL | `/admin/users/:userId` |
| Description | Returns active or deleted user details. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `users` |
| Related Models | `User` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `userId` | ObjectId | Yes | Intended to be valid MongoDB ObjectId |

Success Response:

```json
{
  "success": true,
  "message": "User details fetched successfully",
  "data": {
    "id": "64f...",
    "email": "user@example.com"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid user id |
| 401 | Missing/invalid token |
| 403 | Non-admin role |
| 404 | User not found |

Business Logic Summary:

- Intended to load users including soft-deleted records.

Example Request:

```http
GET /admin/users/64f000000000000000000000
Authorization: Bearer <admin-token>
```

Notes:

- Implementation note: `validateUserIdIncludingDeleted` is declared with `(req, res, next, userId)`, which matches Express `router.param` style, but the route uses it as normal middleware. In the current code, `userId` will be undefined when called this way, so this endpoint and restore may return `Invalid user ID` until middleware signature/usage is fixed.

### Update User

| Item | Details |
|---|---|
| Endpoint Name | Update User |
| HTTP Method | `PATCH` |
| URL | `/admin/users/:userId` |
| Description | Updates selected user account fields. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| Database Tables Used | `users` |
| Related Models | `User` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `userId` | ObjectId | Yes | Valid ObjectId; active user |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `firstName` | string | No | 2-50 chars |
| `lastName` | string | No | 2-50 chars |
| `email` | string | No | Valid email, lowercase |
| `phoneNumber` | string | No | 10 digits |
| `password` | string | No | 6-100 chars |
| `gender` | string | No | `male`, `female` |
| `dateOfBirth` | date | No | Before now |
| `isVerified` | boolean | No | Boolean |

Success Response:

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "64f...",
    "email": "new@example.com",
    "isVerified": true
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid id/body |
| 401 | Missing/invalid token |
| 403 | Non-admin role |
| 404 | User not found |
| 409 | Email or phone already exists |

Business Logic Summary:

- Filters allowed update fields.
- Checks email/phone uniqueness excluding the target user.
- Password changes pass through model save hook and are hashed.

Example Request:

```http
PATCH /admin/users/64f000000000000000000000
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isVerified": true,
  "role": "owner"
}
```

Notes:

- `role` is ignored here; use `/admin/users/:userId/role`.

### Update User Role

| Item | Details |
|---|---|
| Endpoint Name | Update User Role |
| HTTP Method | `PATCH` |
| URL | `/admin/users/:userId/role` |
| Description | Changes a user's role. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| Database Tables Used | `users` |
| Related Models | `User` |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `role` | string | Yes | `user`, `owner`, `admin` |

Success Response:

```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": "64f...",
    "role": "owner"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid role or attempt to remove the last admin role from self |
| 401 | Missing/invalid token |
| 403 | Non-admin role |
| 404 | User not found |

Business Logic Summary:

- Prevents the only active admin from removing their own admin role.

Example Request:

```http
PATCH /admin/users/64f000000000000000000000/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "owner"
}
```

Notes:

- Changing a user to owner does not automatically create hotels.

### Restore User

| Item | Details |
|---|---|
| Endpoint Name | Restore User |
| HTTP Method | `PATCH` |
| URL | `/admin/users/:userId/restore` |
| Description | Restores a soft-deleted user. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `users` |
| Related Models | `User` |

Success Response:

```json
{
  "success": true,
  "message": "User restored successfully",
  "data": {
    "id": "64f...",
    "email": "user@example.com"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid user id or user already active |
| 401 | Missing/invalid token |
| 403 | Non-admin role |
| 404 | User not found |

Business Logic Summary:

- Sets `isDeleted = false` and `deletedAt = null`.

Example Request:

```http
PATCH /admin/users/64f000000000000000000000/restore
Authorization: Bearer <admin-token>
```

Notes:

- Same middleware signature issue as `GET /admin/users/:userId` applies in the current code.

### Delete User

| Item | Details |
|---|---|
| Endpoint Name | Delete User |
| HTTP Method | `DELETE` |
| URL | `/admin/users/:userId` |
| Description | Soft deletes an active user. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `users`, `hotels`, `bookings` |
| Related Models | `User`, `Hotel`, `Booking` |

Success Response:

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "64f...",
    "email": "user@example.com"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | User already deleted, deleting last admin, owner has hotels, user has active confirmed bookings |
| 401 | Missing/invalid token |
| 403 | Non-admin role |
| 404 | User not found |

Business Logic Summary:

- Prevents deleting the last admin account.
- Prevents deleting an owner who still has hotels.
- Prevents deleting a user who has confirmed bookings.
- Marks user as deleted.

Example Request:

```http
DELETE /admin/users/64f000000000000000000000
Authorization: Bearer <admin-token>
```

Notes:

- This is a soft delete, not a physical delete.

### Get Hotels By Status

| Item | Details |
|---|---|
| Endpoint Name | Get Hotels By Status |
| HTTP Method | `GET` |
| URL | `/admin/hotels` |
| Description | Lists hotels filtered by moderation status. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `hotels`, `users` |
| Related Models | `Hotel`, `User` |

Query Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `status` | string | No | `pending`, `active`, `rejected`, `suspended`, `inactive`; service defaults to `pending` |

Success Response:

```json
{
  "success": true,
  "message": "Hotels fetched successfully",
  "data": []
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid status |
| 401 | Missing/invalid token |
| 403 | Non-admin role |

Business Logic Summary:

- Queries hotels by status.
- Populates owner name, email, and phone.
- Sorts newest first.

Example Request:

```http
GET /admin/hotels?status=pending
Authorization: Bearer <admin-token>
```

Notes:

- Because the Joi schema makes `status` optional without defaulting, no status query results in service default `pending`.

### Get Admin Hotel Details

| Item | Details |
|---|---|
| Endpoint Name | Get Admin Hotel Details |
| HTTP Method | `GET` |
| URL | `/admin/hotels/:hotelId` |
| Description | Returns a hotel by id for admin review. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `hotels` |
| Related Models | `Hotel` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `hotelId` | ObjectId | Yes | Valid ObjectId; existing non-deleted hotel |

Success Response:

```json
{
  "success": true,
  "message": "Hotel fetched successfully",
  "data": {
    "id": "65b...",
    "hotelName": "grand hotel",
    "status": "pending"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid hotel id |
| 401 | Missing/invalid token |
| 403 | Non-admin role |
| 404 | Hotel not found |

Business Logic Summary:

- Loads hotel via `validateHotelId`.

Example Request:

```http
GET /admin/hotels/65b000000000000000000000
Authorization: Bearer <admin-token>
```

Notes:

- Deleted hotels are excluded by Hotel model query middleware.

### Update Hotel Status

| Item | Details |
|---|---|
| Endpoint Name | Update Hotel Status |
| HTTP Method | `PATCH` |
| URL | `/admin/hotels/:hotelId/status` |
| Description | Moderates hotel lifecycle status. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| Database Tables Used | `hotels`, `users` |
| Related Models | `Hotel`, `User` |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `status` | string | Yes | `pending`, `active`, `rejected`, `suspended`, `inactive` |

Allowed Transitions:

| From | To |
|---|---|
| `pending` | `active`, `rejected` |
| `active` | `suspended`, `inactive` |
| `suspended` | `active` |
| `rejected` | `pending` |
| `inactive` | `active` |

Success Response:

```json
{
  "success": true,
  "message": "Hotel status updated successfully",
  "data": {
    "id": "65b...",
    "status": "active",
    "approvedBy": "64f..."
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Deleted hotel, same status, invalid transition, invalid body |
| 401 | Missing/invalid token |
| 403 | Non-admin role |
| 404 | Hotel not found |

Business Logic Summary:

- Enforces lifecycle transitions.
- Sets `approvedBy` when activating.
- Clears `approvedBy` when moving to `pending` or `rejected`.

Example Request:

```http
PATCH /admin/hotels/65b000000000000000000000/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "active"
}
```

Notes:

- A deleted hotel cannot be activated.

### Get All Bookings

| Item | Details |
|---|---|
| Endpoint Name | Get All Bookings |
| HTTP Method | `GET` |
| URL | `/admin/bookings` |
| Description | Lists bookings across the platform. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `bookings`, `users`, `hotels` |
| Related Models | `Booking`, `User`, `Hotel` |

Query Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `status` | string | No | `pending`, `confirmed`, `cancelled`, `expired` |
| `paymentStatus` | string | No | `none`, `initiated`, `paid`, `failed`, `refunded` |
| `page` | number | No | Integer >= 1, default 1 |
| `limit` | number | No | Integer 1-100, default 10 |

Success Response:

```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": {
    "bookings": [],
    "totalBookings": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "hasData": false
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid query |
| 401 | Missing/invalid token |
| 403 | Non-admin role |

Business Logic Summary:

- Filters by booking and payment status.
- Populates user and hotel summary fields.
- Sorts newest first.

Example Request:

```http
GET /admin/bookings?status=confirmed&paymentStatus=paid
Authorization: Bearer <admin-token>
```

Notes:

- Soft-deleted bookings are excluded.

### Get Admin Booking Details

| Item | Details |
|---|---|
| Endpoint Name | Get Admin Booking Details |
| HTTP Method | `GET` |
| URL | `/admin/bookings/:bookingId` |
| Description | Returns any non-deleted booking by id. |
| Authentication Requirement | Yes |
| User Role Required | Admin |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `bookings`, `hotels`, `users` |
| Related Models | `Booking`, `Hotel`, `User` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `bookingId` | ObjectId | Yes | Valid ObjectId; existing non-deleted booking |

Success Response:

```json
{
  "success": true,
  "message": "Booking fetched successfully",
  "data": {
    "id": "65a...",
    "status": "confirmed"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid booking id |
| 401 | Missing/invalid token |
| 403 | Non-admin role |
| 404 | Booking not found |

Business Logic Summary:

- Loads booking with hotel and user summary populated.

Example Request:

```http
GET /admin/bookings/65a000000000000000000000
Authorization: Bearer <admin-token>
```

Notes:

- Admin route does not require booking ownership.

## Owner Endpoints

All `/owner` routes require `Authorization: Bearer <token>` and `role: owner`.

### Create Hotel

| Item | Details |
|---|---|
| Endpoint Name | Create Hotel |
| HTTP Method | `POST` |
| URL | `/owner/hotels` |
| Description | Creates a hotel owned by the authenticated owner. |
| Authentication Requirement | Yes |
| User Role Required | Owner |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: multipart/form-data` |
| Database Tables Used | `hotels`, `users` |
| Related Models | `Hotel`, `User` |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `hotelName` | string | Yes | 2-120 chars |
| `description` | string | No | Max 1000, may be empty/null |
| `address.street` | string | Yes | 2-200 chars |
| `address.city` | string | Yes | 2-100 chars, lowercase |
| `address.state` | string | Yes | 2-100 chars |
| `address.zipCode` | string | Yes | 3-20 chars |
| `address.country` | string | Yes | 2-100 chars, lowercase |
| `amenities` | string[] | No | Unique, max 50 items, each 2-50 chars |
| `category` | string | Yes | `luxury`, `budget`, `business`, `family` |
| `totalRooms` | number | Yes | Integer 1-10000 |
| `images` | file[] | No | JPG, PNG, WEBP; max 10 files; each max 10 MB |

Success Response:

```json
{
  "success": true,
  "message": "Hotel created successfully",
  "data": {
    "id": "65b...",
    "hotelName": "grand hotel",
    "status": "pending",
    "owner": "64f..."
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Validation failure or invalid image |
| 401 | Missing/invalid token |
| 403 | Non-owner role |
| 409 | Hotel already exists by name and city |

Business Logic Summary:

- Checks duplicate hotel name and city case-insensitively.
- Creates hotel with `status: pending`.
- Stores uploaded images under `uploads/hotels`.
- Deletes uploaded images if service fails.

Example Request:

```http
POST /owner/hotels
Authorization: Bearer <owner-token>
Content-Type: multipart/form-data

hotelName=Grand Hotel
address[street]=MG Road
address[city]=mumbai
address[state]=Maharashtra
address[zipCode]=400001
address[country]=india
category=business
totalRooms=120
images=@hotel1.webp
```

Notes:

- New hotels are not public until an admin changes status to `active`.

### Get My Hotels

| Item | Details |
|---|---|
| Endpoint Name | Get My Hotels |
| HTTP Method | `GET` |
| URL | `/owner/hotels` |
| Description | Lists hotels owned by the authenticated owner. |
| Authentication Requirement | Yes |
| User Role Required | Owner |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `hotels` |
| Related Models | `Hotel` |

Query Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `page` | number | No | Integer >= 1, default 1 |
| `limit` | number | No | Integer 1-100, default 10 |
| `search` | string | No | Trimmed, max 100 |

Success Response:

```json
{
  "success": true,
  "message": "Hotels fetched successfully",
  "data": {
    "allHotels": [],
    "totalHotels": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "hasData": false
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid query |
| 401 | Missing/invalid token |
| 403 | Non-owner role |

Business Logic Summary:

- Filters by owner id.
- Optional search across hotel name and address fields.
- Sorts newest first.

Example Request:

```http
GET /owner/hotels?search=mumbai&page=1&limit=10
Authorization: Bearer <owner-token>
```

Notes:

- Soft-deleted hotels are excluded by Hotel model middleware.

### Get My Hotel By ID

| Item | Details |
|---|---|
| Endpoint Name | Get My Hotel By ID |
| HTTP Method | `GET` |
| URL | `/owner/hotels/:hotelId` |
| Description | Returns a hotel owned by the authenticated owner. |
| Authentication Requirement | Yes |
| User Role Required | Owner of hotel |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `hotels` |
| Related Models | `Hotel` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `hotelId` | ObjectId | Yes | Valid ObjectId; existing non-deleted hotel |

Success Response:

```json
{
  "success": true,
  "message": "Hotel fetched successfully",
  "data": {
    "id": "65b...",
    "owner": "64f..."
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid hotel id |
| 401 | Missing/invalid token |
| 403 | Non-owner role or owner mismatch |
| 404 | Hotel not found |

Business Logic Summary:

- Loads hotel and checks `hotel.owner` equals JWT user id.

Example Request:

```http
GET /owner/hotels/65b000000000000000000000
Authorization: Bearer <owner-token>
```

Notes:

- Owners cannot access other owners' hotels.

### Update Hotel

| Item | Details |
|---|---|
| Endpoint Name | Update Hotel |
| HTTP Method | `PATCH` |
| URL | `/owner/hotels/:hotelId` |
| Description | Updates hotel details and image set. |
| Authentication Requirement | Yes |
| User Role Required | Owner of hotel |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: multipart/form-data` |
| Database Tables Used | `hotels` |
| Related Models | `Hotel` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `hotelId` | ObjectId | Yes | Valid ObjectId; existing non-deleted hotel |

Request Body:

Same fields as create hotel, all optional, at least one validated hotel field required. Additional controller-only field:

| Field | Type | Required | Validation |
|---|---|---|---|
| `deletedImages` | JSON string array | No | Parsed by controller; matching current image URLs are removed |
| `images` | file[] | No | New images, max total remaining plus new is 10 |

Success Response:

```json
{
  "success": true,
  "message": "Hotel updated successfully",
  "data": {
    "id": "65b...",
    "hotelName": "grand hotel",
    "status": "pending",
    "approvedBy": null,
    "images": []
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid body, more than 10 images |
| 401 | Missing/invalid token |
| 403 | Owner mismatch |
| 404 | Hotel not found |
| 409 | Duplicate hotel name and city |

Business Logic Summary:

- Ensures name/city uniqueness when changed.
- Applies partial address updates.
- Removes requested old images and appends new images.
- Resets `status` to `pending` and `approvedBy` to `null` after any update.
- Deletes removed image files after save.

Example Request:

```http
PATCH /owner/hotels/65b000000000000000000000
Authorization: Bearer <owner-token>
Content-Type: multipart/form-data

description=Updated description
deletedImages=["http://localhost:5000/uploads/hotels/old.webp"]
images=@new.webp
```

Notes:

- Updating a hotel requires admin re-approval before public visibility.

### Delete Hotel

| Item | Details |
|---|---|
| Endpoint Name | Delete Hotel |
| HTTP Method | `DELETE` |
| URL | `/owner/hotels/:hotelId` |
| Description | Soft deletes an owned hotel. |
| Authentication Requirement | Yes |
| User Role Required | Owner of hotel |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `hotels` |
| Related Models | `Hotel` |

Success Response:

```json
{
  "success": true,
  "message": "Hotel deleted successfully",
  "data": {
    "id": "65b...",
    "status": "inactive"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid hotel id |
| 401 | Missing/invalid token |
| 403 | Owner mismatch |
| 404 | Hotel not found |

Business Logic Summary:

- Sets `isDeleted = true`, `deletedAt`, and `status = inactive`.

Example Request:

```http
DELETE /owner/hotels/65b000000000000000000000
Authorization: Bearer <owner-token>
```

Notes:

- Existing hotel images are not deleted by this service.

### Create Room

| Item | Details |
|---|---|
| Endpoint Name | Create Room |
| HTTP Method | `POST` |
| URL | `/owner/hotels/:hotelId/rooms` |
| Description | Adds a room to an owned hotel. |
| Authentication Requirement | Yes |
| User Role Required | Owner of hotel |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| Database Tables Used | `rooms`, `hotels` |
| Related Models | `Room`, `Hotel` |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `roomNumber` | string | Yes | Alphanumeric/hyphen, 1-20 chars |
| `type` | string | Yes | `single`, `double`, `suite`, `deluxe`, `family` |
| `description` | string | No | 20-450 chars or empty |
| `price` | number | Yes | Positive, 2 decimal precision |
| `capacity` | number | Yes | Positive integer |
| `amenities` | string[] | No | Unique, max 50 |
| `operationalStatus` | string | No | `available`, `maintenance`, `inactive`; default `available` |

Success Response:

```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "id": "65c...",
    "hotelId": "65b...",
    "roomNumber": "101",
    "type": "double"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid body or duplicate room number for hotel |
| 401 | Missing/invalid token |
| 403 | Owner mismatch |
| 404 | Hotel not found |

Business Logic Summary:

- Creates a room linked to the target hotel.
- Relies on unique partial index `{ hotelId, roomNumber }` for active rooms.

Example Request:

```http
POST /owner/hotels/65b000000000000000000000/rooms
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "roomNumber": "101",
  "type": "double",
  "description": "Comfortable double room with city view",
  "price": 2500,
  "capacity": 2,
  "amenities": ["wifi", "ac"]
}
```

Notes:

- Room image upload is defined in the model but not exposed by current owner routes.

### Update Room

| Item | Details |
|---|---|
| Endpoint Name | Update Room |
| HTTP Method | `PATCH` |
| URL | `/owner/hotels/:hotelId/rooms/:roomId` |
| Description | Updates a room in an owned hotel. |
| Authentication Requirement | Yes |
| User Role Required | Owner of hotel |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| Database Tables Used | `rooms`, `hotels` |
| Related Models | `Room`, `Hotel` |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `type` | string | No | Valid room type |
| `description` | string | No | 20-450 chars or empty |
| `price` | number | No | Positive |
| `capacity` | number | No | Positive integer |
| `amenities` | string[] | No | Unique, max 50 |
| `operationalStatus` | string | No | `available`, `maintenance`, `inactive` |

Success Response:

```json
{
  "success": true,
  "message": "Room updated successfully",
  "data": {
    "id": "65c...",
    "operationalStatus": "maintenance"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid id/body or no valid fields |
| 401 | Missing/invalid token |
| 403 | Owner mismatch |
| 404 | Hotel or room not found |

Business Logic Summary:

- Validates hotel ownership.
- Loads room scoped to hotel.
- Applies only allowed room fields.

Example Request:

```http
PATCH /owner/hotels/65b000000000000000000000/rooms/65c000000000000000000000
Authorization: Bearer <owner-token>
Content-Type: application/json

{
  "operationalStatus": "maintenance"
}
```

Notes:

- `roomNumber` cannot be changed through this endpoint.

### Delete Room

| Item | Details |
|---|---|
| Endpoint Name | Delete Room |
| HTTP Method | `DELETE` |
| URL | `/owner/hotels/:hotelId/rooms/:roomId` |
| Description | Soft deletes a room in an owned hotel. |
| Authentication Requirement | Yes |
| User Role Required | Owner of hotel |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `rooms`, `hotels` |
| Related Models | `Room`, `Hotel` |

Success Response:

```json
{
  "success": true,
  "message": "Room deleted successfully",
  "data": {
    "id": "65c...",
    "operationalStatus": "inactive"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid id |
| 401 | Missing/invalid token |
| 403 | Owner mismatch |
| 404 | Hotel or room not found |

Business Logic Summary:

- Sets `isDeleted = true`, `deletedAt`, and `operationalStatus = inactive`.

Example Request:

```http
DELETE /owner/hotels/65b000000000000000000000/rooms/65c000000000000000000000
Authorization: Bearer <owner-token>
```

Notes:

- Soft-deleted rooms are excluded from public room listing.

### Get Owner Bookings

| Item | Details |
|---|---|
| Endpoint Name | Get Owner Bookings |
| HTTP Method | `GET` |
| URL | `/owner/bookings` |
| Description | Lists bookings for hotels owned by the authenticated owner. |
| Authentication Requirement | Yes |
| User Role Required | Owner |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `hotels`, `bookings`, `users` |
| Related Models | `Hotel`, `Booking`, `User` |

Query Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `status` | string | No | `pending`, `confirmed`, `cancelled`, `expired` |
| `page` | number | No | Integer >= 1, default 1 |
| `limit` | number | No | Integer 1-100, default 10 |

Success Response:

```json
{
  "success": true,
  "message": "Bookings fetched successfully",
  "data": {
    "allBookings": [],
    "totalBookings": 0,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false,
    "hasData": false
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid query |
| 401 | Missing/invalid token |
| 403 | Non-owner role |

Business Logic Summary:

- Gets all active hotel ids for the owner.
- Lists bookings whose `hotelId` is in that set.
- Optionally filters by booking status.
- Populates user and hotel summaries.

Example Request:

```http
GET /owner/bookings?status=confirmed&page=1&limit=10
Authorization: Bearer <owner-token>
```

Notes:

- Owners cannot see bookings for hotels they do not own.

### Get Owner Booking Details

| Item | Details |
|---|---|
| Endpoint Name | Get Owner Booking Details |
| HTTP Method | `GET` |
| URL | `/owner/bookings/:bookingId` |
| Description | Returns a booking if it belongs to one of the owner's hotels. |
| Authentication Requirement | Yes |
| User Role Required | Owner of booking hotel |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `bookings`, `hotels`, `users` |
| Related Models | `Booking`, `Hotel`, `User` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `bookingId` | ObjectId | Yes | Valid ObjectId; existing non-deleted booking |

Success Response:

```json
{
  "success": true,
  "message": "Booking details fetched successfully",
  "data": {
    "id": "65a...",
    "hotelId": {
      "owner": "64f..."
    }
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid booking id |
| 401 | Missing/invalid token |
| 403 | Owner does not own booking hotel |
| 404 | Booking not found |

Business Logic Summary:

- Loads booking with hotel owner populated.
- Ensures `booking.hotelId.owner` equals JWT user id.

Example Request:

```http
GET /owner/bookings/65a000000000000000000000
Authorization: Bearer <owner-token>
```

Notes:

- This is read-only; owner booking status mutation endpoints are not implemented.

## Public Hotel and Room Endpoints

### Get Hotels

| Item | Details |
|---|---|
| Endpoint Name | Get Hotels |
| HTTP Method | `GET` |
| URL | `/hotels` |
| Description | Lists public active hotels with filtering and sorting. |
| Authentication Requirement | No |
| User Role Required | Public |
| Request Headers | None |
| Database Tables Used | `hotels` |
| Related Models | `Hotel` |

Query Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `city` | string | No | Trimmed |
| `country` | string | No | Trimmed |
| `search` | string | No | Trimmed, max 100 |
| `category` | string | No | `luxury`, `budget`, `business`, `family` |
| `amenities` | string | No | Comma-separated; converted to unique lowercase array |
| `page` | number | No | Integer >= 1, default 1 |
| `limit` | number | No | Integer 1-100, default 10 |
| `sort` | string | No | `rating`, `newest`, `oldest` |

Success Response:

```json
{
  "success": true,
  "message": "Hotels fetched successfully",
  "data": {
    "data": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 1
    }
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid query or unsupported sort |
| 500 | Unexpected server error |

Business Logic Summary:

- Only returns hotels with `status: active`.
- Filters city/country in lowercase.
- Filters amenities using `$all`.
- Uses MongoDB text search for `search`; category expands search terms semantically.
- Sorts by text score, rating, newest, or oldest.

Example Request:

```http
GET /hotels?city=mumbai&country=india&amenities=wifi,ac&sort=rating&page=1&limit=10
```

Notes:

- Public listing returns a projection: name, description, address, rating, amenities, images, and category.

### Get Hotel By ID

| Item | Details |
|---|---|
| Endpoint Name | Get Hotel By ID |
| HTTP Method | `GET` |
| URL | `/hotels/:hotelId` |
| Description | Returns public details for an active/non-deleted hotel loaded by id. |
| Authentication Requirement | No |
| User Role Required | Public |
| Request Headers | None |
| Database Tables Used | `hotels` |
| Related Models | `Hotel` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `hotelId` | ObjectId | Yes | Valid ObjectId; existing non-deleted hotel |

Success Response:

```json
{
  "success": true,
  "message": "Hotel fetched successfully",
  "data": {
    "id": "65b...",
    "hotelName": "grand hotel"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid hotel id |
| 404 | Hotel not found |

Business Logic Summary:

- Loads hotel with `validateHotelId`.

Example Request:

```http
GET /hotels/65b000000000000000000000
```

Notes:

- The middleware currently checks existence but does not enforce `status: active`; deleted hotels are excluded by model middleware.

### Get Hotel Rooms

| Item | Details |
|---|---|
| Endpoint Name | Get Hotel Rooms |
| HTTP Method | `GET` |
| URL | `/hotels/:hotelId/rooms` |
| Description | Lists rooms for a hotel with filters and pagination. |
| Authentication Requirement | No |
| User Role Required | Public |
| Request Headers | None |
| Database Tables Used | `hotels`, `rooms` |
| Related Models | `Hotel`, `Room` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `hotelId` | ObjectId | Yes | Valid ObjectId; existing non-deleted hotel |

Query Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `type` | string | No | `single`, `double`, `suite`, `deluxe`, `family` |
| `minPrice` | number | No | >= 0 |
| `maxPrice` | number | No | >= `minPrice` |
| `capacity` | number | No | Positive integer |
| `operationalStatus` | string | No | `available`, `maintenance`, `inactive` |
| `page` | number | No | Integer >= 1, default 1 |
| `limit` | number | No | Integer 1-100, default 10 |

Success Response:

```json
{
  "success": true,
  "message": "Room fetched Successfully",
  "data": {
    "rooms": [],
    "page": 1,
    "limit": 10,
    "totalRooms": 0,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid hotel id or query |
| 404 | Hotel not found |

Business Logic Summary:

- Loads hotel first.
- Queries rooms by hotel id and optional filters.
- Excludes soft-deleted rooms through Room model middleware.

Example Request:

```http
GET /hotels/65b000000000000000000000/rooms?type=double&minPrice=1000&maxPrice=4000
```

Notes:

- Public users may request inactive or maintenance rooms if they pass `operationalStatus`; the default does not restrict to `available`.

### Get Hotel Room By ID

| Item | Details |
|---|---|
| Endpoint Name | Get Hotel Room By ID |
| HTTP Method | `GET` |
| URL | `/hotels/:hotelId/rooms/:roomId` |
| Description | Returns a room by id scoped to a hotel. |
| Authentication Requirement | No |
| User Role Required | Public |
| Request Headers | None |
| Database Tables Used | `hotels`, `rooms` |
| Related Models | `Hotel`, `Room` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `hotelId` | ObjectId | Yes | Valid ObjectId; existing hotel |
| `roomId` | ObjectId | Yes | Valid ObjectId; room belongs to hotel |

Success Response:

```json
{
  "success": true,
  "message": "Room fetched Successfully",
  "data": {
    "id": "65c...",
    "roomNumber": "101",
    "type": "double"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid hotel or room id |
| 404 | Hotel or room not found |

Business Logic Summary:

- Loads hotel, then loads room by room id and hotel id.

Example Request:

```http
GET /hotels/65b000000000000000000000/rooms/65c000000000000000000000
```

Notes:

- Soft-deleted rooms are excluded.

## Booking Endpoints

### Create Booking

| Item | Details |
|---|---|
| Endpoint Name | Create Booking |
| HTTP Method | `POST` |
| URL | `/hotels/:hotelId/bookings` |
| Description | Creates a pending booking hold for a room type in a hotel. |
| Authentication Requirement | Yes |
| User Role Required | Any authenticated user |
| Request Headers | `Authorization: Bearer <token>`, `Content-Type: application/json` |
| Database Tables Used | `hotels`, `rooms`, `bookings` |
| Related Models | `Hotel`, `Room`, `Booking` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `hotelId` | ObjectId | Yes | Valid ObjectId; existing non-deleted hotel |

Request Body:

| Field | Type | Required | Validation |
|---|---|---|---|
| `roomType` | string | Yes | `single`, `double`, `suite`, `deluxe`, `family` |
| `quantity` | number | Yes | Integer 1-20 |
| `checkIn` | ISO date | Yes | Date >= now |
| `checkOut` | ISO date | Yes | Greater than `checkIn` |
| `numberOfGuests` | number | Yes | Integer >= 1 |

Success Response:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "65a...",
    "hotelId": "65b...",
    "userId": "64f...",
    "roomType": "double",
    "quantity": 1,
    "totalPrice": 5000,
    "paymentStatus": "none",
    "status": "pending",
    "expiresAt": "2026-06-25T10:10:00.000Z"
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid body, too many guests, invalid date logic |
| 401 | Missing/invalid token |
| 404 | Hotel or available room type not found |
| 409 | Not enough rooms available |

Business Logic Summary:

- Starts a MongoDB transaction.
- Finds an available non-deleted room matching `roomType`.
- Calculates nights using UTC day boundaries.
- Counts overlapping confirmed bookings and non-expired pending holds.
- Counts total rooms of requested type.
- Rejects if requested quantity exceeds available inventory.
- Rejects if guests exceed `room.capacity * quantity`.
- Computes total price as `room.price * nights * quantity`.
- Creates a pending booking with `paymentStatus: none` and `expiresAt` 10 minutes in the future.

Example Request:

```http
POST /hotels/65b000000000000000000000/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomType": "double",
  "quantity": 1,
  "checkIn": "2026-07-01T00:00:00.000Z",
  "checkOut": "2026-07-03T00:00:00.000Z",
  "numberOfGuests": 2
}
```

Notes:

- Pending holds expire automatically through the cron job.
- The endpoint does not check hotel status explicitly; `validateHotelId` loads any non-deleted hotel.

## Payment Endpoints

### Create Payment

| Item | Details |
|---|---|
| Endpoint Name | Create Payment |
| HTTP Method | `POST` |
| URL | `/bookings/:bookingId/payments` |
| Description | Creates a local payment record and Razorpay order for a pending booking. |
| Authentication Requirement | Yes |
| User Role Required | Booking owner |
| Request Headers | `Authorization: Bearer <token>`, `Idempotency-Key: <unique-key>` |
| Database Tables Used | `bookings`, `payments` |
| Related Models | `Booking`, `Payment` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `bookingId` | ObjectId | Yes | Valid ObjectId; existing booking |

Request Body:

None.

Validation Rules:

- `Idempotency-Key` header is required.
- Booking must belong to the authenticated user due to repository filter.
- Booking must be `pending`, `paymentStatus: none`, and not expired beyond grace period.
- No pending or paid payment may already exist for the booking.

Success Response:

```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "65d...",
      "bookingId": "65a...",
      "userId": "64f...",
      "amount": 5000,
      "currency": "INR",
      "status": "pending"
    },
    "order": {
      "id": "order_razorpay_id",
      "amount": 500000,
      "currency": "INR"
    }
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Missing idempotency key, booking unavailable/expired, payment already exists |
| 401 | Missing/invalid token |
| 404 | Booking not found |
| 500 | Razorpay order creation failure or unexpected error |

Business Logic Summary:

- Uses idempotency key to return existing payment/order when available.
- Locks booking by setting `paymentStatus: initiated`.
- Creates pending payment with booking total price.
- Creates Razorpay order with amount converted to paise.
- Stores Razorpay order id on the payment.
- If Razorpay order creation fails, marks payment failed and resets booking payment status to `none`.

Example Request:

```http
POST /bookings/65a000000000000000000000/payments
Authorization: Bearer <token>
Idempotency-Key: booking-65a-pay-1
```

Notes:

- The `validateBookingId` middleware loads the booking but ownership is ultimately enforced by the payment service's lock query using `userId`.

### Get Payment

| Item | Details |
|---|---|
| Endpoint Name | Get Payment |
| HTTP Method | `GET` |
| URL | `/payments/:paymentId` |
| Description | Returns a payment belonging to the authenticated user. |
| Authentication Requirement | Yes |
| User Role Required | Payment owner |
| Request Headers | `Authorization: Bearer <token>` |
| Database Tables Used | `payments`, `bookings`, `users` |
| Related Models | `Payment`, `Booking`, `User` |

Path Parameters:

| Field | Type | Required | Validation |
|---|---|---|---|
| `paymentId` | ObjectId | Yes | Valid ObjectId; payment belongs to authenticated user |

Success Response:

```json
{
  "success": true,
  "data": {
    "id": "65d...",
    "amount": 5000,
    "currency": "INR",
    "status": "pending",
    "bookingId": {
      "userId": "64f...",
      "hotelId": "65b..."
    },
    "userId": {
      "firstName": "Ahmed",
      "lastName": "Mochi",
      "email": "ahmed@example.com"
    }
  }
}
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Invalid payment id |
| 401 | Missing/invalid token |
| 404 | Payment not found or not owned by user |

Business Logic Summary:

- Loads payment by id and user id.
- Populates booking and user summary details.

Example Request:

```http
GET /payments/65d000000000000000000000
Authorization: Bearer <token>
```

Notes:

- Only the payment owner can retrieve the payment.

### Razorpay Payment Webhook

| Item | Details |
|---|---|
| Endpoint Name | Razorpay Payment Webhook |
| HTTP Method | `POST` |
| URL | `/webhooks/payments` |
| Description | Receives Razorpay payment events and confirms or fails internal payments/bookings. |
| Authentication Requirement | HMAC signature |
| User Role Required | Razorpay |
| Request Headers | `X-Razorpay-Signature: <signature>`, `Content-Type: application/json` |
| Database Tables Used | `payments`, `bookings` |
| Related Models | `Payment`, `Booking` |

Request Body:

Razorpay webhook payload. The implementation reads:

```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_razorpay_id",
        "notes": {
          "paymentId": "65d...",
          "bookingId": "65a...",
          "userId": "64f..."
        }
      }
    }
  }
}
```

Validation Rules:

- Raw request body is required for HMAC.
- `x-razorpay-signature` must match HMAC SHA-256 using `RAZORPAY_WEBHOOK_SECRET`.
- Only `payment.captured` and `payment.failed` are processed.

Success Response:

```json
{
  "success": true
}
```

Ignored Event Response:

```http
HTTP/1.1 200 OK
```

Error Responses:

| Status | Cause |
|---|---|
| 400 | Missing signature |
| 401 | Invalid signature |
| 500 | Processing error; returned intentionally so Razorpay retries |

Business Logic Summary:

- Verifies Razorpay signature using raw body.
- Parses payload only after signature validation.
- For `payment.captured`, marks payment `paid` and booking `confirmed` with `paymentId`.
- For `payment.failed`, marks payment `failed` and resets booking payment status to `none`.
- Uses transactions and idempotent update guards.

Example Request:

```http
POST /webhooks/payments
Content-Type: application/json
X-Razorpay-Signature: <computed-signature>

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_123",
        "notes": {
          "paymentId": "65d000000000000000000000"
        }
      }
    }
  }
}
```

Notes:

- This route is mounted before JSON parsing with `express.raw({ type: "application/json" })`.
- The endpoint returns `500` on processing errors to trigger Razorpay retry behavior.

## Health Endpoint

### Health Check

| Item | Details |
|---|---|
| Endpoint Name | Health Check |
| HTTP Method | `GET` |
| URL | `/health` |
| Description | Confirms the API process is running. |
| Authentication Requirement | No |
| User Role Required | Public |
| Request Headers | None |
| Path Parameters | None |
| Query Parameters | None |
| Request Body | None |
| Validation Rules | None |
| Success Response | `{ "status": "OK", "message": "API is running" }` |
| Error Responses | Standard Express/server errors only |
| Status Codes | `200` |
| Business Logic Summary | Returns a static JSON health response. |
| Database Tables Used | None |
| Related Models | None |

Example Request:

```http
GET /health
```

Example Response:

```json
{
  "status": "OK",
  "message": "API is running"
}
```

Notes:

- This does not verify database connectivity.

## Background Jobs

### Booking and Payment Expiration

Runs every minute using `node-cron`.

Business logic:

- Marks pending bookings with `expiresAt < now` as `expired`.
- Marks pending payments with `expiresAt < now` as `failed`.
- Sets failed payment `failureReason` to `expired`.
- Uses a MongoDB transaction.
- Prevents overlapping job runs with an in-memory `isRunning` flag.

## API Status Code Summary

| Status | Meaning |
|---|---|
| `200` | Successful read/update/delete or ignored webhook |
| `201` | Resource created |
| `400` | Validation error, invalid id, invalid business state |
| `401` | Missing/invalid JWT or invalid webhook signature |
| `403` | Authenticated but not authorized |
| `404` | Resource or route not found |
| `409` | Duplicate resource, availability conflict, or already processed state |
| `429` | Login rate limit exceeded |
| `500` | Unexpected server error or webhook retry trigger |

## Implementation Notes and Risks

- `validateUserIdIncludingDeleted` is written with a `router.param`-style signature but used as route middleware in admin routes. This likely prevents `GET /admin/users/:userId` and `PATCH /admin/users/:userId/restore` from working as intended.
- Public `GET /hotels/:hotelId` and booking creation load any non-deleted hotel; they do not explicitly require `status: active`.
- Public room listing can return `maintenance` or `inactive` rooms if requested by query.
- Room model supports `images`, but current owner room create/update routes do not upload or update room images.
- Hotel deletion does not remove hotel image files from disk.
- Payment creation uses idempotency but `getExistingOrder` returns amount in rupees from local payment, while Razorpay order creation returns amount in paise.
