/*

Inspiration: http://www.flickr.com/explore/

I love the new Flickr photo pages. I wanted to come up with a similar sizing algorithm from scratch to guess at how this page may have been built.

TODO: 
- Run renderPhotos() on window resize.
- Increase photos per row on excessively tall rows.
- Handle panoramic images.
- Stretch last image in the row to avoid being short a pixel.
- Find ways to improve on testHeight starting value in scaleRow().

After building this I discovered a discussion on the algorithm here: http://www.crispymtn.com/stories/the-algorithm-for-a-perfectly-balanced-photo-gallery. I need to compare and contrast my algorithm with theirs.

*/

(function (document) {
    'use strict';

    var container = document.getElementById('photo_container'),
        photoARs = [], // aspect ratio is all we need to know about a photo
        photoCount = 30,
        photoMargin = 2,
        photosPerRow,
        containerWidth,
        containerUsableWidth,

        initialize = function () {
            generatePhotos();
            renderPhotos();
        },

        measureContainer = function () {
            containerWidth = container.offsetWidth - 25; // includes scrollbar
            photosPerRow = Math.ceil(containerWidth / 500) + 1;
            containerUsableWidth = containerWidth - (photosPerRow * photoMargin * 2);
        },

        generatePhotoAR = function () {
            var d1 = 100000,
                d2 = randomInt(d1 / 2, d1 / 1.1);

            // add 4/5 bias because most photos are landscape
            if (randomInt(1, 5) <= 4) return (d1 / d2);
            else return (d2 / d1);
        },

        generatePhotos = function () {
            for (var i = 0; i < photoCount; i++) {
                photoARs.push(generatePhotoAR());
            }
        },

        renderPhotos = function () {
            var photoHTML = '',
                row = [];

            measureContainer();
            for (var i = 0; i < photoCount; i++) {
                row.push(photoARs[i]);
                if (row.length === photosPerRow) {
                    photoHTML += generateRowHTML(row);
                    row = [];
                }
            }
            container.innerHTML = photoHTML;
        },

        generateRowHTML = function (row) {
            var dimensions = scaleRow(row),
                rowHTML = '<div class="row" style="width:' + containerWidth + 'px">';

            for (var i = 0; i < photosPerRow; i++) {
                rowHTML += '<div class="photo" style="width:' + dimensions[i][0] + 'px;height:' + dimensions[i][1] + 'px">' + dimensions[i][0] + 'x' + dimensions[i][1] + '</div>';
            }
            rowHTML += '</div>';

            return rowHTML;
        },

        scaleRow = function (row) {
            // we need a height to start testing with, so we figure out the minimum
            // width of the widest element and calculate its height at that width
            var dimensions = [],
                maxAr = Math.max.apply(Math, row),
                testHeight = Math.round(containerUsableWidth / photosPerRow / maxAr),
                widths;

            do {
                var testWidths = [],
                    totalWidth = 0;
                for (var i = 0; i < photosPerRow; i++) {
                    var width = Math.round(row[i] * testHeight);
                    testWidths.push(width);
                    totalWidth += width;
                }
                if (totalWidth > containerUsableWidth) break;
                else widths = testWidths;
            }
            while (testHeight++ < 2000); // infinite loop buster for happier testing

            for (var i = 0; i < photosPerRow; i++) {
                dimensions.push([widths[i], testHeight]);
            }

            return dimensions;
        },

        calculateSize = function (ar, knownD) {
            if (ar >= 1) return [Math.round(ar * knownD), knownD];
            else return [knownD, Math.round(knownD / ar)];
        },

        randomInt = function (min, max) {
            return Math.floor((Math.random() * (max - min + 1)) + min);
        };

    initialize();

})(document);
