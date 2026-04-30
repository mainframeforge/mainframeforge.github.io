/**
 * Copyright (c) Dušan Mitrović
 *
 * All Rights Reserved.
 *
 * @fileoverview Core functions for MainframeForge ecosystem.
 * @author Dušan Mitrović
 */
'use strict';

/**
 * @const {string}
 * Safe Cloudflare Proxy URL for system notifications.
 */
const PROXY_URL = 'https://mainframe-proxy.dusanmitrovic55.workers.dev/';

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

/**
 * Pings the serverless proxy to register a visit.
 * Uses sessionStorage to ensure only one ping per active browser session.
 * @return {!Promise<void>}
 */
async function notifySystemVisit() {
  if (!sessionStorage.getItem('mainframe_visited')) {
    try {
      let pageName = window.location.pathname.split('/').pop() || 'index.html';

      await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ page: pageName })
      });

      sessionStorage.setItem('mainframe_visited', 'true');
    } catch (error) {
      console.warn('System analytics ping dropped.');
    }
  }
}

registerEventListener(document, 'DOMContentLoaded', notifySystemVisit);

