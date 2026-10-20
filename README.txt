KENNETH & CATHERINE — WEDDING WEBSITE (V8.65 COMPLETE PROJECT)
===============================================================
Wedding: Wednesday, March 3, 2027 — 3:00 PM (Philippines)

QUICK START — WINDOWS + VS CODE
1. Extract ALL files from this ZIP into:
   Documents\Kenneth-Catherine-Wedding\
2. In Visual Studio Code, choose File > Open Folder and select that folder.
3. Install the Live Server extension if needed.
4. Right-click index.html > Open with Live Server.
5. Scroll through the site, check video, countdown, venue and RSVP.

WHAT IS INCLUDED
- index.html, style.css, script.js (latest V8.65 source)
- assets/videos/wedding-film.mp4 (your 50-second H.264 wedding video)
- assets/images/video-poster.jpg (still from the film)
- assets/images/church-watercolor.png (wedding church illustration)
- assets/images/hero.jpg (frame from your wedding video)
- assets/images/our-story.jpg (frame from your wedding video)
- test-video.html (video playback diagnostic)
- .gitignore

WHAT STILL NEEDS YOUR FILES
- Original K&C transparent monogram (optional). Add it as:
    assets/images/kc-monogram.png
  Until then, the site displays its K&C text fallback.
- Ruelle song (optional; not supplied due to copyright). Add a properly
  licensed MP3 as:
    assets/audio/i-get-to-love-you-ruelle.mp3
  The music player will not work until the MP3 is present.

THIRD-PARTY REQUIREMENTS
- The original ring animation depends on Three.js. This project loads a
  pinned Three.js version from jsDelivr in index.html (requires internet).
  To store it locally, follow assets/js/THREEJS-INSTRUCTIONS.txt.
- Google Fonts also require internet.

BEFORE SHARING THE SITE WITH GUESTS
- Replace hero.jpg and our-story.jpg with your intended photos if desired.
  The included versions are stills from your wedding video, not the missing
  original photo assets.
- Add the actual monogram and licensed song if you want those features.
- RSVP is still a placeholder, not yet connected to your Smart RSVP app.
- Test the website on your phone and mobile data.
- Optimize the 50 MB MP4 if mobile loading is slow.

DEPLOYMENT
This is a static website and can be published with GitHub Pages,
Netlify, or Cloudflare Pages. Upload the contents of THIS folder, with
index.html at the published site root.
