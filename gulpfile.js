const { src, dest, parallel, watch } = require('gulp'),
  minify = require('gulp-minify'),
  htmlmin = require('gulp-htmlmin'),
  cleanCSS = require('gulp-clean-css');

const minifyJs = cb => {
  src('src/*.js')
    .pipe(minify({
      ext:{min:'.js'},
      noSource: true // Don’t output a copy of the source file
    }))
    .pipe(dest('dist'));
  cb();
};

const minifyHtml = cb => {
	src('src/*.html')
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(dest('dist'));
	cb();
};
const minifyCss = cb => {
	src('src/*.css')
		.pipe(cleanCSS())
		.pipe(dest('dist'));
	cb();
};

const moveImages = cb => {
	src('images/*.png')
		.pipe(dest('dist/images'));
	cb();
};

const moveManifest = cb => {
	src('src/manifest.json')
		.pipe(dest('dist'));
	cb();
};

watch('src/*.js', minifyJs);
watch('src/*.html', minifyHtml);
watch('src/*.css', minifyCss);
watch('src/manifest.json', moveManifest);

  
exports.default = parallel(minifyJs, minifyHtml, minifyCss, moveImages, moveManifest);


