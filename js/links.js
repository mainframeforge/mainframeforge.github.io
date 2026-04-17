/**
 * Copyright (c) Dušan Mitrović
* 
 * All Rights Reserved.
 *
 * @fileoverview Handles clipboard copying and alert animations for the
 * links page.
 * @author Dušan Mitrović
 */
'use strict';

import { registerEventListener } from "./main.js";

const ALERT_POPUP_ID = 'alert-popup-id';
const DISCORD_BTN_ID = 'discord-btn';
const EMAIL_BTN_ID = 'email-btn';
const EXPERIENCE_METRIC_ID = 'experience-metric';

const DISCORD_ALERT_LABEL = 'Discord Username';
const EMAIL_ALERT_LABEL = 'Email Address';

const ON_ALERT_EVENT = 'click';
const ON_DOM_CONTENT_LOADED = 'DOMContentLoaded';

const HIDE_TIMEOUT_MS = 300;
const FLY_OUT_TIMEOUT_MS = 2000;

const ALERT_STYLE_DISPLAY = 'flex';
const STYLE_NONE = 'none';
const FLY_IN_STYLE_ANIMATION = 'flyInLeft 0.3s ease';
const FLY_OUT_STYLE_ANIMATION = 'flyOutRight 0.3s ease forwards';

const COPIED_LABEL = ' Copied!';
const ERROR_PREFIX_TEXT = 'Error occurred: ';
const ALERT_COPY_FAILED_TEXT = 'Copy failed :(';

const START_EXPERIENCE_YEAR = 2017;
const EXPERIENCE_METRIC_SUFFIX_TEXT = "+ Years Experience";

const GIST_RAW_URL = "https://gist.githubusercontent.com/dusanmitrovic-dev/a276bd3df351ef09b1b187d81ab0fe03/raw/links-config.json";
const LINKS_CONTAINER_ID = 'dynamic-links-container';

let flyOutTimer;
let hideTimer;

/**
 * Copies text to clipboard and updates the alert element text.
 * @param {!HTMLElement} alertElement The DOM element to display status.
 * @param {string} label The label of the item being copied (e.g., 'Discord').
 * @param {string} dataText The actual text to copy to clipboard.
 * @return {!Promise<void>}
*/
async function handleClipboardCopy(alertElement, label, dataText) {
  try {
    await navigator.clipboard.writeText(dataText);
    alertElement.innerText = label + COPIED_LABEL;
  } catch (err) {
    console.error(ERROR_PREFIX_TEXT, err);
    alertElement.innerText = ALERT_COPY_FAILED_TEXT;
  }
}

/**
 * Triggers animations for the alert popup.
 * Clears animations timers to prevent animation conflicts.
 * @param {!HTMLElement} alertElement
 * @return {void}
*/
function animateAlert(alertElement) {
  clearTimeout(flyOutTimer);
  clearTimeout(hideTimer);

  alertElement.style.display = ALERT_STYLE_DISPLAY;
  alertElement.style.animation = STYLE_NONE;

  alertElement.offsetHeight;
  alertElement.style.animation = FLY_IN_STYLE_ANIMATION;

  flyOutTimer = setTimeout(() => {
    alertElement.style.animation = FLY_OUT_STYLE_ANIMATION;
    hideTimer = setTimeout(() => {
      alertElement.style.display = STYLE_NONE;
    }, HIDE_TIMEOUT_MS);
  }, FLY_OUT_TIMEOUT_MS);
}

/**
 * Handles button click event.
 * @param {!HTMLElement} elementId The ID of the button clicked.
 * @param {string} label The human-readable label for the alert.
 * @return {!Promise<void>}
*/
async function onBtnClicked(element, label, dataText) {
  const alertNotice = document.getElementById(ALERT_POPUP_ID);
  await handleClipboardCopy(alertNotice, label, dataText);
  animateAlert(alertNotice);
}

/**
 * Calculates professional years of experience.
 * @param {number} startYear The year career began.
 * @return {number} The calculated years of experience.
 */
function calculateExperience(startYear) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  return currentYear - startYear;
}

/**
 * Injects dynamic experience metrics into the DOM.
 * @param {string} elementId The ID of the experience metric element.
 * @param {number} startYear The year career began.
 * @param {string} suffixText Text to be displayed after metric number.
 * @return {void}
 */
