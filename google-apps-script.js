/**
 * =========================================================================================
 * APEX ARCHITECTURE & ENGINEERING - GOOGLE SHEET BACKEND WITH AUTOMATIC NOTIFICATIONS
 * Version: 2.1-bulletproof
 * =========================================================================================
 * 
 * FEATURES:
 * 1. Initializes all 4 tabs: Tasks, Staff Roster, Notification Log, Activity Audit
 * 2. Formats headers, colors, dropdowns, and column widths (with non-blocking validation)
 * 3. doPost(e) Webhook: Receives live updates from the Next.js frontend
 * 4. AUTOMATIC EMAIL DISPATCH: Whenever a task is assigned or updated, Google Sheets
 *    natively emails the assigned architect/engineer directly with deliverable details!
 * 5. Multi-engine mailing: Uses MailApp with GmailApp fallback for 100% reliability.
 * 6. Detailed JSON response: Returns status, emailsSent array, and any errors.
 *
 * HOW TO UPDATE AND ACTIVATE (MANDATORY STEPS):
 * -----------------------------------------------------------------------------------------
 * Step 1: Open your Google Sheet -> Click Extensions > Apps Script
 * Step 2: Select all existing code (Ctrl+A), delete it, and paste this ENTIRE file
 * Step 3: Click Save (💾 or Ctrl+S)
 * Step 4: [CRITICAL - GRANT PERMISSIONS]:
 *         In the function dropdown at the top (next to "Debug"), select:
 *         "sendTestAssignmentNotification"
 *         Click "▷ Run".
 *         Google will pop up "Authorization required".
 *         Click "Review permissions" -> Select your Google Account -> Click "Advanced" ->
 *         Click "Go to Task Handler (unsafe)" -> Click "Allow".
 *         You will immediately receive a test email in your Gmail inbox!
 * Step 5: [CRITICAL - DEPLOY NEW VERSION]:
 *         Click "Deploy" (top right) -> "Manage deployments"
 *         Click the Pencil icon (✏️ Edit) next to your Web App
 *         In the "Version" dropdown, select "New version"
 *         Click "Deploy"
 * =========================================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📐 A&E Operations Hub')
    .addItem('🚀 Initialize / Reset All 4 Tabs', 'initializeOperationsSheet')
    .addItem('✉️ Send Test Assignment Email to Me', 'sendTestAssignmentNotification')
    .addItem('🧹 Reset Notification Sent Memory', 'clearSentNotificationHistory')
    .addToUi();
}

/**
 * Initializes all 4 tabs with formatted headers, styles, dropdown validations, and sample data.
 */
function initializeOperationsSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Initialize Tasks Tab
  var tasksSheet = getOrCreateSheet(ss, 'Tasks');
  setupTasksSheet(tasksSheet);

  // 2. Initialize Staff Roster Tab
  var staffSheet = getOrCreateSheet(ss, 'Staff Roster');
  setupStaffSheet(staffSheet);

  // 3. Initialize Notification Log Tab
  var notifSheet = getOrCreateSheet(ss, 'Notification Log');
  setupNotificationsSheet(notifSheet);

  // 4. Initialize Activity Audit Tab
  var auditSheet = getOrCreateSheet(ss, 'Activity Audit');
  setupActivitySheet(auditSheet);

  // Remove default 'Sheet1' if present
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {}
  }

  tasksSheet.activate();
  
  SpreadsheetApp.getActiveSpreadsheet().toast(
    'All 4 A&E Operations tabs initialized with headers, dropdowns, and formatting!',
    '✅ Setup Complete',
    8
  );
}

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Format Tasks Sheet
 */
