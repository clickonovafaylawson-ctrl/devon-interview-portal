
# Security Measures Implemented in DevOn Interview Portal

This document outlines the current security measures and user interaction safeguards implemented in the DevOn Interview Portal. It is intended for executive leadership review and highlights the application's commitment to protecting candidate data and ensuring a secure, tamper-resistant user experience.

---

## 1. User Interface Security Restrictions

### a. Right-Click and Context Menu Disabled
- **Description:**
	- The application globally disables the browser right-click context menu.
	- Prevents users from easily accessing browser features such as "Inspect Element" or copying sensitive content.
- **Implementation:**
	- A client-side React component (`DisableInspect`) attaches a `contextmenu` event listener to the document, calling `preventDefault()` on all right-clicks.

### b. Developer Tools Shortcut Blocking
- **Description:**
	- Common keyboard shortcuts for opening browser developer tools are blocked, including:
		- F12
		- Ctrl+Shift+I (Inspect)
		- Ctrl+Shift+J (Console)
		- Ctrl+U (View Source)
- **Implementation:**
	- The same `DisableInspect` component listens for `keydown` events and prevents default actions for these key combinations.

### c. Prevention Scope
- **Coverage:**
	- These restrictions are applied globally across the entire application, ensuring consistent enforcement on all pages and steps.

---

## 2. Confirmation Modals for Sensitive Actions

To prevent accidental or unauthorized actions, confirmation modals are presented to users at critical steps:

### a. Email Override on Duplicate Submission
- **Scenario:**
	- If a candidate attempts to submit the basic information form with an email address that already exists in the system, a modal appears.
- **Modal Purpose:**
	- Informs the user that submitting again will override their previous application.
	- Requires explicit confirmation before proceeding with the override.

### b. Cancel/Restart Confirmation
- **Scenario:**
	- If a candidate attempts to cancel or restart the interview process (e.g., on the final submission step), a confirmation modal is shown.
- **Modal Purpose:**
	- Prevents accidental loss of progress or data.
	- Requires the user to confirm their intent before the action is executed.

### c. Video Instruction Modal
- **Scenario:**
	- Before starting the video recording/upload step, a modal with instructions and guidelines is displayed.
- **Modal Purpose:**
	- Ensures the candidate is aware of the requirements and process before proceeding.
	- User must acknowledge and close the modal to continue.

---

## 3. Additional Security and UX Safeguards

- **Field Validation and Highlighting:**
	- All form fields are validated in real-time, with errors and missing fields highlighted to prevent incomplete or invalid submissions.
- **File Upload Restrictions:**
	- Resume and video uploads are restricted by file type and size, reducing the risk of malicious files.
- **Session State Management:**
	- Application state is managed to prevent users from skipping steps or accessing unauthorized parts of the flow.

---

## 4. Executive Summary

The DevOn Interview Portal employs multiple layers of security and user interaction safeguards, including:
- Disabling browser features that could expose sensitive data or application logic
- Blocking common developer tool shortcuts
- Requiring explicit user confirmation for sensitive or irreversible actions
- Enforcing strict validation and file upload rules

These measures demonstrate a proactive approach to protecting candidate data and maintaining the integrity of the interview process.

---

*This document will be updated as additional security features are implemented or existing measures are enhanced.*
