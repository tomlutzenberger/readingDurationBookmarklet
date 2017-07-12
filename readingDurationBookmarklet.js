/*!
 * readingDurationBookmarklet v0.1.0
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

    const ZERO = 0;
    const FIRST = 0;

    const AVG_WORDS_PER_MIN = 220;
    const SEC_PER_MIN = 60;
    const SEC_PER_HOUR = 3600;
    const TWO_DIGIT_SEC = 10;

    const defaultSite = { name: 'default', selector: 'article' };



    const getSite = () => {
        return [{
            name: 'dev.to',
            selector: '#article-body'
        }, {
            name: 'medium.com',
            selector: '.section-content'
        }];
    };



    const getIgnoredTags = () => {
        return [
            'code',
            'pre'
        ];
    };



    const detectSite = () => {
        const site = getSite().filter((siteObj) => {
            const pattern = new RegExp(siteObj.name, 'im');

            return pattern.test(window.location.host);
        });

        return site.length > ZERO ? site[FIRST] : defaultSite;
    };



    const getArticleContent = (selector) => {
        let article = document.querySelector(selector);

        if (article !== null) {
            return cleanupContent(stripIgnoredTags(article));
        }

        return false;
    };



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



    const cleanupContent = (content) => {
        let cleanedContent = content.textContent.trim();
        cleanedContent = cleanedContent.replace(/\s+/, ' ');
        cleanedContent = cleanedContent.replace(/[^\w\s]/, ' ');

        return cleanedContent;
    };



    const countWords = (content) => {
        return content.split(' ').length;
    };



    const calculateReadDuration = (content) => {
        const durationSec = (countWords(content) / AVG_WORDS_PER_MIN) * SEC_PER_MIN;

        return formatReadDuration(durationSec);
    };


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



    const execute = () => {
        const site = detectSite();
        const article = getArticleContent(site.selector);
        let message = '';

        if(!article) {
            message = 'Something went wrong. Sorry!';
        } else {
            message = `${countWords(article)} Words, ${calculateReadDuration(article)}`;
        }

        alert(message);
    };

    return {execute};
};


readingDurationBookmarklet().execute();