function setupTasksSheet(sheet) {
  sheet.clear();
  
  var headers = [
    'Task ID',
    'Deliverable / Title',
    'Discipline',
    'Assignee Name',
    'Assignee Email',
    'Status',
    'Priority',
    'Engineering Review Liability',
    'Project Code & Name',
    'CAD / BIM Model Ref',
    'Estimated Hours',
    'Subtasks Done / Total',
    'Due Date',
    'Created At',
    'Last Updated'
  ];

  var sampleData = [
    [
      'task-101',
      'Review 3D ETABS Seismic Shear Wall Calculations & Stamped Report - Tower Core',
      'Structural Engineering',
      'Dr. Jonathan Vance, PE, SE',
      'jonathan.vance@apexconstruct.demo',
      'IN_PROGRESS',
      'CRITICAL',
      'High Engineering Liability',
      'AST-P3 - Apex Skyline Tower (Phase 3)',
      'ETABS Model v22.4 / Sheet S-201',
      28,
      '2/4',
      '2026-10-24',
      new Date().toISOString(),
      new Date().toISOString()
    ],
    [
      'task-102',
      'Revit Architectural Shell & Core LOD 350 Model Coordination for Permit Submission',
      'Architectural Design',
      'Sophia Al-Mansoor, AIA',
      'sophia.almansoor@apexconstruct.demo',
      'READY',
      'HIGH',
      'Permit Critical',
      'AST-P3 - Apex Skyline Tower (Phase 3)',
      'Sheets A-101 through A-140',
      32,
      '1/3',
      '2026-10-22',
      new Date().toISOString(),
      new Date().toISOString()
    ],
    [
      'task-103',
      'MEP Chilled Water Pipe Routing Clash Detection & Energy Model Simulation',
      'MEP Engineering',
      'Liam Tanaka, PE',
      'liam.tanaka@apexconstruct.demo',
      'IN_PROGRESS',
      'HIGH',
      'Code Compliance Review',
      'SJH-EXP - St. Jude Hospital West Wing Expansion',
      'Revit MEP-601 / Clash Report #14',
      20,
      '1/3',
      '2026-10-26',
      new Date().toISOString(),
      new Date().toISOString()
    ],
    [
      'task-104',
      'Prepare Life Safety & Egress Capacity Calculations for IBC Chapter 10 Permit Review',
      'Building Code & Permitting',
      'Elena Rostova, RA',
      'elena.rostova@apexconstruct.demo',
      'INSPECTION',
      'CRITICAL',
      'Permit Critical',
      'AST-P3 - Apex Skyline Tower (Phase 3)',
      'Life Safety Plan LS-101 to LS-105',
      16,
      '2/3',
      '2026-10-21',
      new Date().toISOString(),
      new Date().toISOString()
    ]
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);

  formatHeaderRow(sheet, 1, headers.length, '#1B4332'); // Deep Emerald
  sheet.setFrozenRows(1);
  sheet.getRange(2, 1, 100, headers.length).setFontFamily('Roboto').setFontSize(10);

  // Set dropdowns with setAllowInvalid(true) so external writes never throw fatal validation errors
  setDropdownValidation(sheet, 'F2:F500', ['BACKLOG', 'READY', 'IN_PROGRESS', 'INSPECTION', 'COMPLETED']);
  setDropdownValidation(sheet, 'G2:G500', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
  setDropdownValidation(sheet, 'H2:H500', ['Code Compliance Review', 'Permit Critical', 'High Engineering Liability', 'Peer Review Required', 'Standard PPE']);

  autoFitColumns(sheet, headers.length);
}

/**
 * Format Staff Roster Sheet
 */
function setupStaffSheet(sheet) {
  sheet.clear();

  var headers = [
    'Staff ID',
    'Full Name',
    'Email Address',
    'Discipline / Specialty',
    'Job Title',
    'License / Registration #',
    'Studio / Department',
    'Office Location',
    'Direct Phone'
  ];

  var sampleData = [
    [
      'mem-1',
      'Sophia Al-Mansoor, AIA',
      'sophia.almansoor@apexconstruct.demo',
      'Architectural Design',
      'Principal Architectural Designer',
      'AIA #94210 / LEED AP',
      'Studio A - High-Rise Architectural Lab',
      'HQ 4th Floor - Studio 402',
      '+1 (555) 234-9081'
    ],
    [
      'mem-2',
      'Dr. Jonathan Vance, PE, SE',
      'jonathan.vance@apexconstruct.demo',
      'Structural Engineering',
      'Chief Structural Engineer',
      'PE / SE #58392',
      'Structural Engineering Division',
      'HQ 3rd Floor - Eng Bay 2',
      '+1 (555) 872-4911'
    ],
    [
      'mem-3',
      'Liam Tanaka, PE',
      'liam.tanaka@apexconstruct.demo',
      'MEP Engineering',
      'Lead MEP Systems Engineer',
      'PE #71890',
      'Mechanical & Electrical Systems Group',
      'HQ 3rd Floor - MEP Lab',
      '+1 (555) 621-0988'
    ],
    [
      'mem-4',
      'Maya Lin-Rodriguez',
      'maya.lin@apexconstruct.demo',
      'BIM & VDC Coordination',
      'Senior BIM / VDC Manager',
      'Autodesk Certified Professional (Revit)',
      'Virtual Design & Construction Dept',
      'HQ 4th Floor - BIM Hub',
      '+1 (555) 438-7729'
    ],
    [
      'mem-5',
      'Carlos Mendoza, PE',
      'carlos.mendoza@apexconstruct.demo',
      'Civil & Geotechnical',
      'Civil & Geotechnical Engineer',
      'PE #43120',
      'Infrastructure & Site Engineering Group',
      'HQ 2nd Floor - Civil Office',
      '+1 (555) 912-3401'
    ],
    [
      'mem-6',
      'Elena Rostova, RA',
      'elena.rostova@apexconstruct.demo',
      'Building Code & Permitting',
      'Senior Building Code & Permitting Officer',
      'Registered Architect #66201',
      'Regulatory & Permitting Affairs',
      'HQ 5th Floor - Compliance Desk',
      '+1 (555) 704-5518'
    ]
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);

  formatHeaderRow(sheet, 1, headers.length, '#1E293B'); // Slate Navy
  sheet.setFrozenRows(1);
  sheet.getRange(2, 1, 100, headers.length).setFontFamily('Roboto').setFontSize(10);
  autoFitColumns(sheet, headers.length);
}

/**
 * Format Notification Log Sheet
 */
function setupNotificationsSheet(sheet) {
  sheet.clear();

  var headers = [
    'Notification ID',
    'Timestamp (UTC)',
    'Recipient Architect/Engineer',
    'Recipient Email',
    'Event Type',
    'Task ID',
    'Task Title',
    'Notification Summary',
    'Triggered By',
    'Google Sheet Status'
  ];

  var sampleData = [
    [
      'notif-101',
      new Date().toISOString(),
      'Dr. Jonathan Vance, PE, SE',
      'jonathan.vance@apexconstruct.demo',
      'TASK_ASSIGNED',
      'task-101',
      'Review 3D ETABS Seismic Shear Wall Calculations & Stamped Report - Tower Core',
      'Assigned High Engineering Liability deliverable. Due: 2026-10-24. Requires PE/SE digital stamp.',
      'Engineering Dispatcher',
      'LOGGED_TO_SHEET'
    ],
    [
      'notif-102',
      new Date().toISOString(),
      'Sophia Al-Mansoor, AIA',
      'sophia.almansoor@apexconstruct.demo',
      'TASK_ASSIGNED',
      'task-102',
      'Revit Architectural Shell & Core LOD 350 Model Coordination for Permit Submission',
      'Assigned Permit Critical deliverable. Due: 2026-10-22. Central model AST-ARCH-2026.',
      'Project Director',
      'LOGGED_TO_SHEET'
    ]
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);

  formatHeaderRow(sheet, 1, headers.length, '#065F46'); // Forest Green
  sheet.setFrozenRows(1);
  sheet.getRange(2, 1, 100, headers.length).setFontFamily('Roboto').setFontSize(10);
  autoFitColumns(sheet, headers.length);
}

/**
 * Format Activity Audit Sheet
 */
function setupActivitySheet(sheet) {
  sheet.clear();

  var headers = [
    'Audit Log ID',
    'Timestamp (UTC)',
    'Action Type',
    'Entity ID',
    'Entity Title',
    'Field Changed',
    'Previous Value',
    'New Value',
    'Detailed Description',
    'Operator / System'
  ];

  var sampleData = [
    [
      'audit-001',
      new Date().toISOString(),
      'TASK_ASSIGNED',
      'task-101',
      'Review 3D ETABS Seismic Shear Wall Calculations',
      'assignee',
      'Unassigned',
      'Dr. Jonathan Vance, PE, SE (jonathan.vance@apexconstruct.demo)',
      'Task assigned to Dr. Jonathan Vance. Notification logged to Google Sheet Notifications tab.',
      'Engineering Dispatcher'
    ],
    [
      'audit-002',
      new Date().toISOString(),
      'STATUS_CHANGED',
      'task-102',
      'Revit Architectural Shell & Core LOD 350 Model Coordination',
      'status',
      'BACKLOG',
      'READY',
      'Status transitioned from Backlog to Ready for permit submission review.',
      'Sophia Al-Mansoor, AIA'
    ],
    [
      'audit-003',
      new Date().toISOString(),
      'TASK_CREATED',
      'task-104',
      'Prepare Life Safety & Egress Capacity Calculations',
      'lifecycle',
      'N/A',
      'CREATED',
      'New permit critical calculation task created and appended to Google Sheet Tasks tab.',
      'Chief Architect'
    ]
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);

  formatHeaderRow(sheet, 1, headers.length, '#312E81'); // Indigo
  sheet.setFrozenRows(1);
  sheet.getRange(2, 1, 100, headers.length).setFontFamily('Roboto').setFontSize(10);
  autoFitColumns(sheet, headers.length);
}

function formatHeaderRow(sheet, rowNum, colCount, hexColor) {
  var range = sheet.getRange(rowNum, 1, 1, colCount);
  range.setBackground(hexColor)
       .setFontColor('#FFFFFF')
       .setFontWeight('bold')
       .setFontFamily('Roboto')
       .setFontSize(10)
       .setVerticalAlignment('middle');
  sheet.setRowHeight(rowNum, 36);
}

function setDropdownValidation(sheet, a1Notation, options) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(options, true)
    .setAllowInvalid(true) // Set to TRUE to prevent write errors from halting scripts!
    .build();
  sheet.getRange(a1Notation).setDataValidation(rule);
}

