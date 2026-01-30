/**
 * Copyright (c) Dušan Mitrović
 * All Rights Reserved.
 *
 * @fileoverview Kinetic grid visualization entry point.
 * @author Dušan Mitrović
 */
'use strict';

import { registerEventListener } from "./main.js";

/** @const {string} */
const ON_DOM_CONTENT_LOADED = 'DOMContentLoaded';
/** @const {string} */
const ON_MOUSE_MOVE = 'mousemove';
/** @const {string} */
const ON_RESIZE = 'resize';

/** @const {string} */
const GRID_CANVAS_ID = 'grid-canvas';

/** @const {string} */
const ELEMENT_NOT_FOUND_MSG = 'HTML element not found.';

/**
 * Updates canvas dimensions and synchronizes physics state.
 * @param {HTMLCanvasElement} canvas The grid canvas.
 * @param {Object} state The mutable state object.
 * @return {void}
 */
function handleResize(canvas, state) {
  state.dimensions.height = window.innerHeight;
  state.dimensions.width = window.innerWidth;

  canvas.height = state.dimensions.height;
  canvas.width = state.dimensions.width;

  state.dimensions.cx = state.dimensions.width / 2;
  state.dimensions.cy = state.dimensions.height / 2;

  if (state.target.x === 0 && state.target.y === 0) {
    state.target.x = state.current.x = state.dimensions.cx;
    state.target.y = state.current.y = state.dimensions.cy;
  }
}

/**
 * Main animation loop.
 * Handles physics updates and frame clearing.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} state The engine state.
 * @param {number} timestamp Current frame time.
 * @return {void}
 */
function animate(ctx, state, timestamp) {
  ctx.clearRect(0, 0, state.dimensions.width, state.dimensions.height);

  // TODO(#22): Implement physics and rendering.

  requestAnimationFrame((t) => {
    animate(ctx, state, t);
  });
}

/**
 * Initializes the grid visualization system.
 * @return {void}
 */
function initGridSystem() {
  const canvas = document.getElementById(GRID_CANVAS_ID);
  if (!canvas) {
    console.warn(ELEMENT_NOT_FOUND_MSG);
    return;
  }

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  /**
   * Encapsulated state object for the kinetic engine.
   */
  const state = {
    dimensions: {
      cx: 0,
      cy: 0,
      height: 0,
      width: 0
    },
    target: {
      x: 0,
      y: 0
    },
    current: {
      x: 0,
      y: 0
    }
  };

  registerEventListener(window, ON_RESIZE, () => {
    handleResize(canvas, state);
  });

  registerEventListener(document, ON_MOUSE_MOVE, (e) => {
    state.target.x = e.clientX;
    state.target.y = e.clientY;
  });

  handleResize(canvas, state);
  requestAnimationFrame((t) => {
    animate(ctx, state, t);
  });
}

registerEventListener(document, ON_DOM_CONTENT_LOADED, initGridSystem);