function updateExperienceMetric(elementId, startYear, suffixText) {
  const experienceMetricElement = document.getElementById(elementId);
  if (!experienceMetricElement) {
    return;
  }

  const years = calculateExperience(startYear);
  experienceMetricElement.innerHTML = `${years}${suffixText}`;
}

/**
  * Calculates the symmetrical distribution of items across max 5 rows.
  * Fills in this order to match visual symmetry: Row 2, Row 4, Row 1, Row 5, Row 3
  * @param {number} totalItems The total number of the links to render.
  * @return {number[]} Array of 5 numbers representing items per row.
  */
function calculateRowDistribution(totalItems) {
  const maxItems = Math.min(totalItems, 15);
  const baseCount = Math.floor(maxItems / 5);
  const remainer = maxItems % 5;

  const rows = [baseCount, baseCount, baseCount, baseCount, baseCount];

  const fillOrder = [1, 3, 0, 4, 2];

  for (let i = 0; i < remainer; i++) {
    rows[fillOrder[i]]++;
  }

  return rows;
}

/**
  * Creates a DOM element based on link configuration.
  * @param {Object} linkData Configuration from JSON.
  * @return {!HTMLElement} The generated anchor element.
  */
function createLinkElement(linkData) {
  const el = document.createElement('a');
  el.className = linkData.classes ? linkData.classes.join(' ') : 'list-item reveal-item';
  el.dataset.text = linkData.hoverText || linkData.text;

  if (linkData.type === 'url') {
    el.href = linkData.url;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  } else {
    el.href = '#';
    registerEventListener(el, ON_ALERT_EVENT, (e) => {
      e.preventDefault();
      onBtnClicked(el, linkData.text, linkData.hoverText);
    });
  }

  if (linkData.customStyles) {
    el.style.setProperty('--custom-bg', linkData.customStyles.bg);
    el.style.setProperty('--custom-text', linkData.customStyles.text);
    el.style.setProperty('--custom-hover-bg', linkData.customStyles.hoverBg);
    el.style.setProperty('--custom-reveal-bg', linkData.customStyles.revealBg);
  }

  const contentDiv = document.createElement('span');
  contentDiv.className = 'list-item-content';

  if (linkData.icon) {
    const img = document.createElement('img');
    img.src = linkData.icon;
    img.alt = '';
    img.className = 'link-icon';
    contentDiv.appendChild(img);
  }

  const textSpan = document.createElement('span');
  textSpan.innerText = linkData.text;
  contentDiv.appendChild(textSpan);

  el.appendChild(contentDiv);
  return el;
}

/**
 * Fetches Gist data and orchestrates layout generation.
 */
async function initializeDynamicLinks() {
  const container = document.getElementById(LINKS_CONTAINER_ID);
  
  if (!container) {
    return;
  }

  try {
    const res = await fetch(`${GIST_RAW_URL}?t=${Date.now()}`);

    const linksData = await res.json();
    container.innerHTML = '';

    const distribution = calculateRowDistribution(linksData.length);
    let currentDataIndex = 0;

    distribution.forEach((itemsInThisRow) => {
      if (itemsInThisRow === 0) {
        return;
      }

      const rowEl = document.createElement('div');
      rowEl.className = 'link-row';
      
      for (let i = 0; i < itemsInThisRow; i++) {
        if (currentDataIndex >= linksData.length) {
          break;
        }
        
        const linkEl = createLinkElement(linksData[currentDataIndex]);
        rowEl.appendChild(linkEl);
        currentDataIndex++;
      }

      container.appendChild(rowEl);
    });
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p style="color: red;">Error: Link interface offline.</p>`;
  }
}

const discordBtn = document.getElementById(DISCORD_BTN_ID);
const emailBtn = document.getElementById(EMAIL_BTN_ID);

registerEventListener(document, ON_DOM_CONTENT_LOADED, () => {
  updateExperienceMetric(
    EXPERIENCE_METRIC_ID,
    START_EXPERIENCE_YEAR,
    EXPERIENCE_METRIC_SUFFIX_TEXT);

  initializeDynamicLinks();
});

