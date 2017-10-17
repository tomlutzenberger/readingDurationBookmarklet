/*!
 * readingDurationBookmarklet v0.1.3
 * Dynamic Bookmarklet to detect the reading time of an article
 *
 * Copyright (c) 2017 - Tom Lutzenberger (lutzenbergerthomas at gmail dot com)
 * https://github.com/tomlutzenberger/readingDurationBookmarklet
 * https://tomlutzenberger.github.io/readingDurationBookmarklet/
 *
 * @license: Licensed under the MIT license
 * https://github.com/tomlutzenberger/readingDurationBookmarklet/blob/master/LICENSE
 */

/*globals document*/
/*jslint esnext:true */

const readingDurationBookmarklet = () => {

    'use strict';

    // Constants to prevent using magic numbers
    const ZERO = 0;
    const FIRST = 0;

    const AVG_WORDS_PER_MIN = 220;
    const SEC_PER_MIN = 60;
    const SEC_PER_HOUR = 3600;
    const TWO_DIGIT_SEC = 10;

    const defaultSite = { name: 'default', selector: 'article' };



    /**
     * @method getSite
     * @description Get all officially supported sites and their article selectors
     *
     * @returns {Object[]}
     */
    const getSite = () => {
        return [{
            name: 'dev.to',
            selector: '#article-body'
        }, {
            name: 'medium.com',
            selector: '.section-content'
        }];
    };



    /**
     * @method getIgnoredTags
     * @description Get an array with all elements that should be ignored (stripped) from content
     *
     * @returns {String[]}
     */
    const getIgnoredTags = () => {
        return [
            'audio',
            'aside',
            'button',
            'code',
            'fieldset',
            'form',
            'iframe',
            'input',
            'label',
            'legend',
            'menu',
            'nav',
            'noscript',
            'object',
            'pre',
            'progress',
            'script',
            'style',
            'video',
            // Comment elements
            '#disqus_thread',
            '#comments',
            '.comments',
            '.comment'
        ];
    };



    /**
     * @method detectSite
     * @description Detect the site we are on. If not supported, use default site config
     *
     * @returns {Object}
     */
    const detectSite = () => {
        const site = getSite().filter((siteObj) => {
            const pattern = new RegExp(siteObj.name, 'im');

            return pattern.test(window.location.host);
        });

        return site.length > ZERO ? site[FIRST] : defaultSite;
    };



    /**
     * @method getArticleContent
     * @description Get article content as plain text or false if not found
     *
     * @param {String} selector - The selector of the content element
     * @returns {(Boolean|String)}
     */
    const getArticleContent = (selector) => {
        let article = document.querySelector(selector);

        if (article !== null) {
            return cleanupContent(stripIgnoredTags(article.cloneNode(true)));
        }

        return false;
    };



    /**
     * @method stripIgnoredTags
     * @description Strip all ignored tags from content
     *
     * @param {Element} content - (DOM-)Element with all the content
     * @returns {Element}
     */
    const stripIgnoredTags = (content) => {
        const tagSelectorList = getIgnoredTags().join(',');
        const nodeList = content.querySelectorAll(tagSelectorList);

        if (nodeList.length > ZERO) {
            nodeList.forEach((nodeElement) => {
                nodeElement.remove();
            });
        }

        return content;
    };



    /**
     * @method cleanupContent
     * @description Remove all unnecessary whitespaces and HTML tags and return plain text
     *
     * @param {Element} content - (DOM-)Element with all the content
     * @returns {String}
     */
    const cleanupContent = (content) => {
        let cleanedContent = content.textContent.trim();
        cleanedContent = cleanedContent.replace(/[^\w\s]/g, ' ');
        cleanedContent = cleanedContent.replace(/\s+/g, ' ');

        return cleanedContent;
    };



    /**
     * @method countWords
     * @description Count the words in the content text
     *
     * @param {String} content - Plain text content
     * @returns {Integer}
     */
    const countWords = (content) => {
        return content.split(' ').length;
    };



    /**
     * @method calculateReadDuration
     * @description Calculate reading duration based on average words-per-minute
     *
     * @param {String} content - Plain text content
     * @returns {Float}
     */
    const calculateReadDuration = (content) => {
        const durationSec = (countWords(content) / AVG_WORDS_PER_MIN) * SEC_PER_MIN;

        return formatReadDuration(durationSec);
    };



    /**
     * @method formatReadDuration
     * @description Format duration to readable text
     *
     * @param {Float} seconds - Calculated amount of seconds to read
     * @returns {String}
     */
    const formatReadDuration = (seconds) => {
        let minutesAmount = 0;
        let minutes = 0;
        let hours = 0;

        if (seconds < SEC_PER_MIN) {
            return '< 1min';
        } else {
            hours = parseInt(seconds / SEC_PER_HOUR);
            minutesAmount = Math.round((seconds % SEC_PER_HOUR) / SEC_PER_MIN);
            minutes = hours > ZERO && minutesAmount < TWO_DIGIT_SEC ? '0' + minutesAmount : minutesAmount;

            return hours > ZERO ? `${hours}hrs ${minutes}min` : `${minutes}min`;
        }
    };



    /**
     * @method execute
     * @description Execute script and alert result
     *
     * @returns {void}
     */
    const execute = () => {
        const site = detectSite();
        const article = getArticleContent(site.selector);
        let message = '';

        if(!article) {
            message = 'Article has not been found. Sorry!';
        } else {
            message = `${countWords(article)} Words, ${calculateReadDuration(article)}`;
        }

        alert(message);
    };


    return {execute};
};


readingDurationBookmarklet().execute();
