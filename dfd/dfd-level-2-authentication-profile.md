# EstateHub DFD Level 2 — 1.0 User Authentication & Profile

## Boundary flow

Input: registration data, login credentials, OTP/resend request, or profile/password change.

Output: registration/verification result, JWT-cookie session, updated profile, or OTP email.

## Subprocesses

| No. | Subprocess | Flow |
| --- | --- | --- |
| 1.1 | Register Account | Receive username, email, password → validate → create User in D1 → return account result. |
| 1.2 | Authenticate User | Receive credentials → validate against D1 Users → generate JWT/cookie session → return session. |
| 1.3 | Verify Email / Resend OTP | Receive OTP or resend action → read/update D1 UserProfile verification state → send OTP using Email Service when required → return result. |
| 1.4 | Manage Profile and Password | Receive authenticated change → validate → update D1 User/UserProfile → return updated data. |
| 1.5 | Identify Agent Role | Read `UserProfile.is_agent` from D1 → return authorization context for property actions. |

Data store: D1 Django Database (Users and UserProfiles). External entity: Email Service for OTP delivery.
