/**
 * Copyright (c) Dušan Mitrović
 * All Rights Reserved.
 *
 * @fileoverview Handles homepage security handshake and redirect.
 * @author Dušan Mitrović
 */
'use strict';

/**
 * Returns a promise that resolves after specific duration.
 * @param {number} ms The duration to wait in milliseconds.
 * @return {!Promise<void>}
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Updates status and manages spinner.
 * @param {!HTMLElement} statusElement The target status element (nullable).
 * @param {string} message Status message to be displayed.
 * @param {boolean=} showSpinner Whether to show spinner (default: false).
 * @return {void}
 */
function updateStatus(statusElement, message, showSpinner = false) {
  statusElement.innerText = message;

  const statusRow = statusElement.parentElement;

  if (!statusRow) {
    return;
  }
    
  const existingSpinner = document.querySelector('.spinner');
  if (existingSpinner) {
    existingSpinner.remove();
  }

  if (showSpinner) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    statusRow.prepend(spinner);
  }
}

/**
 * Initiates security handshake animation sequence.
 * @return {!Promise<void>}
 */
async function handshakeSequence() {
  const statusText = document.querySelector('.status-active');

  if (!statusText) {
    return;
  }

  await delay(3500);
  updateStatus(statusText, 'INITIALIZING SYSTEM PROTOCOLS...');

  await delay(4500);
  updateStatus(statusText, 'LOADING PUBLIC INTERFACE...', true);

  await delay(4000);
  window.location.href = './links.html';
}

document.addEventListener('DOMContentLoaded', () => {
  handshakeSequence();
});