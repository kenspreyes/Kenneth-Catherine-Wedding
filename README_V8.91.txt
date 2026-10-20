KENNETH & CATHERINE — WEBSITE V8.91

FIX: ADD TO CALENDAR DROPDOWN
The calendar menu was being painted underneath the horizontal prenup gallery
on smaller screens. Its own z-index was not sufficient because an ancestor
was in a lower stacking context.

The Save the Date content now paints above the photo gallery so both
calendar options are fully visible and clickable:
- Google Calendar
- Apple / iPhone Calendar (.ics)

All other website features and designs are preserved.

INSTALL
1. Extract the ZIP into Documents/Kenneth-Catherine-Wedding/
2. Replace index.html, style.css and script.js.
3. Merge the included assets/images/ with your existing folder.
4. Keep your wedding film and any original photos in assets.
5. Preview locally; then Commit and Push in GitHub Desktop.
6. On your phone, reload the published page after deployment.

VERIFICATION
Checked in headless Chromium at 320, 390, 430, and 1440 px:
The open calendar menu's links are topmost and are no longer
covered by the gallery. JavaScript syntax and ZIP integrity passed.
Actual iPhone Safari should still be checked.
