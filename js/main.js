/**
 * Copyright (c) Dušan Mitrović
 * All Rights Reserved.
 *
 * @fileoverview Core functions for MainframeForge ecosystem.
 * @author Dušan Mitrović
 */
'use strict';

/**
 * Adds event listener to DOM element with function handle.
 * @param {!HTMLElement} element The target DOM element.
 * @param {string} event Event to be listened (e.g., 'click').
 * @param {!Function} handlerFunc Handles the target event.
 * @return {void}
 */
export function registerEventListener(element, event, handlerFunc) {
  if (!element) {
    return;
  }

  element.addEventListener(event, (e) => {
    handlerFunc(e);
  });
}