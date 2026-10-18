# IDOR demo

Demonstrates that a signed-in user cannot access other user's session, plan, goal, or calendar.

## What to do

1. Start the app and open the API documentation at
   `http://localhost:8000/docs`.

2. Register two test accounts in /auth/register/ by clicking **Try it out**: **User A**, **User B**  
- Example values for **Request body**
```json
{
  "email": "userA@example.com",
  "password": "userA",
  "display_name": "User A"
}
```

3. In `/docs`, use `POST /auth/login` to log in as **User A**. Copy
   `access_token` from the response, click **Authorize**, and enter it in the
   authorization dialog.

4. Create User A's test records. IDs for the records themselves are generated
   by the API and returned in each response.  
      **Note.** IDs in a request body are
      references to records that already exist: replace Swagger's sample UUIDs
      with real IDs, or omit optional references.

   1. Create a plan with `POST /plans`. For example:
      ```json
      {
        "name": "IDOR demo A plan"
      }
      ```
      Copy and save the returned plan `id` for later use.

   2. Get catalog IDs with `GET /activity-types`. Choose an activity and oneof its linked units from `unit_link`; the unit's ID is`unit_link[].unit_type.id`.
 
   3. Create a goal with `POST /goal` (the route is singular). For example,
      replace the UUID with a real unit ID from the activity type response:
      ```json
      {
        "unit_type_id": "[unit_type_id]",
        "target_value": 10,
        "period": "week"
      }
      ```
      Copy the returned goal `id`.

   4. Create a dated session with `POST /sessions`. A basic session needs no
      plan, activity, or unit IDs:
      ```json
      {
        "name": "IDOR demo A session",
        "session_at": "[ISO 8601 date/time]",
        "status": "planned",
        "items": []
      }
      ```
      For this minimal request, leave out `plan_id` and keep `items` empty.
      If you choose to link a plan, use the plan ID returned in step 4.1. If
      you add session items or measurements, use existing `activity_type_id`
      and `unit_type_id` values from the catalog response.  
      The session ID, item IDs, and measurement IDs are generated when saved.  
      Copy the returned session `id` and `session_at`.

5. Record the IDs and date/time returned:

   | Object | User A's ID |
   | ------ | ----------- |
   | Session | `[session_id]` |
   | Plan | `[plan_id]` | 
   | Goal | `[goal_id]` |
   | Session At | `[session_at]` |

6. In `/docs`, log in as **User B** and authorize with User B's bearer token.
   Verify that you are logged in as **User B** with `GET /auth/me`.

## Try User A's IDs while authenticated as User B

- As **User B** use **Try it out** with the **User A** IDs for the requests below in `/docs`.  
- For update requests, use a harmless change and note whether the server rejects it.  
- Afterwards verify as **User A** that the original record was not changed.

| Object | Request | Expected result |
| ------ | ------- | --------------- |
| Session | `GET /sessions/{session_id}` | Rejected; no User A data returned |
| Session | `PATCH /sessions/{session_id}` | Rejected; User A's session unchanged |
| Session | `DELETE /sessions/{session_id}` | Rejected; User A's session still exists |
| Plan | `GET /plans/{plan_id}` | Rejected; no User A data returned |
| Plan | `PATCH /plans/{plan_id}` | Rejected; User A's plan unchanged |
| Plan | `DELETE /plans/{plan_id}` | Rejected; User A's plan still exists |
| Goal | `GET /goal/{goal_id}` | Rejected; no User A data returned |
| Goal | `PATCH /goal/{goal_id}` | Rejected; User A's goal unchanged |
| Goal | `DELETE /goal/{goal_id}` | Rejected; User A's goal still exists |

Also check the collection endpoints as **User B**:

- `GET /sessions` must not include User A's session.
- `GET /plans` must not include User A's plan.
- `GET /goal` must not include User A's goal.
- `GET /calendar?from=[start]&to=[end]&plan_id=[plan_id]`
   - With a range containing User A's session.
     - You can use the `from`:`session_at`and `to`: add a day or a month to the previous value .  
   - Response must not include that session or any other User A data.  

Record the actual status and result for each request below. If an endpoint or
operation is not available in this app version, note that rather than counting it as a pass.

## Results

| Object / request | Actual status | Result (no foreign data / unchanged?) | Pass? |
| --------------- | ------------- | ------------------------------------ | ----- |
| Session GET | `[status]` | `[observation]` | `[yes/no]` |
| Session PATCH | `[status]` | `[observation]` | `[yes/no]` |
| Session DELETE | `[status]` | `[observation]` | `[yes/no]` |
| Plan GET | `[status]` | `[observation]` | `[yes/no]` |
| Plan PATCH | `[status]` | `[observation]` | `[yes/no]` |
| Plan DELETE | `[status]` | `[observation]` | `[yes/no]` |
| Goal GET | `[status]` | `[observation]` | `[yes/no]` |
| Goal PATCH | `[status]` | `[observation]` | `[yes/no]` |
| Goal DELETE | `[status]` | `[observation]` | `[yes/no]` |
| Sessions list | `[status]` | `[User A session absent?]` | `[yes/no]` |
| Plans list | `[status]` | `[User A plan absent?]` | `[yes/no]` |
| Goals list (`GET /goal`) | `[status]` | `[User A goal absent?]` | `[yes/no]` |
| Calendar with User A plan ID | `[status]` | `[User A session absent?]` | `[yes/no]` |

## Status convention choice

This API uses status code:**`[404]`** for requests that target an object owned by another user.
A `404 Not Found` hides whether the foreign object exists.
