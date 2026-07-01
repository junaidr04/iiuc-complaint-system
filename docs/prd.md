Requirements Document
1. Application Overview
Application Name: University Complaint Management System

Description: A web-based complaint management platform for universities, enabling students to submit and track complaints, authorities to manage assigned complaints, and administrators to oversee the entire system with analytics and user management capabilities.

2. Users and Usage Scenarios
2.1 Target Users
Students: Submit complaints, track status, view notifications
Authorities: Review and update status of assigned complaints
Administrators: Manage system, departments, users, and view analytics
2.2 Core Usage Scenarios
Students submit complaints about campus issues and track resolution progress
Authorities receive assigned complaints and update their status
Administrators monitor system performance and manage resources
3. Page Structure and Functionality
3.1 Page Hierarchy
├── Authentication Pages
│   ├── Registration Page
│   ├── Login Page
│   └── Google Sign-In Integration
├── Student Portal
│   ├── Student Dashboard
│   ├── Submit Complaint Page
│   ├── My Complaints Page
│   └── Complaint Details Page
├── Authority Portal
│   ├── Authority Dashboard
│   └── Assigned Complaints Management
├── Admin Portal
│   ├── Admin Dashboard
│   ├── All Complaints View
│   ├── Department Management
│   ├── User Management
│   └── System Analytics
└── Common Components
    ├── Sidebar Navigation
    ├── Top Navbar
    └── Notification Center
3.2 Authentication Pages
3.2.1 Registration Page
User inputs: Name, Email, Password, Department, Role selection
Upload profile image
Submit registration
Redirect to login after successful registration
3.2.2 Login Page
Email and password login
Google Sign-In button
Redirect to role-specific dashboard after authentication
3.2.3 Logout
User can logout from any page
Clear authentication session
Redirect to login page
3.3 Student Portal
3.3.1 Student Dashboard
Display statistics:
Total Complaints
Pending Complaints
In Review Complaints
Resolved Complaints
Show recent notifications list
Quick access to submit new complaint
3.3.2 Submit Complaint Page
Input fields:
Title (required)
Category selection (required)
Description (required)
Department selection (required)
Image upload (optional, drag & drop supported)
Anonymous toggle (optional)
Image preview before submission
Form validation
Submit complaint
Display success message after submission
3.3.3 My Complaints Page
Display all complaints submitted by the student
Each complaint card shows:
Title
Status badge (Pending/In Review/Resolved)
Department
Created date
Upvote count
View details button
Search complaints by title or description
Filter by status, department, date range
Pagination for complaint list
3.3.4 Complaint Details Page
Display full complaint information:
Title
Category
Description
Uploaded image (if any)
Department
Current status
Created date
Upvote count
Timeline showing status progression (Pending → In Review → Resolved)
Comments section displaying all comments
Upvote button (student can upvote once)
Real-time updates when status or comments change
3.4 Authority Portal
3.4.1 Authority Dashboard
Display all complaints assigned to the authority
Each complaint shows:
Title
Status
Department
Created date
Student name (if not anonymous)
Search complaints
Filter by status, date
Sort by date, upvotes
3.4.2 Assigned Complaints Management
View complaint details
Update complaint status:
Change from Pending to In Review
Change from In Review to Resolved
Add comments to complaints
View complaint timeline
3.5 Admin Portal
3.5.1 Admin Dashboard
Display system-wide statistics:
Total complaints
Total users
Total departments
Complaints by status
Quick access to management sections
3.5.2 All Complaints View
Display all complaints in the system
Search, filter, sort functionality
View complaint details
Assign complaints to authorities
3.5.3 Department Management
View all departments
Add new department (Name, Description)
Edit department information
Delete department
Assign authority to department
3.5.4 User Management
View all users (Students, Authorities, Admins)
Search users by name or email
Filter by role, department
Change user role
Delete user account
3.5.5 System Analytics
Pie chart: Complaint status distribution
Bar chart: Department-wise complaint count
Line chart: Monthly complaint trends
Export analytics data
3.6 Common Components
3.6.1 Sidebar Navigation
Role-based menu items
Active page indicator
Collapsible on mobile
3.6.2 Top Navbar
User profile display
Notification icon with unread count
Dark mode toggle
Logout button
3.6.3 Notification Center
Display all notifications for the user
Mark notifications as read
Real-time notification updates via Socket.io
Notification types:
Complaint status changed
New comment on complaint
Complaint assigned (for authorities)
Complaint resolved
4. Business Rules and Logic
4.1 Authentication and Authorization
Users must register with email and password or Google Sign-In
Each user has one role: Student, Authority, or Admin
Role determines accessible pages and features
Protected routes require valid authentication token
Server verifies Firebase token for all API requests
4.2 Complaint Lifecycle
Initial status: Pending
Status progression: Pending → In Review → Resolved
Only assigned authority can update complaint status
Status changes trigger notifications to complaint creator
Timeline records all status changes with timestamps
4.3 Anonymous Complaints
Students can toggle anonymous option when submitting
Anonymous complaints hide student name from authorities
Student can still view and track their anonymous complaints
Admin can view student information for all complaints
4.4 Upvoting
Each student can upvote a complaint once
Upvote count displayed on complaint cards and details
Students cannot upvote their own complaints
4.5 Comments
Authorities and admins can add comments to complaints
Comments visible to complaint creator and all authorities/admins
New comments trigger notifications
4.6 Department Assignment
Each complaint belongs to one department
Each department has one assigned authority
Admin can reassign authority to different department
Complaints automatically assigned to department's authority
4.7 Notifications
Real-time notifications delivered via Socket.io
Notifications stored in database
Unread notifications shown with badge count
Toast notifications appear for new events
4.8 Image Upload
Students can upload one image per complaint
Image stored via Cloudinary
Image URL saved in complaint record
Image displayed in complaint details
4.9 Data Storage
User data stored with Firebase UID reference
Complaints linked to user via Created By field
Departments linked to assigned authority
Notifications linked to receiver user
5. Exceptions and Edge Cases
Scenario	Handling
User submits complaint without required fields	Display validation error, prevent submission
User tries to access unauthorized page	Redirect to login or role-appropriate dashboard
Authority updates status to invalid transition	Display error message, prevent update
User uploads oversized image	Display error, prompt to upload smaller image
Network error during complaint submission	Display error message, allow retry
No complaints to display	Show empty state with message
User tries to upvote same complaint twice	Prevent action, show message
Admin deletes department with existing complaints	Prevent deletion or reassign complaints first
Real-time notification fails to deliver	Store in database, display on next page load
User changes role while logged in	Require re-login to apply new role
6. Acceptance Criteria
Student registers with email and password, logs in successfully
Student navigates to Submit Complaint page, fills all required fields, uploads image, submits complaint
Student views submitted complaint in My Complaints page with "Pending" status
Authority logs in, views assigned complaint in dashboard
Authority opens complaint details, changes status to "In Review"
Student receives real-time notification of status change
Authority changes status to "Resolved"
Student views complaint details showing "Resolved" status and complete timeline
7. Out of Scope for This Release
Email notifications (only in-app and real-time notifications)
SMS notifications
Multi-language support
Complaint priority levels
Complaint escalation workflow
Complaint reassignment between authorities
Bulk complaint operations
Advanced analytics (predictive analysis, AI insights)
Mobile native applications
Complaint attachments beyond single image
Video or audio attachments
Complaint templates
Scheduled reports
Integration with external ticketing systems
Public complaint viewing
Complaint voting by authorities
Complaint merging or linking
Custom notification preferences
Complaint archiving
Data export for individual users