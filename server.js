const express = require('express');
const path = require('path');
const fs = require('fs');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { createBundleRenderer } = require('vue-server-renderer');

const bundleRenderer = createBundleRenderer(
	// Load the SSR bundle with require.
	require('./dist/vue-ssr-bundle.json'),
	{
		// Yes, I know, readFileSync is bad practice. It's just shorter to read here.
		template: fs.readFileSync('./index.html', 'utf-8')
	}
);

// Create the express app.
const app = express();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve static assets from ./dist on the /dist route.
app.use('/dist', express.static('dist'));

// Render all other routes with the bundleRenderer.
app.get('*', (req, res) => {
	bundleRenderer
		// Renders directly to the response stream.
		// The argument is passed as "context" to main.server.js in the SSR bundle.
		.renderToStream({ url: req.path })
		.pipe(res);
});

// Bind the app to this port.
const port = process.env.PORT || 3000
app.listen(port, () => {
	console.log(`server started at http://localhost:${port}`)
})

module.exports = app;