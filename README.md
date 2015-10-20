# Urban Food Growing Trail
This is a single-page "web app" which implements an interactive map for exploring the "Urban Food Growing Trail" created
by the "Incredible Edible Bristol" volunteer-run organisation. It was developed both to promote the trail and for the author
to experiment with web development using the Leaflet JavaScript library. The concatenated and mini-fied webpage (as generated by the included gulpfile 'build') can be viewed here: http://richard-thomas.github.io/urban-food-growing-trail/

## Known Issues
- Scrolling in sidebars not working in some early webkit (Android 2) browsers due to their lack of support for overflow "auto" setting.
- Text duplication covering map makes it unusable in Internet Explorer 8 and earlier due to issue in Leaflet Sidebar plugin.
- Fullscreen icon (mapbox plugin) is off-centre on some retina displays