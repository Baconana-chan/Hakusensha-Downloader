// ==UserScript==
// @name         Hakusensha Downloader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Downloader for Hakusensha.
// @author       Baconana-chan
// @match        https://hakusensha.tameshiyo.me/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // Set to store already downloaded images
    const downloadedImages = new Set();

    // Flag to indicate that all images have been downloaded
    let allImagesDownloaded = false;

    // Function to extract Base64 images from the entire page
    function extractBase64Images() {
        if (allImagesDownloaded) return;  // If all images are already downloaded, stop execution

        const images = document.querySelectorAll('img');
        let newImagesFound = false;

        images.forEach(img => {
            if (img.src && img.src.startsWith('data:image/') && !downloadedImages.has(img.src)) {
                // Save the base64 string
                const base64String = img.src;
                const extension = base64String.split(';')[0].split('/')[1]; // Get the file extension (e.g., 'jpeg')

                // Generate the filename
                const fileName = `image_${Date.now()}.${extension}`;

                // Download the image
                downloadBase64Image(base64String, fileName);

                // Add the image to the downloaded set to avoid re-downloading
                downloadedImages.add(base64String);
                newImagesFound = true;
            }
        });

        // If no new images are found, stop the script
        if (!newImagesFound) {
            allImagesDownloaded = true;
        }
    }

    // Function to download the base64 image
    function downloadBase64Image(base64String, fileName) {
        const link = document.createElement('a');
        link.href = base64String;
        link.download = fileName;
        link.click();
    }

    // Block page refresh only after downloading all images
    let pageReloadBlocked = false;
    window.addEventListener('beforeunload', function(event) {
        if (allImagesDownloaded && !pageReloadBlocked) {
            // Prevent the default page reload behavior
            event.preventDefault();
            event.returnValue = ''; // Required for some browsers to block refresh
            pageReloadBlocked = true;  // Set the flag to block the page reload only once
        }
    });

    // Set an interval to search for images until all images are downloaded
    const intervalId = setInterval(() => {
        if (!allImagesDownloaded) {
            extractBase64Images();
        }
    }, 5000);  // Increased interval to 5 seconds for more complete image loading

})();