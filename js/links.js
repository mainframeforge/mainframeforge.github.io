/**
 * Copyright (c) Dušan Mitrović
 * All Rights Reserved.
 *
 * @fileoverview Handles clipboard copying and alert animations for the 
 * links page.
 * @author Dušan Mitrović
 */
'use strict';

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
async function onBtnClicked(elementId, label) {
  const btn = document.getElementById(elementId);
  const alertNotice = document.getElementById(ALERT_POPUP_ID);
  const dataText = btn.dataset.text;

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

const discordBtn = document.getElementById(DISCORD_BTN_ID);
const emailBtn = document.getElementById(EMAIL_BTN_ID);

registerEventListener(discordBtn, ON_ALERT_EVENT, () => {
  onBtnClicked(DISCORD_BTN_ID, DISCORD_ALERT_LABEL);
});
registerEventListener(emailBtn, ON_ALERT_EVENT, () => {
  onBtnClicked(EMAIL_BTN_ID, EMAIL_ALERT_LABEL);
});
registerEventListener(document, ON_DOM_CONTENT_LOADED, () => {
  updateExperienceMetric(
    EXPERIENCE_METRIC_ID,
    START_EXPERIENCE_YEAR,
    EXPERIENCE_METRIC_SUFFIX_TEXT);
})