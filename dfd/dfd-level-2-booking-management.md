# EstateHub DFD Level 2 — 4.0 Booking Management

## Boundary flow

Input: viewing booking request, cancellation request, or agent viewing-status update.

Output: booking confirmation, existing booking, cancellation result, updated status, or booking list.

## Subprocesses

| No. | Subprocess | Flow |
| --- | --- | --- |
| 4.1 | Create Booking Request | Buyer submits property ID and requested viewing date with JWT session context. |
| 4.2 | Validate Booking | Read D2 Properties to confirm property exists; read D2 Bookings to check whether this buyer has already booked it. |
| 4.3 | Store or Return Booking | Write a `pending` booking with the authenticated buyer ID to D2 Bookings, or return the duplicate booking already found. |
| 4.4 | Update Viewing Status | Agent submits booking ID and status → read booking/property → validate property-agent ownership → update D2 Bookings → return updated booking. |
| 4.5 | Cancel Booking | Buyer submits booking ID → validate booking buyer ID → delete booking from D2 → return cancellation result. |

Data store: D2 Property Database (Properties and Bookings).

## Accuracy note

The current implementation does not send notifications for booking creation, status updates, or cancellation. Do not diagram a booking-notification subprocess unless it is explicitly marked as a planned enhancement.
