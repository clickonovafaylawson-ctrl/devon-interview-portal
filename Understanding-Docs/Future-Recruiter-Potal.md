# DevOn-Recruiter-Portal: Future Planning & Architecture

## Overview

The DevOn-Recruiter-Portal will be a separate application designed for internal reviewers/recruiters. It will:
- Share the same PocketBase database as the DevOn Interview Portal
- Allow authenticated reviewers to view all candidate submissions
- Enable reviewers to view resumes and videos, and add ratings/comments to help with shortlisting
- Maintain a consistent look & feel with the Interview Portal (shared design system)

## Database Design & Access

### Shared Collections
- **candidates**: Read-only for reviewers. Contains all candidate submissions (personal info, resume, video, etc.)

### New Collections
- **reviewer**: Stores reviewer ratings and comments for each candidate
  - Fields:
    - `id` (auto)
    - `candidate_email` (string, foreign key to candidates.email)
    - `reviewer_email` (string, foreign key to users.email)
    - `rating` (number)
    - `comments` (text)
    - `created` (timestamp)
    - `updated` (timestamp)

### User Authentication
- **Recruiter Portal Users**: Authenticated via email/password (PocketBase users collection)
  - 5 login attempts allowed before lockout
  - Only reviewers can log in to the Recruiter Portal

### Access Control
- **candidates collection**: Reviewer users have read-only access
- **reviewer collection**: Reviewer users have read/write access (can add/edit their own ratings/comments)
- **candidates collection**: Candidates (from Interview Portal) can only create their own record, no read access

### Relational Link
- Use `email` as the primary key to relate candidates and reviewer feedback
- Each review references a candidate by email (or candidate id if preferred)

## PocketBase User Roles & Permissions

### For Interview Portal (Current)
- No authentication for candidates (public create access to candidates collection)
- Candidates cannot read or update any records

### For Recruiter Portal (Planned)
- Reviewer users must log in (PocketBase users collection)
- Reviewer users:
  - Can read all records in candidates collection
  - Can create and update their own records in reviewer collection
  - Cannot modify candidate data

## UI/UX
- Recruiter Portal will use the same design system, color palette, and component library as the Interview Portal for visual consistency

## Next Steps / Open Questions
- Define detailed API rules for reviewer and candidates collections
- Decide on reviewer registration/invitation flow
- Plan for reviewer dashboard, filtering, and search features
- Consider audit logging for reviewer actions
- Extend reviewer collection for more advanced feedback in the future

---

This file will be extended as the DevOn-Recruiter-Portal project evolves. For now, it documents the initial architecture, access control, and design alignment with the Interview Portal.