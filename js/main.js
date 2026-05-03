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
 * Genrate or retrieves a unique persistent ID for this visitor.
 * @return {string}
 */
function getPersistentId() {
  let pid = localStorage.getItem('mf_user_id');

  if (!pid) {
    pid = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    localStorage.setItem('mf_user_id', pid);
  }

  return pid;
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
        body: JSON.stringify({
          type: 'visit',
          page: pageName,
          session_id: getPersistentId()
        })
      });

      sessionStorage.setItem('mainframe_visited', 'true');
    } catch (error) {
      console.warn('System analytics ping dropped.');
    }
  }
}

/**
 * Pings the serverless proxy to record a button interaction.
 * @param {string} elementName Name of the button clicked.
 * @return {!Promise<void>}
 */
export async function notifyInteraction(elementName) {
  try {
    let pageName = window.location.pathname.split('/').pop() || 'index.html';

    fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'interaction',
        element: elementName,
        page: pageName,
        session_id: getPersistentId()
      })
    });
  } catch (error) {
    console.warn('Interaction ping dropped.');
  }
}

registerEventListener(document, 'DOMContentLoaded', notifySystemVisit);

