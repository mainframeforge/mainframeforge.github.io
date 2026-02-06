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
 * @const {number} Major grid weight.
 */
const GRID_MAJOR = 100;
/**
 * @const {number} Minor grid weight.
 */
const GRID_MINOR = 20;
/**
 * @const {string} Accent grid RBG color value.
 */
const ACCENT_COLOR_RGB = '162, 123, 92';
/**
 * @const {number} Areal range of scan visualization.
 */
const SCAN_RANGE = 120;
/**
 * @const {number} Length of grid line.
 */
const LINE_LEN = 180;
/**
 * @const {number} Physics spring stiffness.
 */
const STIFFNESS = 0.15;
/**
 * @const {number} Physics friction/damping.
 */
const FRICTION = 0.82;
/**
 * @const {number} Maximum pixels per frame to prevent blinking.
 */
const MAX_VELOCITY = 50;

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
}

/**
 * Renders proximity based grid lines.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {Object} state The mutable state object.
 * @param {boolean} isVertical Whether lines are drawn vertically or horizontally.
 * @return {void}
 */
function drawLines(ctx, state, isVertical) {
  const offset = GRID_MINOR / 2;
  const mousePos = isVertical ? state.current.x : state.current.y;
  const centerPos = isVertical ? state.dimensions.cx : state.dimensions.cy;
  
  const start = Math.floor((mousePos - SCAN_RANGE - centerPos) / GRID_MINOR) * GRID_MINOR + centerPos - offset;
  const end = Math.floor((mousePos + SCAN_RANGE - centerPos) / GRID_MINOR) * GRID_MINOR + centerPos + offset;

  for (let p = start; p <= end; p += GRID_MINOR) {
    const dist = Math.abs(mousePos - p);
    if (dist > SCAN_RANGE) {
      continue;
    }

    const isMajor = Math.abs((p - (centerPos - GRID_MAJOR / 2)) % GRID_MAJOR) < 1;
    const proximity = 1 - (dist / SCAN_RANGE);
    const opacity = isMajor ? (0.2 + proximity * 0.5) : (0.1 + proximity * 0.2);
    const weight = isMajor ? (1 + proximity * 1.5) : (0.5 + proximity * 0.7);

    let grad;
    const gSize = LINE_LEN / 2;
    if (isVertical) {
      grad = ctx.createLinearGradient(0, state.current.y - gSize, 0, state.current.y + gSize);
    } else {
      grad = ctx.createLinearGradient(state.current.x - gSize, 0, state.current.x + gSize, 0);
    }

    grad.addColorStop(0, `rgba(${ACCENT_COLOR_RGB}, 0)`);
    grad.addColorStop(0.5, `rgba(${ACCENT_COLOR_RGB}, ${opacity})`);
    grad.addColorStop(1, `rgba(${ACCENT_COLOR_RGB}, 0)`);

    ctx.beginPath();
    ctx.lineWidth = weight;
    ctx.strokeStyle = grad;

    if (isVertical) {
      ctx.moveTo(p, state.current.y - gSize);
      ctx.lineTo(p, state.current.y + gSize);
    } else {
      ctx.moveTo(state.current.x - gSize, p);
      ctx.lineTo(state.current.x + gSize, p);
    }
    ctx.stroke();
  }
}

/**
 * Main animation loop.
 * Handles physics updates and frame clearing.
 * @param {CanvasRenderingContext2D} ctx The canvas rendering context.
 * @param {Object} state The engine state.
 * @param {number} timestamp Current frame time.
 * @return {void}
 */
function animate(ctx, state, timestamp) {
  if (!state.active) {
    requestAnimationFrame((t) => animate(ctx, state, t));
    return;
  }

  const ax = (state.target.x - state.current.x) * STIFFNESS;
  const ay = (state.target.y - state.current.y) * STIFFNESS;

  state.vel.x += ax;
  state.vel.y += ay;
  state.vel.x *= FRICTION;
  state.vel.y *= FRICTION;

  state.vel.x = Math.max(Math.min(state.vel.x, MAX_VELOCITY), -MAX_VELOCITY);
  state.vel.y = Math.max(Math.min(state.vel.y, MAX_VELOCITY), -MAX_VELOCITY);

  state.current.x += state.vel.x;
  state.current.y += state.vel.y;

  ctx.clearRect(0, 0, state.dimensions.width, state.dimensions.height);

  drawLines(ctx, state, true);
  drawLines(ctx, state, false);

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
    active: false,
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
    },
    vel: {
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

    if (!state.active) {
      const deltaX = e.clientX - state.dimensions.cx;
      const deltaY = e.clientY - state.dimensions.cy;

      state.current.x = state.dimensions.cx - deltaX;
      state.current.y = state.dimensions.cy - deltaY;

      state.active = true;
    }
  });

  handleResize(canvas, state);
  requestAnimationFrame((t) => {
    animate(ctx, state, t);
  });
}

registerEventListener(document, ON_DOM_CONTENT_LOADED, initGridSystem);