/**
 * Copyright (c) Dušan Mitrović
 * All Rights Reserved.
 *
 * @fileoverview Handles homepage security handshake and redirect.
 * @author Dušan Mitrović
 */
'use strict';

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
 * @return {void}
 */
function handshakeSequence() {
  const statusText = document.querySelector('.status-active');

  if (!statusText) {
    return;
  }

  setTimeout(() => {
    updateStatus(statusText, 'DIGITAL FINGERPRINT UNAUTHORIZED');

    setTimeout(() => {
      updateStatus(statusText, 'ESTABLISHING GUEST ACCESS...', true);

      setTimeout(() => {
        window.location.href = './links.html';
      }, 4000);
    }, 4500);
  }, 3500); 
}

document.addEventListener('DOMContentLoaded', () => {
  handshakeSequence();
});