function autoFitColumns(sheet, colCount) {
  for (var i = 1; i <= colCount; i++) {
    sheet.autoResizeColumn(i);
    if (sheet.getColumnWidth(i) < 95) {
      sheet.setColumnWidth(i, 110);
    }
  }
}

/**
 * =========================================================================================
 * WEB APP WEBHOOK ENDPOINTS (doPost / doGet)
 * Automatically syncs rows AND sends notifications to the assigned architect/engineer!
 * =========================================================================================
 */
function doPost(e) {
  var errors = [];
  var emailsSent = [];

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }

    // Direct test email request
    if (data.action === 'test_email' && data.to) {
      var testResult = sendDirectEmail(
        data.to,
        "📐 [Test Notice] Google Sheet Automatic Notification Test",
        buildHtmlEmail(
          "Office Staff Member",
          "Test Deliverable & Calculations Package",
          "Automatic test notification initiated from the Operations frontend.",
          "SYSTEM_VERIFICATION",
          "Operations Admin",
          ss.getUrl()
        )
      );
      return ContentService.createTextOutput(JSON.stringify({
        status: testResult.success ? 'success' : 'error',
        version: '2.1-bulletproof',
        message: testResult.message,
        recipient: data.to
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'sync' && data.sheets) {
      
      // 1. Update Tasks Tab (wrapped in try/catch so validation never breaks execution)
      if (data.sheets.tasks && data.sheets.tasks.length > 0) {
        try {
          var tasksSheet = getOrCreateSheet(ss, 'Tasks');
          tasksSheet.getRange('A1:Z500').clearDataValidations();
          tasksSheet.clearContents();
          tasksSheet.getRange(1, 1, data.sheets.tasks.length, data.sheets.tasks[0].length).setValues(data.sheets.tasks);
          formatHeaderRow(tasksSheet, 1, data.sheets.tasks[0].length, '#1B4332');
          setDropdownValidation(tasksSheet, 'F2:F500', ['BACKLOG', 'READY', 'IN_PROGRESS', 'INSPECTION', 'COMPLETED']);
          setDropdownValidation(tasksSheet, 'G2:G500', ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
          setDropdownValidation(tasksSheet, 'H2:H500', ['Code Compliance Review', 'Permit Critical', 'High Engineering Liability', 'Peer Review Required', 'Standard PPE']);
        } catch (tabErr) {
          errors.push('Tasks tab update: ' + tabErr.toString());
        }
      }

      // 2. Update Staff Roster Tab
      if (data.sheets.staff && data.sheets.staff.length > 0) {
        try {
          var staffSheet = getOrCreateSheet(ss, 'Staff Roster');
          staffSheet.clearContents();
          staffSheet.getRange(1, 1, data.sheets.staff.length, data.sheets.staff[0].length).setValues(data.sheets.staff);
          formatHeaderRow(staffSheet, 1, data.sheets.staff[0].length, '#1E293B');
        } catch (tabErr) {
          errors.push('Staff tab update: ' + tabErr.toString());
        }
      }

      // 3. Update Notifications Tab & DISPATCH EMAILS
      if (data.sheets.notifications && data.sheets.notifications.length > 0) {
        try {
          var notifSheet = getOrCreateSheet(ss, 'Notification Log');
          notifSheet.clearContents();
          notifSheet.getRange(1, 1, data.sheets.notifications.length, data.sheets.notifications[0].length).setValues(data.sheets.notifications);
          formatHeaderRow(notifSheet, 1, data.sheets.notifications[0].length, '#065F46');
        } catch (tabErr) {
          errors.push('Notifications tab update: ' + tabErr.toString());
        }

        // ===================================================================
        // 🔔 AUTOMATIC NOTIFICATION DISPATCH TO ASSIGNED PERSON
        // ===================================================================
        var dispatchResult = dispatchPendingNotifications(data.sheets.notifications, ss);
        emailsSent = dispatchResult.emailsSent;
        if (dispatchResult.errors && dispatchResult.errors.length > 0) {
          errors = errors.concat(dispatchResult.errors);
        }
      }

      // 4. Update Activity Audit Tab
      if (data.sheets.activity && data.sheets.activity.length > 0) {
        try {
          var auditSheet = getOrCreateSheet(ss, 'Activity Audit');
          auditSheet.clearContents();
          auditSheet.getRange(1, 1, data.sheets.activity.length, data.sheets.activity[0].length).setValues(data.sheets.activity);
          formatHeaderRow(auditSheet, 1, data.sheets.activity[0].length, '#312E81');
        } catch (tabErr) {
          errors.push('Activity tab update: ' + tabErr.toString());
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        version: '2.1-bulletproof',
        message: 'Successfully synchronized to Google Sheet and processed notifications',
        emailsSent: emailsSent,
        errors: errors,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'ignored',
      version: '2.1-bulletproof',
      message: 'No recognizable sync action received'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      version: '2.1-bulletproof',
      message: err.toString(),
      errors: errors
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Dispatches an automated email to the assigned architect or engineer
 * using Google's native MailApp service (with GmailApp fallback).
 */
function dispatchPendingNotifications(notificationsRows, spreadsheet) {
  // Row 0 is headers: [Notification ID, Timestamp, Recipient Name, Recipient Email, Event Type, Task ID, Task Title, Summary, Triggered By, Status]
  var result = {
    emailsSent: [],
    errors: []
  };

  if (!notificationsRows || notificationsRows.length <= 1) {
    return result;
  }

  var props = PropertiesService.getScriptProperties();
  var sentMap = {};
  try {
    var sentNotifsStr = props.getProperty('SENT_NOTIFICATIONS') || '{}';
    sentMap = JSON.parse(sentNotifsStr);
  } catch (parseErr) {
    sentMap = {};
  }

  var sheetUrl = spreadsheet.getUrl();

  // Inspect recent notifications (top 5 newest rows)
  var inspectLimit = Math.min(notificationsRows.length, 6);
  for (var i = 1; i < inspectLimit; i++) {
    var row = notificationsRows[i];
    var notifId = String(row[0] || '');
    var recipientName = String(row[2] || 'Team Member');
    var recipientEmail = String(row[3] || '').trim();
    var eventType = String(row[4] || 'TASK_ASSIGNED');
    var taskTitle = String(row[6] || 'Deliverable Task');
    var summary = String(row[7] || '');
    var triggeredBy = String(row[8] || 'Operations Lead');

    // Skip if empty, demo domain, or already sent
    var isRealEmail = recipientEmail && recipientEmail.indexOf('@') !== -1 && !recipientEmail.endsWith('.demo');
    var alreadySent = sentMap[notifId];

    if (isRealEmail && !alreadySent) {
      var subject = "📐 [A&E Deliverable Notice] " + taskTitle;
      var htmlBody = buildHtmlEmail(recipientName, taskTitle, summary, eventType, triggeredBy, sheetUrl);

      var sendResult = sendDirectEmail(recipientEmail, subject, htmlBody);
      if (sendResult.success) {
        result.emailsSent.push(recipientEmail + " (" + taskTitle + ")");
        sentMap[notifId] = new Date().toISOString();
      } else {
        result.errors.push("Failed to email " + recipientEmail + ": " + sendResult.message);
      }
    }
  }

  // Persist updated sent map
  try {
    props.setProperty('SENT_NOTIFICATIONS', JSON.stringify(sentMap));
  } catch (propErr) {}

  return result;
}

/**
 * Sends an email using MailApp, falling back to GmailApp if MailApp has issues.
 */
function sendDirectEmail(toEmail, subject, htmlBody) {
  // Method 1: MailApp
  try {
    MailApp.sendEmail({
      to: toEmail,
      subject: subject,
      htmlBody: htmlBody
    });
    return { success: true, method: 'MailApp' };
  } catch (mailErr) {
    Logger.log("MailApp failed: " + mailErr.toString() + ". Attempting GmailApp fallback...");
    // Method 2: GmailApp fallback
    try {
      GmailApp.sendEmail(toEmail, subject, "", {
        htmlBody: htmlBody
      });
      return { success: true, method: 'GmailApp' };
    } catch (gmailErr) {
      Logger.log("GmailApp also failed: " + gmailErr.toString());
      return { success: false, message: mailErr.toString() + " | " + gmailErr.toString() };
    }
  }
}

/**
 * Builds the official branded HTML email for architects and engineers
 */
function buildHtmlEmail(recipientName, taskTitle, summary, eventType, triggeredBy, sheetUrl) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 16px; background-color: #FFFFFF;">
      
      <!-- Header -->
      <div style="border-bottom: 2px solid #065F46; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #065F46; background-color: #ECFDF5; padding: 4px 10px; border-radius: 9999px;">
          ● Google Sheet Operations Notice
        </span>
        <h1 style="color: #111827; font-size: 20px; font-weight: 800; margin: 12px 0 4px 0;">
          Apex Architecture & Engineering Studio
        </h1>
        <p style="color: #6B7280; font-size: 13px; margin: 0;">
          Official technical deliverable assignment notification
        </p>
      </div>

      <!-- Recipient Greeting -->
      <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        Hello <strong>${recipientName}</strong>,
      </p>
      <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        A milestone deliverable has been logged into the company Google Sheet master and assigned to you:
      </p>

      <!-- Deliverable Details Card -->
      <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-left: 4px solid #10B981; border-radius: 8px; padding: 18px; margin: 20px 0;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6B7280; margin-bottom: 6px;">
          Deliverable / Task
        </div>
        <div style="font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 12px;">
          ${taskTitle}
        </div>
        
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #6B7280; margin-bottom: 4px;">
          Scope & Requirements
        </div>
        <div style="font-size: 13px; color: #374151; line-height: 1.5; margin-bottom: 12px;">
          ${summary}
        </div>

        <div style="font-size: 12px; color: #4B5563;">
          <span><strong>Event:</strong> ${eventType}</span>
          <span style="margin: 0 8px;">•</span>
          <span><strong>Assigned By:</strong> ${triggeredBy || 'Project Manager'}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="margin: 24px 0; text-align: left;">
        <a href="${sheetUrl}" 
           style="display: inline-block; background-color: #065F46; color: #FFFFFF; font-size: 13px; font-weight: 700; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          View Deliverable in Google Sheet ↗
        </a>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; margin-top: 24px; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
        <p style="margin: 0;">
          This notification was automatically dispatched by your company's Google Sheet backend Operations Engine.
        </p>
        <p style="margin: 4px 0 0 0;">
          Spreadsheet: <a href="${sheetUrl}" style="color: #065F46; text-decoration: underline;">Apex Architecture & Engineering - Operations Hub</a>
        </p>
      </div>

    </div>
  `;
}

/**
 * Resets the cache of already sent notification IDs so recent items can be resent if desired.
 */
function clearSentNotificationHistory() {
  PropertiesService.getScriptProperties().deleteProperty('SENT_NOTIFICATIONS');
  SpreadsheetApp.getActiveSpreadsheet().toast('Sent notification memory cleared. Any pending tasks can now be emailed.', '🧹 Memory Reset', 5);
}

/**
 * Test function to verify that your Google Sheet can send emails.
 * RUN THIS ONCE IN APPS SCRIPT EDITOR TO GRANT EMAIL PERMISSIONS!
 */
function sendTestAssignmentNotification() {
  var email = Session.getActiveUser().getEmail();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var result = sendDirectEmail(
    email,
    "📐 [Test Notice] Google Sheet Automatic Notification Test",
    `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #10B981; border-radius: 12px;">
        <h2 style="color: #065F46;">✅ Automatic Email Notifications are Fully Working!</h2>
        <p>This test email confirms that your Google Sheet backend can automatically notify architects and engineers when tasks are assigned.</p>
        <p><strong>Spreadsheet:</strong> <a href="${ss.getUrl()}">${ss.getName()}</a></p>
        <p>Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    `
  );

  if (result.success) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Test assignment email sent to ' + email, '✉️ Email Sent Successfully', 6);
  } else {
    SpreadsheetApp.getActiveSpreadsheet().toast('Error sending email: ' + result.message, '❌ Email Failed', 8);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    version: '2.1-bulletproof',
    name: ss.getName(),
    sheets: ss.getSheets().map(function(s) { return s.getName(); }),
    url: ss.getUrl()
  })).setMimeType(ContentService.MimeType.JSON);
}
