KENNETH & CATHERINE — WEBSITE V8.90
===================================

WHAT'S NEW
1. Prenup gallery is now a single horizontal scrolling photo strip.
   Swipe horizontally on a phone, or scroll horizontally using a trackpad.
   No headings, descriptions, photo captions, arrow buttons, instructional
   text, or lightbox overlay.
2. Mobile navigation is now a slim ivory bar with the original K&C
   monogram on the left and a MENU control on the right.
   Tap MENU for Home, Details, Entourage, RSVP, and FAQ.
   Expand Details to find Ceremony, Reception, Day Schedule, What to Wear.
3. Navigation still appears only after Save the Date when scrolling up
   and hides when scrolling down. The floating Home button is preserved.
4. Countdown, timer digit fade, three divider lines, original ring
   animation, pinned video, calendar, ceremony/reception, RSVP and FAQ
   remain unchanged.

INSTALLATION
- Extract ZIP into Documents/Kenneth-Catherine-Wedding/
- Replace index.html, style.css and script.js.
- Merge assets/images with the existing assets folder.
- DO NOT DELETE your current video, photographs, or assets.
- Preview with Live Server, then commit/push through GitHub Desktop.
- Versioned CSS/JS links use 8.90.0 to help avoid cached styles.

REPLACING PRENUP PLACEHOLDERS
- Existing image placeholders: assets/images/prenup-01.svg ... 06.svg.
- Add your real images (JPG or WebP) into assets/images.
- Change each image src in index.html from .svg to .jpg or .webp.
- The photo strip will adapt automatically to the new images.

TESTING
- JS syntax, HTML anchors, image assets and ZIP integrity checked.
- Isolated Chromium layout/navigation test at 1440x900, 430x932,
  390x844 and 320x568: horizontal scrolling, mobile menu,
  submenu, and close-on-navigation passed; no page horizontal overflow.
- Live deployment and physical iPhone Safari not tested.
