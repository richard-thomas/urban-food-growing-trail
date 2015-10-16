# urban-food-growing-trail
This is a single-page "web app" which implements an interactive map for exploring the "Urban Food Growing Trail" created
by the "Incredible Edible Bristol" volunteer-run organisation. It was developed both to promote the trail and for the author
to experiment with web development using the Leaflet JavaScript library.

## Known Issues
- Scrolling in sidebars not working in some early webkit (Android 2) browsers due to lack of support for overflow "auto" setting.
- Text duplication covering map makes it unusable in Internet Explorer 8 and earlier due to issue in Leaflet Sidebar plugin.
