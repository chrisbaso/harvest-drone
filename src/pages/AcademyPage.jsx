import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/Shell";
import { useAuth } from "../context/AuthContext";
import { getAcademyBriefingUrl, getAcademyLessonVerification } from "../lib/academyLessonVerification";
import { getLessonContent } from "../lib/trainingContent";
import {
  academySeedComments,
  buildAcademyPilotTrainingRecord,
  buildAcademyTrainingTranscript,
  computeAcademyCertification,
  getAcademyModuleProgress,
  getAcademyResources,
  getAssignedAcademyModules,
  scoreAcademyModuleQuiz,
} from "../../shared/academy";
import { demoOperators } from "../../shared/trainingProgram";

const css = `
  @keyframes acFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes acPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(163,217,119,0.35); }
    50% { box-shadow: 0 0 0 8px rgba(163,217,119,0); }
  }
  @keyframes acCheck {
    0% { transform: scale(0); }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }

  .ac {
    --ac-bg: #0C0F0A;
    --ac-surface: #151A12;
    --ac-card: #1A2015;
    --ac-border: rgba(255,255,255,0.06);
    --ac-border-active: rgba(163,217,119,0.25);
    --ac-text: #E8E6E1;
    --ac-muted: #727966;
    --ac-dim: #515843;
    --ac-accent: #A3D977;
    --ac-accent-soft: rgba(163,217,119,0.08);
    --ac-accent-med: rgba(163,217,119,0.15);
    --ac-warning: #FBBF24;
    --ac-warning-soft: rgba(251,191,36,0.08);
    --ac-locked: #3A3F35;
    --ac-radius: 10px;
    --ac-radius-sm: 6px;
    --ac-font-display: 'DM Serif Display', Georgia, serif;
    --ac-font-body: 'Instrument Sans', system-ui, -apple-system, sans-serif;
    color: var(--ac-text);
    font-family: var(--ac-font-body);
    display: grid;
    animation: acFadeUp 0.4s ease both;
  }

  .ac *, .ac *::before, .ac *::after { box-sizing: border-box; }
  .ac h1, .ac h2, .ac h3, .ac h4, .ac p { margin: 0; }
  .ac button, .ac input, .ac textarea, .ac select { font: inherit; }

  .ac__layout {
    display: grid;
    min-height: calc(100vh - 4rem);
  }

  @media (min-width: 1080px) {
    .ac__layout { grid-template-columns: 17rem 1fr; }
  }

  .ac__side {
    background: #0A0D08;
    border-right: 1px solid var(--ac-border);
    padding: 1.5rem 1rem;
    display: grid;
    gap: 1.25rem;
    align-content: start;
  }

  @media (max-width: 1079px) {
    .ac__side {
      border-right: 0;
      border-bottom: 1px solid var(--ac-border);
      padding: 1rem;
    }
  }

  .ac__brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .ac__logo {
    width: 2rem;
    height: 2rem;
    border-radius: 8px;
    background: linear-gradient(135deg, #A3D977 0%, #6B8F3C 100%);
    display: grid;
    place-items: center;
    font-weight: 800;
    font-size: 0.8rem;
    color: #0C0F0A;
  }

  .ac__brand-text strong {
    font-size: 0.85rem;
    color: var(--ac-text);
    display: block;
    line-height: 1.2;
  }

  .ac__brand-text small {
    font-size: 0.68rem;
    color: var(--ac-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .ac__side-section {
    display: grid;
    gap: 0.5rem;
  }

  .ac__side-heading {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ac-dim);
    font-weight: 600;
    padding: 0 0.75rem;
  }

  .ac__pilot-card {
    display: grid;
    gap: 0.6rem;
    padding: 0.85rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: var(--ac-surface);
  }

  .ac__pilot-label {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ac-dim);
    font-weight: 700;
  }

  .ac__pilot-select {
    width: 100%;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius-sm);
    background: #0A0D08;
    color: var(--ac-text);
    min-height: 2.3rem;
    padding: 0 0.65rem;
  }

  .ac__pilot-select:focus {
    outline: none;
    border-color: var(--ac-border-active);
  }

  .ac__pilot-name {
    font-size: 0.92rem;
    color: var(--ac-text);
    font-weight: 700;
  }

  .ac__pilot-meta {
    font-size: 0.72rem;
    color: var(--ac-muted);
  }

  .ac__availability {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    min-height: 1.6rem;
    padding: 0 0.55rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .ac__availability--ready {
    background: var(--ac-accent-soft);
    color: var(--ac-accent);
    border: 1px solid var(--ac-accent-med);
  }

  .ac__availability--blocked {
    background: var(--ac-warning-soft);
    color: var(--ac-warning);
    border: 1px solid rgba(251,191,36,0.15);
  }

  .ac__nav {
    display: grid;
    gap: 2px;
  }

  .ac__nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    border-radius: var(--ac-radius-sm);
    border: 1px solid transparent;
    background: transparent;
    color: var(--ac-muted);
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }

  .ac__nav-item:hover:not(:disabled) {
    background: var(--ac-accent-soft);
    color: var(--ac-text);
  }

  .ac__nav-item.is-active {
    background: var(--ac-accent-soft);
    border-color: var(--ac-border-active);
    color: var(--ac-accent);
  }

  .ac__nav-item:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .ac__nav-check {
    width: 1.55rem;
    height: 1.2rem;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 0.65rem;
    font-weight: 800;
    flex: 0 0 auto;
  }

  .ac__nav-check--done {
    background: var(--ac-accent);
    color: #0C0F0A;
    animation: acCheck 0.3s ease both;
  }

  .ac__nav-check--current {
    background: var(--ac-warning);
    color: #0C0F0A;
    animation: acPulse 2s infinite;
  }

  .ac__nav-check--locked {
    background: var(--ac-locked);
    color: var(--ac-dim);
  }

  .ac__nav-label {
    display: grid;
    gap: 1px;
    flex: 1;
    min-width: 0;
  }

  .ac__nav-label span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ac__nav-label small {
    font-size: 0.68rem;
    color: var(--ac-dim);
  }

  .ac__main {
    display: grid;
    background: var(--ac-bg);
  }

  .ac__hero {
    padding: 2rem 1.5rem;
    background: linear-gradient(180deg, #151A12 0%, var(--ac-bg) 100%);
    border-bottom: 1px solid var(--ac-border);
  }

  .ac__hero-inner {
    max-width: 56rem;
    display: grid;
    gap: 1.25rem;
  }

  .ac__hero-eyebrow {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--ac-accent);
    font-weight: 700;
  }

  .ac__hero h1 {
    font-family: var(--ac-font-display);
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    line-height: 1.05;
    font-weight: 400;
    color: var(--ac-text);
  }

  .ac__hero p {
    color: var(--ac-muted);
    font-size: 0.92rem;
    line-height: 1.6;
    max-width: 48ch;
  }

  .ac__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 0.75rem;
    max-width: 42rem;
  }

  .ac__stat {
    padding: 1rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: var(--ac-surface);
  }

  .ac__stat-value {
    font-family: var(--ac-font-display);
    font-size: 1.8rem;
    color: var(--ac-text);
    line-height: 1;
    display: block;
  }

  .ac__stat-label {
    font-size: 0.72rem;
    color: var(--ac-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: 0.3rem;
    display: block;
  }

  .ac__stat-bar,
  .ac__cert-progress {
    height: 3px;
    border-radius: 999px;
    background: var(--ac-border);
    margin-top: 0.6rem;
    overflow: hidden;
  }

  .ac__stat-fill,
  .ac__cert-fill {
    height: 100%;
    border-radius: inherit;
    background: var(--ac-accent);
    transition: width 0.6s ease;
  }

  .ac__body {
    padding: 1.5rem;
    max-width: 56rem;
    display: grid;
    gap: 1.5rem;
  }

  .ac__body-grid {
    display: grid;
    gap: 1.5rem;
  }

  @media (min-width: 860px) {
    .ac__body-grid {
      grid-template-columns: 1fr 18rem;
      align-items: start;
    }
  }

  .ac__tabs {
    display: flex;
    gap: 2px;
    border-bottom: 1px solid var(--ac-border);
    overflow-x: auto;
  }

  .ac__tab {
    padding: 0.7rem 1rem;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--ac-muted);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
  }

  .ac__tab:hover { color: var(--ac-text); }
  .ac__tab.is-active {
    color: var(--ac-accent);
    border-bottom-color: var(--ac-accent);
  }

  .ac__badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  .ac__badge--accent {
    background: var(--ac-accent-soft);
    color: var(--ac-accent);
    border: 1px solid var(--ac-accent-med);
  }

  .ac__badge--muted {
    background: var(--ac-surface);
    color: var(--ac-muted);
    border: 1px solid var(--ac-border);
  }

  .ac__badge--warning {
    background: var(--ac-warning-soft);
    color: var(--ac-warning);
    border: 1px solid rgba(251,191,36,0.15);
  }

  .ac__path-note {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: var(--ac-radius);
    font-size: 0.82rem;
  }

  .ac__path-note--current {
    background: var(--ac-warning-soft);
    border: 1px solid rgba(251,191,36,0.15);
  }

  .ac__path-note--complete {
    background: var(--ac-accent-soft);
    border: 1px solid var(--ac-accent-med);
  }

  .ac__path-note--locked {
    background: var(--ac-surface);
    border: 1px solid var(--ac-border);
  }

  .ac__path-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .ac__path-dot--current { background: var(--ac-warning); }
  .ac__path-dot--complete { background: var(--ac-accent); }
  .ac__path-dot--locked { background: var(--ac-dim); }

  .ac__path-text {
    display: grid;
    gap: 2px;
  }

  .ac__path-text strong {
    font-size: 0.8rem;
    color: var(--ac-text);
  }

  .ac__path-text span {
    font-size: 0.75rem;
    color: var(--ac-muted);
  }

  .ac__video {
    position: relative;
    overflow: hidden;
    border-radius: var(--ac-radius);
    border: 1px solid var(--ac-border);
    background: #000;
    aspect-ratio: 16 / 9;
  }

  .ac__video iframe,
  .ac__video video {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
    background: #000;
  }

  .ac__video video {
    object-fit: cover;
  }

  .ac__video-block {
    display: grid;
    gap: 0.75rem;
  }

  .ac__video-confirm {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    border: 1px solid rgba(251,191,36,0.15);
    border-radius: var(--ac-radius);
    background: var(--ac-warning-soft);
  }

  .ac__video-confirm.is-done {
    border-color: var(--ac-accent-med);
    background: var(--ac-accent-soft);
  }

  .ac__video-confirm strong {
    display: block;
    color: var(--ac-text);
    font-size: 0.84rem;
  }

  .ac__video-confirm span {
    display: block;
    margin-top: 0.2rem;
    color: var(--ac-muted);
    font-size: 0.75rem;
    line-height: 1.45;
  }

  .ac__video-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .ac__video-link {
    color: var(--ac-accent);
    font-size: 0.78rem;
    font-weight: 800;
    text-decoration: none;
    white-space: nowrap;
  }

  .ac__video-link:hover { text-decoration: underline; }

  .ac__content {
    display: grid;
    gap: 0.85rem;
    font-size: 0.92rem;
    line-height: 1.7;
    color: var(--ac-text);
  }

  .ac__content h1 {
    font-family: var(--ac-font-display);
    font-size: 1.5rem;
    font-weight: 400;
    margin-top: 0.75rem;
    color: var(--ac-text);
  }

  .ac__content h2 {
    font-family: var(--ac-font-display);
    font-size: 1.25rem;
    font-weight: 400;
    margin-top: 0.5rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid var(--ac-border);
    color: var(--ac-text);
  }

  .ac__content h3 {
    font-size: 0.95rem;
    font-weight: 700;
    margin-top: 0.35rem;
    color: var(--ac-accent);
  }

  .ac__content p,
  .ac__content li {
    color: rgba(232,230,225,0.85);
  }

  .ac__content ul {
    margin: 0;
    padding-left: 1.2rem;
    display: grid;
    gap: 0.35rem;
  }

  .ac__content li::marker { color: var(--ac-accent); }
  .ac__content strong {
    color: var(--ac-text);
    font-weight: 700;
  }

  .ac__content blockquote {
    margin: 0.5rem 0;
    padding: 0.75rem 1rem;
    border-left: 3px solid var(--ac-accent);
    background: var(--ac-accent-soft);
    border-radius: 0 var(--ac-radius-sm) var(--ac-radius-sm) 0;
    font-size: 0.88rem;
    color: var(--ac-text);
  }

  .ac__lessons,
  .ac__resources,
  .ac__checklist,
  .ac__verify,
  .ac__qa {
    display: grid;
    gap: 6px;
  }

  .ac__lesson {
    display: grid;
    grid-template-columns: 2.2rem 1fr auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.85rem 1rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: var(--ac-surface);
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
    width: 100%;
  }

  .ac__lesson:hover:not(:disabled) {
    border-color: var(--ac-border-active);
    background: var(--ac-card);
  }

  .ac__lesson.is-active {
    border-color: var(--ac-accent);
    background: var(--ac-accent-soft);
  }

  .ac__lesson.is-locked {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .ac__lesson-icon {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 999px;
    display: grid;
    place-items: center;
    font-size: 0.72rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .ac__lesson-icon--done {
    background: var(--ac-accent);
    color: #0C0F0A;
  }

  .ac__lesson-icon--current {
    background: var(--ac-warning);
    color: #0C0F0A;
    animation: acPulse 2s infinite;
  }

  .ac__lesson-icon--locked {
    background: var(--ac-locked);
    color: var(--ac-dim);
  }

  .ac__lesson-icon--open {
    background: var(--ac-surface);
    border: 1px solid var(--ac-border);
    color: var(--ac-muted);
  }

  .ac__lesson-info h3 {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--ac-text);
    line-height: 1.3;
  }

  .ac__lesson-info p {
    font-size: 0.75rem;
    color: var(--ac-muted);
    margin-top: 2px;
  }

  .ac__lesson-time {
    font-size: 0.7rem;
    color: var(--ac-dim);
    white-space: nowrap;
  }

  .ac__resource {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.8rem 1rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: var(--ac-surface);
  }

  .ac__resource strong {
    font-size: 0.85rem;
    display: block;
  }

  .ac__resource p {
    font-size: 0.72rem;
    color: var(--ac-dim);
  }

  .ac__resource a {
    color: var(--ac-accent);
    font-size: 0.78rem;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }

  .ac__check-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: var(--ac-surface);
    font-size: 0.85rem;
  }

  .ac__check-icon {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 6px;
    display: grid;
    place-items: center;
    font-size: 0.7rem;
    font-weight: 800;
    background: var(--ac-accent-soft);
    color: var(--ac-accent);
    border: 1px solid var(--ac-accent-med);
    flex-shrink: 0;
  }

  .ac__evidence-panel {
    display: grid;
    gap: 0.85rem;
    padding: 1rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: var(--ac-surface);
  }

  .ac__evidence-head {
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: 1rem;
  }

  .ac__evidence-head h3 {
    margin: 0;
    font-size: 0.95rem;
    color: var(--ac-text);
  }

  .ac__evidence-head p {
    margin-top: 0.25rem;
    color: var(--ac-muted);
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .ac__evidence-list {
    display: grid;
    gap: 0.45rem;
  }

  .ac__evidence-item {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius-sm);
    background: rgba(12,15,10,0.34);
    color: rgba(232,230,225,0.82);
    font-size: 0.82rem;
  }

  .ac__evidence-item input {
    accent-color: var(--ac-accent);
  }

  .ac__question {
    display: grid;
    gap: 0.6rem;
    padding: 0.9rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: rgba(12,15,10,0.34);
  }

  .ac__question strong {
    font-size: 0.86rem;
    color: var(--ac-text);
  }

  .ac__option {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius-sm);
    background: var(--ac-surface);
    color: rgba(232,230,225,0.85);
    font-size: 0.82rem;
    cursor: pointer;
  }

  .ac__option.is-selected {
    border-color: var(--ac-border-active);
    background: var(--ac-accent-soft);
  }

  .ac__option input {
    accent-color: var(--ac-accent);
  }

  .ac__verify-status {
    padding: 0.75rem 0.9rem;
    border-radius: var(--ac-radius);
    border: 1px solid var(--ac-border);
    color: var(--ac-muted);
    font-size: 0.82rem;
    line-height: 1.5;
  }

  .ac__verify-status--pass {
    background: var(--ac-accent-soft);
    border-color: var(--ac-accent-med);
    color: var(--ac-accent);
  }

  .ac__verify-status--block {
    background: var(--ac-warning-soft);
    border-color: rgba(251,191,36,0.15);
    color: var(--ac-warning);
  }

  .ac__qa-form {
    display: grid;
    gap: 0.6rem;
  }

  .ac__qa-form h3 {
    font-size: 0.92rem;
    font-weight: 600;
  }

  .ac__qa-form textarea {
    min-height: 5rem;
    resize: vertical;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    padding: 0.75rem;
    background: var(--ac-surface);
    color: var(--ac-text);
  }

  .ac__comment {
    padding: 1rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: var(--ac-surface);
    display: grid;
    gap: 0.5rem;
  }

  .ac__comment-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ac__comment-head strong { font-size: 0.85rem; }
  .ac__comment p {
    font-size: 0.85rem;
    color: rgba(232,230,225,0.8);
    line-height: 1.6;
  }

  .ac__reply {
    margin-left: 1.25rem;
    padding-left: 0.75rem;
    border-left: 2px solid var(--ac-accent-med);
    display: grid;
    gap: 0.25rem;
  }

  .ac__reply strong {
    font-size: 0.8rem;
    color: var(--ac-accent);
  }

  .ac__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    min-height: 2.5rem;
    padding: 0 1rem;
    border-radius: var(--ac-radius-sm);
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    border: 1px solid transparent;
    width: fit-content;
  }

  .ac__btn--primary {
    background: var(--ac-accent);
    color: #0C0F0A;
    border-color: var(--ac-accent);
  }

  .ac__btn--primary:hover:not(:disabled) { background: #B8E68A; }
  .ac__btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .ac__cert-card {
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius);
    background: var(--ac-surface);
    overflow: hidden;
  }

  .ac__cert-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--ac-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ac__cert-header h3 {
    font-family: var(--ac-font-display);
    font-size: 1.1rem;
    font-weight: 400;
  }

  .ac__cert-body {
    padding: 1rem 1.25rem;
    display: grid;
    gap: 0.75rem;
  }

  .ac__cert-step {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.55rem 0;
    font-size: 0.8rem;
    color: var(--ac-muted);
    border-bottom: 1px solid var(--ac-border);
  }

  .ac__cert-step:last-child { border-bottom: 0; }

  .ac__cert-dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  .ac__cert-dot--done { background: var(--ac-accent); }
  .ac__cert-dot--pending { background: var(--ac-dim); }

  .ac__blockers {
    display: grid;
    gap: 0.45rem;
  }

  .ac__blocker {
    padding: 0.55rem 0.65rem;
    border-radius: var(--ac-radius-sm);
    background: var(--ac-warning-soft);
    border: 1px solid rgba(251,191,36,0.15);
    color: var(--ac-warning);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .ac__next-action {
    display: grid;
    gap: 0.55rem;
    padding: 1rem;
    border: 1px solid var(--ac-border-active);
    border-radius: var(--ac-radius);
    background: linear-gradient(135deg, rgba(163,217,119,0.12), rgba(21,26,18,0.92));
  }

  .ac__next-action small {
    color: var(--ac-accent);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .ac__next-action strong {
    color: var(--ac-text);
    font-size: 0.95rem;
  }

  .ac__next-action p {
    color: var(--ac-muted);
    font-size: 0.78rem;
    line-height: 1.5;
  }

  .ac__gate-list {
    display: grid;
    gap: 0.45rem;
  }

  .ac__gate-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 0.65rem;
    align-items: center;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--ac-border);
    border-radius: var(--ac-radius-sm);
    background: rgba(12,15,10,0.34);
  }

  .ac__gate-row strong {
    display: block;
    color: var(--ac-text);
    font-size: 0.78rem;
  }

  .ac__gate-row span {
    display: block;
    color: var(--ac-muted);
    font-size: 0.7rem;
    margin-top: 0.1rem;
  }

  .ac__gate-status {
    min-width: 4.5rem;
    text-align: center;
  }
`;

const tabLabels = ["Overview", "Lessons", "Resources", "Checklist", "Verify", "Module Quiz", "Q&A"];

const ACADEMY_PILOT_READINESS_KEY = "harvest_academy_pilot_readiness_v1";

function getStorageKey(userId, pilotId) {
  return `harvest_academy_progress_v1:${userId || "demo"}:${pilotId || "pilot"}`;
}

function getEvidenceKey(userId, pilotId) {
  return `harvest_academy_evidence_v1:${userId || "demo"}:${pilotId || "pilot"}`;
}

function getModuleQuizKey(userId, pilotId) {
  return `harvest_academy_module_quizzes_v1:${userId || "demo"}:${pilotId || "pilot"}`;
}

function loadCompletedLessonIds(key) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadLessonEvidence(key) {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function loadModuleQuizResults(key) {
  return loadLessonEvidence(key);
}

function getPassedModuleQuizIds(modules, moduleQuizResults = {}) {
  return modules
    .filter((module) => {
      const result = moduleQuizResults[module.id] || {};
      return Boolean(result.passed && scoreAcademyModuleQuiz(module, result.answers || {}).passed);
    })
    .map((module) => module.id);
}

function getLessonEvidenceStatus(verification, evidence = {}) {
  const answers = evidence.answers || {};
  const checks = verification?.checks || [];
  const knowledgePassed = checks.length === 0 || checks.every((check, index) => Number(answers[index]) === check.correctIndex);
  const videoWatched = Boolean(evidence.videoWatched);
  const contentReviewed = Boolean(evidence.contentReviewed);
  const complete = videoWatched && contentReviewed && knowledgePassed;
  const pending = [];

  if (!videoWatched) pending.push("Watch and acknowledge the briefing");
  if (!contentReviewed) pending.push("Review the written lesson content");
  if (!knowledgePassed) pending.push("Pass the knowledge check");

  return { complete, videoWatched, contentReviewed, knowledgePassed, pending };
}

function getVerifiedCompletedLessonIds(modules, completedLessonIds, evidenceByLesson) {
  return completedLessonIds.filter((lessonId) => {
    const module = modules.find((item) => item.lessons.some((lesson) => lesson.id === lessonId));
    const lesson = module?.lessons.find((item) => item.id === lessonId);
    if (!lesson || !module) return false;
    const evidence = evidenceByLesson[lessonId] || {};
    if (evidence.verifiedAt) return true;
    const verification = getAcademyLessonVerification(lesson, module);
    return getLessonEvidenceStatus(verification, evidence).complete;
  });
}

function getDefaultPilotId(profile, role) {
  const profileMatch = demoOperators.find((operator) => operator.id === profile?.id || operator.name === profile?.full_name);
  if (profileMatch) return profileMatch.id;
  if (role === "operator") return demoOperators[1]?.id || demoOperators[0]?.id;
  return demoOperators[0]?.id;
}

function savePilotTrainingRecord(record) {
  if (typeof window === "undefined" || !record?.pilotId) return;
  try {
    const current = JSON.parse(window.localStorage.getItem(ACADEMY_PILOT_READINESS_KEY) || "{}");
    window.localStorage.setItem(
      ACADEMY_PILOT_READINESS_KEY,
      JSON.stringify({
        ...current,
        [record.pilotId]: record,
      }),
    );
  } catch {
    window.localStorage.setItem(ACADEMY_PILOT_READINESS_KEY, JSON.stringify({ [record.pilotId]: record }));
  }
}

function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderLessonContent(content) {
  const lines = content.split("\n").map((line) => line.trimEnd());
  const elements = [];
  let listBuffer = [];

  function flushList() {
    if (listBuffer.length) {
      elements.push(<ul key={`ul-${elements.length}`}>{listBuffer.map((item, index) => <li key={index}>{item}</li>)}</ul>);
      listBuffer = [];
    }
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(<h3 key={index}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushList();
      elements.push(<h2 key={index}>{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      flushList();
      elements.push(<h1 key={index}>{line.slice(2)}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuffer.push(parseBold(line.slice(2)));
    } else if (line.startsWith("> ")) {
      flushList();
      elements.push(<blockquote key={index}>{parseBold(line.slice(2))}</blockquote>);
    } else {
      flushList();
      elements.push(<p key={index}>{parseBold(line)}</p>);
    }
  });
  flushList();
  return elements;
}

function getAcademyPathState(modules, completedLessonIds, passedModuleQuizIds = []) {
  const completed = new Set(completedLessonIds);
  const passedQuizzes = new Set(passedModuleQuizIds);
  const steps = modules.flatMap((module, moduleIndex) =>
    [
      ...module.lessons.map((lesson, lessonIndex) => ({
        type: "lesson",
        id: lesson.id,
        module,
        moduleIndex,
        lesson,
        lessonIndex,
      })),
      ...(module.moduleQuiz?.length
        ? [{
            type: "moduleQuiz",
            id: `${module.id}:quiz`,
            module,
            moduleIndex,
            lesson: null,
            lessonIndex: module.lessons.length,
          }]
        : []),
    ],
  );
  steps.forEach((step, index) => {
    step.stepNumber = index + 1;
  });
  const isStepComplete = (step) => (step.type === "moduleQuiz" ? passedQuizzes.has(step.module.id) : completed.has(step.lesson.id));
  const firstIncomplete = steps.find((step) => !isStepComplete(step)) || steps[steps.length - 1] || null;
  const unlockedStepNumber = firstIncomplete ? firstIncomplete.stepNumber : steps.length;

  return {
    steps,
    currentStep: firstIncomplete,
    totalSteps: steps.length,
    unlockedStepNumber,
    isLessonUnlocked: (id) => {
      const step = steps.find((item) => item.type === "lesson" && item.lesson.id === id);
      return Boolean(step && step.stepNumber <= unlockedStepNumber);
    },
    isLessonCurrent: (id) => firstIncomplete?.type === "lesson" && firstIncomplete?.lesson.id === id,
    isModuleUnlocked: (id) => steps.filter((step) => step.module.id === id).some((step) => step.stepNumber <= unlockedStepNumber),
    isModuleCurrent: (id) => firstIncomplete?.module.id === id,
    isModuleComplete: (id) => {
      const moduleSteps = steps.filter((step) => step.module.id === id);
      return moduleSteps.length > 0 && moduleSteps.every(isStepComplete);
    },
    getNextStepAfter: (id) => {
      const step = steps.find((item) => item.type === "lesson" && item.lesson.id === id);
      return step ? steps.find((item) => item.stepNumber === step.stepNumber + 1) || null : null;
    },
    getNextStepAfterModuleQuiz: (moduleId) => {
      const step = steps.find((item) => item.type === "moduleQuiz" && item.module.id === moduleId);
      return step ? steps.find((item) => item.stepNumber === step.stepNumber + 1) || null : null;
    },
  };
}

function AcademyPage() {
  const { profile } = useAuth();
  const role = profile?.role || "operator";
  const canManagePilotTraining = ["admin", "dealer", "network_manager"].includes(role);
  const assignedModules = useMemo(() => getAssignedAcademyModules({ role }), [role]);
  const resources = useMemo(() => getAcademyResources(assignedModules), [assignedModules]);
  const [selectedPilotId, setSelectedPilotId] = useState(() => getDefaultPilotId(profile, role));
  const selectedPilot = demoOperators.find((operator) => operator.id === selectedPilotId) || demoOperators[0];
  const storageKey = getStorageKey(profile?.id, selectedPilot?.id);
  const evidenceKey = getEvidenceKey(profile?.id, selectedPilot?.id);
  const moduleQuizKey = getModuleQuizKey(profile?.id, selectedPilot?.id);
  const [completedLessonIds, setCompletedLessonIds] = useState(() => loadCompletedLessonIds(storageKey));
  const [loadedStorageKey, setLoadedStorageKey] = useState(storageKey);
  const [lessonEvidence, setLessonEvidence] = useState(() => loadLessonEvidence(evidenceKey));
  const [loadedEvidenceKey, setLoadedEvidenceKey] = useState(evidenceKey);
  const [moduleQuizResults, setModuleQuizResults] = useState(() => loadModuleQuizResults(moduleQuizKey));
  const [loadedModuleQuizKey, setLoadedModuleQuizKey] = useState(moduleQuizKey);
  const [selectedModuleId, setSelectedModuleId] = useState(assignedModules[0]?.id);
  const [selectedLessonId, setSelectedLessonId] = useState(assignedModules[0]?.lessons[0]?.id);
  const [activeTab, setActiveTab] = useState("Overview");
  const [question, setQuestion] = useState("");
  const [comments, setComments] = useState(academySeedComments);
  const [lessonContent, setLessonContent] = useState("");

  const selectedModule = assignedModules.find((module) => module.id === selectedModuleId) || assignedModules[0];
  const selectedLesson = selectedModule?.lessons.find((lesson) => lesson.id === selectedLessonId) || selectedModule?.lessons[0];
  const selectedVerification = useMemo(
    () => getAcademyLessonVerification(selectedLesson, selectedModule),
    [selectedLesson, selectedModule],
  );
  const selectedLessonEvidence = lessonEvidence[selectedLesson?.id] || {};
  const selectedEvidenceStatus = getLessonEvidenceStatus(selectedVerification, selectedLessonEvidence);
  const selectedVideoUrl = useMemo(
    () => getAcademyBriefingUrl({ lesson: selectedLesson, module: selectedModule, verification: selectedVerification }),
    [selectedLesson, selectedModule, selectedVerification],
  );
  const selectedVideoPath = selectedVideoUrl?.toLowerCase().split("?")[0] || "";
  const selectedVideoIsMedia = [".mp4", ".webm"].some((extension) => selectedVideoPath.endsWith(extension));
  const passedModuleQuizIds = useMemo(() => getPassedModuleQuizIds(assignedModules, moduleQuizResults), [assignedModules, moduleQuizResults]);
  const selectedModuleQuizResult = moduleQuizResults[selectedModule?.id] || {};
  const selectedModuleQuizScore = useMemo(
    () => scoreAcademyModuleQuiz(selectedModule, selectedModuleQuizResult.answers || {}),
    [selectedModule, selectedModuleQuizResult],
  );
  const selectedModuleQuizIssues = selectedModuleQuizScore.issues || [];
  const selectedModuleLessonsComplete = Boolean(selectedModule?.lessons.every((lesson) => completedLessonIds.includes(lesson.id)));
  const selectedModuleQuizRequired = Boolean(selectedModule?.moduleQuiz?.length);
  const selectedModuleQuizPassed = !selectedModuleQuizRequired || passedModuleQuizIds.includes(selectedModule.id);
  const selectedModuleQuizLocked = selectedModuleQuizRequired && !selectedModuleLessonsComplete;
  const selectedModuleQuizAnswers = selectedModuleQuizResult.answers || {};
  const selectedModuleQuizAnsweredCount = selectedModule?.moduleQuiz?.filter((_, index) => selectedModuleQuizAnswers[index] !== undefined).length || 0;
  const selectedModuleQuizCanSubmit = selectedModuleQuizRequired
    && !selectedModuleQuizPassed
    && !selectedModuleQuizLocked
    && selectedModuleQuizIssues.length === 0
    && selectedModuleQuizAnsweredCount === selectedModule.moduleQuiz.length;
  const pathState = useMemo(() => getAcademyPathState(assignedModules, completedLessonIds, passedModuleQuizIds), [assignedModules, completedLessonIds, passedModuleQuizIds]);
  const updatedCertification = useMemo(
    () => computeAcademyCertification({ modules: assignedModules, completedLessonIds, passedModuleQuizIds }),
    [assignedModules, completedLessonIds, passedModuleQuizIds],
  );
  const pilotTrainingRecord = useMemo(
    () =>
      buildAcademyPilotTrainingRecord({
        pilot: selectedPilot,
        modules: assignedModules,
        completedLessonIds,
        passedModuleQuizIds,
      }),
    [assignedModules, completedLessonIds, passedModuleQuizIds, selectedPilot],
  );
  const academyTranscript = useMemo(
    () =>
      buildAcademyTrainingTranscript({
        pilot: selectedPilot,
        modules: assignedModules,
        completedLessonIds,
        passedModuleQuizIds,
        moduleQuizResults,
      }),
    [assignedModules, completedLessonIds, moduleQuizResults, passedModuleQuizIds, selectedPilot],
  );
  const selectedProgress = getAcademyModuleProgress(selectedModule, { completedLessonIds, passedModuleQuizIds });
  const moduleComments = comments.filter((comment) => comment.moduleId === selectedModule?.id);
  const verifiedLessonCount = Object.values(lessonEvidence).filter((evidence) => evidence?.verifiedAt).length;

  useEffect(() => {
    const defaultPilotId = getDefaultPilotId(profile, role);
    if (defaultPilotId && !demoOperators.some((operator) => operator.id === selectedPilotId)) {
      setSelectedPilotId(defaultPilotId);
    }
  }, [profile, role, selectedPilotId]);

  useEffect(() => {
    if (selectedLesson) {
      setLessonContent(getLessonContent(selectedLesson));
    } else {
      setLessonContent("");
    }
  }, [selectedLesson]);

  useEffect(() => {
    const nextEvidence = loadLessonEvidence(evidenceKey);
    const nextModuleQuizResults = loadModuleQuizResults(moduleQuizKey);
    const nextCompletedLessonIds = getVerifiedCompletedLessonIds(assignedModules, loadCompletedLessonIds(storageKey), nextEvidence);
    const nextPassedModuleQuizIds = getPassedModuleQuizIds(assignedModules, nextModuleQuizResults);
    const nextPathState = getAcademyPathState(assignedModules, nextCompletedLessonIds, nextPassedModuleQuizIds);
    const nextStep = nextPathState.currentStep || nextPathState.steps[0];
    setLessonEvidence(nextEvidence);
    setModuleQuizResults(nextModuleQuizResults);
    setCompletedLessonIds(nextCompletedLessonIds);
    setSelectedModuleId(nextStep?.module.id || assignedModules[0]?.id);
    setSelectedLessonId(nextStep?.lesson?.id || nextStep?.module.lessons[nextStep.module.lessons.length - 1]?.id || assignedModules[0]?.lessons[0]?.id);
    setLoadedEvidenceKey(evidenceKey);
    setLoadedModuleQuizKey(moduleQuizKey);
    setLoadedStorageKey(storageKey);
    setActiveTab(nextStep?.type === "moduleQuiz" ? "Module Quiz" : "Overview");
  }, [assignedModules, evidenceKey, moduleQuizKey, storageKey]);

  useEffect(() => {
    if (typeof window !== "undefined" && loadedStorageKey === storageKey) {
      window.localStorage.setItem(storageKey, JSON.stringify(completedLessonIds));
    }
  }, [completedLessonIds, loadedStorageKey, storageKey]);

  useEffect(() => {
    if (typeof window !== "undefined" && loadedEvidenceKey === evidenceKey) {
      window.localStorage.setItem(evidenceKey, JSON.stringify(lessonEvidence));
    }
  }, [evidenceKey, lessonEvidence, loadedEvidenceKey]);

  useEffect(() => {
    if (typeof window !== "undefined" && loadedModuleQuizKey === moduleQuizKey) {
      window.localStorage.setItem(moduleQuizKey, JSON.stringify(moduleQuizResults));
    }
  }, [loadedModuleQuizKey, moduleQuizKey, moduleQuizResults]);

  useEffect(() => {
    if (loadedStorageKey === storageKey && loadedEvidenceKey === evidenceKey && loadedModuleQuizKey === moduleQuizKey) {
      savePilotTrainingRecord({
        ...pilotTrainingRecord,
        verifiedLessonCount,
        lessonEvidence,
        moduleQuizResults,
        transcript: academyTranscript,
      });
    }
  }, [academyTranscript, evidenceKey, lessonEvidence, loadedEvidenceKey, loadedModuleQuizKey, loadedStorageKey, moduleQuizKey, moduleQuizResults, pilotTrainingRecord, storageKey, verifiedLessonCount]);

  function markLessonComplete() {
    if (!selectedLesson || completedLessonIds.includes(selectedLesson.id)) return;
    if (!selectedEvidenceStatus.complete) {
      setActiveTab("Verify");
      return;
    }
    const nextCompleted = [...completedLessonIds, selectedLesson.id];
    const nextStep = pathState.getNextStepAfter(selectedLesson.id);
    updateLessonEvidence(selectedLesson.id, { verifiedAt: new Date().toISOString() });
    setCompletedLessonIds(nextCompleted);
    if (nextStep) {
      setSelectedModuleId(nextStep.module.id);
      setSelectedLessonId(nextStep.lesson?.id || nextStep.module.lessons[nextStep.module.lessons.length - 1]?.id);
      setActiveTab(nextStep.type === "moduleQuiz" ? "Module Quiz" : "Overview");
    }
  }

  function updateLessonEvidence(lessonId, patch) {
    if (!lessonId) return;
    setLessonEvidence((current) => ({
      ...current,
      [lessonId]: {
        ...(current[lessonId] || {}),
        ...patch,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function answerKnowledgeCheck(questionIndex, optionIndex) {
    if (!selectedLesson) return;
    const nextAnswers = {
      ...(selectedLessonEvidence.answers || {}),
      [questionIndex]: optionIndex,
    };
    const nextStatus = getLessonEvidenceStatus(selectedVerification, {
      ...selectedLessonEvidence,
      answers: nextAnswers,
    });
    updateLessonEvidence(selectedLesson.id, {
      answers: nextAnswers,
      knowledgePassed: nextStatus.knowledgePassed,
      knowledgeCheckedAt: new Date().toISOString(),
    });
  }

  function answerModuleQuiz(questionIndex, optionIndex) {
    if (!selectedModule) return;
    const current = moduleQuizResults[selectedModule.id] || {};
    const nextAnswers = {
      ...(current.answers || {}),
      [questionIndex]: optionIndex,
    };
    const score = scoreAcademyModuleQuiz(selectedModule, nextAnswers);
    setModuleQuizResults((results) => ({
      ...results,
      [selectedModule.id]: {
        ...(results[selectedModule.id] || {}),
        answers: nextAnswers,
        scorePct: score.percentage,
        correctCount: score.correctCount,
        totalQuestions: score.totalQuestions,
        passed: false,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function submitModuleQuiz() {
    if (!selectedModule || selectedModuleQuizLocked) return;
    const current = moduleQuizResults[selectedModule.id] || {};
    const score = scoreAcademyModuleQuiz(selectedModule, current.answers || {});
    if (score.issues.length > 0 || Object.keys(current.answers || {}).length < score.totalQuestions) return;
    const attemptedAt = new Date().toISOString();
    setModuleQuizResults((results) => ({
      ...results,
      [selectedModule.id]: {
        ...(results[selectedModule.id] || {}),
        attempts: [
          ...((results[selectedModule.id] || {}).attempts || []),
          {
            attemptedAt,
            scorePct: score.percentage,
            correctCount: score.correctCount,
            totalQuestions: score.totalQuestions,
            passed: score.passed,
          },
        ],
        scorePct: score.percentage,
        correctCount: score.correctCount,
        totalQuestions: score.totalQuestions,
        passingScorePct: score.passingScorePct,
        passed: score.passed,
        passedAt: score.passed ? attemptedAt : results[selectedModule.id]?.passedAt,
        attemptedAt,
        updatedAt: attemptedAt,
      },
    }));

    if (score.passed) {
      const nextStep = pathState.getNextStepAfterModuleQuiz(selectedModule.id);
      if (nextStep) {
        setSelectedModuleId(nextStep.module.id);
        setSelectedLessonId(nextStep.lesson?.id || nextStep.module.lessons[0]?.id);
        setActiveTab(nextStep.type === "moduleQuiz" ? "Module Quiz" : "Overview");
      }
    }
  }

  function submitQuestion(event) {
    event.preventDefault();
    if (!question.trim()) return;
    setComments((current) => [
      ...current,
      {
        id: `q-${Date.now()}`,
        moduleId: selectedModule.id,
        author: profile?.full_name || "You",
        role,
        text: question.trim(),
        pinned: false,
        replies: [],
      },
    ]);
    setQuestion("");
  }

  function selectModule(module) {
    if (!pathState.isModuleUnlocked(module.id)) return;
    const firstOpenLesson = module.lessons.find((lesson) => !completedLessonIds.includes(lesson.id)) || module.lessons[0];
    const moduleLessonsComplete = module.lessons.every((lesson) => completedLessonIds.includes(lesson.id));
    const quizRequired = Boolean(module.moduleQuiz?.length);
    const quizPassed = passedModuleQuizIds.includes(module.id);
    setSelectedModuleId(module.id);
    setSelectedLessonId(firstOpenLesson?.id);
    setActiveTab(moduleLessonsComplete && quizRequired && !quizPassed ? "Module Quiz" : "Overview");
  }

  function selectLesson(lesson) {
    if (!pathState.isLessonUnlocked(lesson.id)) return;
    setSelectedLessonId(lesson.id);
    setActiveTab("Overview");
  }

  function goToCurrentAction() {
    const current = academyTranscript.currentModule;
    if (!current) return;
    const module = assignedModules.find((item) => item.id === current.moduleId);
    if (!module || !pathState.isModuleUnlocked(module.id)) return;
    setSelectedModuleId(module.id);
    setSelectedLessonId(current.nextLessonId || module.lessons[module.lessons.length - 1]?.id || module.lessons[0]?.id);
    setActiveTab(current.status === "Quiz Required" ? "Module Quiz" : "Overview");
  }

  function getLessonIcon(lesson) {
    const done = completedLessonIds.includes(lesson.id);
    const current = pathState.isLessonCurrent(lesson.id);
    const locked = !pathState.isLessonUnlocked(lesson.id);
    if (done) return <span className="ac__lesson-icon ac__lesson-icon--done">OK</span>;
    if (current) return <span className="ac__lesson-icon ac__lesson-icon--current">On</span>;
    if (locked) return <span className="ac__lesson-icon ac__lesson-icon--locked">Lock</span>;
    return <span className="ac__lesson-icon ac__lesson-icon--open">Open</span>;
  }

  function getNavCheck(module) {
    if (pathState.isModuleComplete(module.id)) return <span className="ac__nav-check ac__nav-check--done">OK</span>;
    if (pathState.isModuleCurrent(module.id)) return <span className="ac__nav-check ac__nav-check--current">On</span>;
    return <span className="ac__nav-check ac__nav-check--locked">-</span>;
  }

  const currentStepIsModuleQuiz = pathState.currentStep?.type === "moduleQuiz" && pathState.currentStep.module.id === selectedModule?.id;
  const currentPathStep = currentStepIsModuleQuiz || pathState.isLessonCurrent(selectedLesson?.id)
    ? "current"
    : completedLessonIds.includes(selectedLesson?.id)
      ? "complete"
      : "locked";

  return (
    <Shell compact>
      <style>{css}</style>
      <section className="ac">
        <div className="ac__layout">
          <aside className="ac__side">
            <div className="ac__brand">
              <div className="ac__logo">HD</div>
              <div className="ac__brand-text">
                <strong>Harvest Drone</strong>
                <small>Operator Academy</small>
              </div>
            </div>

            <div className="ac__pilot-card">
              <span className="ac__pilot-label">Training for</span>
              {canManagePilotTraining ? (
                <select
                  className="ac__pilot-select"
                  value={selectedPilot?.id || ""}
                  onChange={(event) => setSelectedPilotId(event.target.value)}
                >
                  {demoOperators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name} - {operator.role}
                    </option>
                  ))}
                </select>
              ) : (
                <strong className="ac__pilot-name">{selectedPilot?.name || "Assigned operator"}</strong>
              )}
              <span className={`ac__availability ${pilotTrainingRecord.availableForAssignmentReview ? "ac__availability--ready" : "ac__availability--blocked"}`}>
                {pilotTrainingRecord.availableForAssignmentReview ? "Available for review" : "Not available yet"}
              </span>
              <span className="ac__pilot-meta">
                {pilotTrainingRecord.trainingProgressPct}% training - {pilotTrainingRecord.certificationStatus}
              </span>
            </div>

            <div className="ac__side-section">
              <div className="ac__side-heading">Training path</div>
              <nav className="ac__nav">
                {assignedModules.map((module) => {
                  const progress = getAcademyModuleProgress(module, { completedLessonIds, passedModuleQuizIds });
                  const locked = !pathState.isModuleUnlocked(module.id);
                  return (
                    <button
                      className={`ac__nav-item ${module.id === selectedModuleId ? "is-active" : ""}`}
                      disabled={locked}
                      key={module.id}
                      onClick={() => selectModule(module)}
                      type="button"
                    >
                      {getNavCheck(module)}
                      <span className="ac__nav-label">
                        <span>{module.title}</span>
                        <small>{progress.percentage}% - {progress.quizRequired && !progress.quizPassed ? "quiz pending" : `${module.estimatedMinutes}m`}</small>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="ac__side-section">
              <div className="ac__side-heading">Certification</div>
              <div style={{ padding: "0 0.75rem" }}>
                <div className="ac__cert-progress">
                  <div className="ac__cert-fill" style={{ width: `${updatedCertification.percentage}%` }} />
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--ac-muted)", marginTop: "0.35rem" }}>
                  {updatedCertification.completedSteps} of {updatedCertification.totalSteps} steps complete
                </div>
              </div>
            </div>
          </aside>

          <div className="ac__main">
            <div className="ac__hero">
              <div className="ac__hero-inner">
                <span className="ac__hero-eyebrow">Harvest Drone Academy</span>
                <h1>{selectedModule?.title || "Operator Training"}</h1>
                <p>{selectedModule?.description}</p>
                <div className="ac__stats">
                  <div className="ac__stat">
                    <span className="ac__stat-value">{selectedProgress.completedItems}/{selectedProgress.totalItems}</span>
                    <span className="ac__stat-label">Module steps complete</span>
                    <div className="ac__stat-bar"><div className="ac__stat-fill" style={{ width: `${selectedProgress.percentage}%` }} /></div>
                  </div>
                  <div className="ac__stat">
                    <span className="ac__stat-value">{assignedModules.length}</span>
                    <span className="ac__stat-label">Modules assigned</span>
                  </div>
                  <div className="ac__stat">
                    <span className="ac__stat-value">{resources.length}</span>
                    <span className="ac__stat-label">Resources</span>
                  </div>
                  <div className="ac__stat">
                    <span className="ac__stat-value">{verifiedLessonCount}</span>
                    <span className="ac__stat-label">Verified lessons</span>
                  </div>
                  <div className="ac__stat">
                    <span className="ac__stat-value">{pilotTrainingRecord.credentialCount}</span>
                    <span className="ac__stat-label">Current credentials</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ac__body">
              <div className="ac__body-grid">
                <div style={{ display: "grid", gap: "1.25rem" }}>
                  <div className={`ac__path-note ac__path-note--${currentPathStep}`}>
                    <span className={`ac__path-dot ac__path-dot--${currentPathStep}`} />
                    <div className="ac__path-text">
                      <strong>
                        {currentPathStep === "current"
                          ? currentStepIsModuleQuiz
                            ? `Module quiz gate - step ${pathState.currentStep?.stepNumber} of ${pathState.totalSteps}`
                            : `Step ${pathState.currentStep?.stepNumber} of ${pathState.totalSteps}`
                          : currentPathStep === "complete"
                            ? "Completed lesson"
                            : "Locked step"}
                      </strong>
                      <span>
                        {currentPathStep === "current"
                          ? currentStepIsModuleQuiz
                            ? "Pass this module quiz to unlock the next module."
                            : "Complete this lesson to unlock the next step."
                          : currentPathStep === "complete"
                            ? "Reviewing - your next lesson is highlighted in the sidebar."
                            : `Complete ${pathState.currentStep?.lesson?.title || pathState.currentStep?.module?.title || "the current step"} first.`}
                      </span>
                    </div>
                  </div>

                  <div className="ac__next-action">
                    <small>Current assignment</small>
                    <strong>{academyTranscript.currentModule?.title || "Training complete"}</strong>
                    <p>
                      {academyTranscript.nextAction}
                      {academyTranscript.currentModule?.quizAttemptCount
                        ? ` - ${academyTranscript.currentModule.quizAttemptCount} quiz attempt${academyTranscript.currentModule.quizAttemptCount === 1 ? "" : "s"} recorded.`
                        : ""}
                    </p>
                    <button className="ac__btn ac__btn--primary" onClick={goToCurrentAction} type="button">
                      Go to Current Step
                    </button>
                  </div>

                  {selectedVideoUrl ? (
                    <div className="ac__video-block">
                      <div className="ac__evidence-head">
                        <div>
                          <h3>Lesson briefing video</h3>
                          <p>Watch this briefing first, then acknowledge it before moving through verification.</p>
                        </div>
                      </div>
                      <div className="ac__video">
                        {selectedVideoIsMedia ? (
                          <video
                            controls
                            onEnded={() => updateLessonEvidence(selectedLesson?.id, { videoWatched: true })}
                            playsInline
                            preload="metadata"
                            src={selectedVideoUrl}
                            title={selectedLesson?.title || "Academy lesson"}
                          />
                        ) : (
                          <iframe
                            src={selectedVideoUrl}
                            title={selectedLesson?.title || "Academy lesson"}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                      <div className={`ac__video-confirm ${selectedLessonEvidence.videoWatched ? "is-done" : ""}`}>
                        <div>
                          <strong>{selectedLessonEvidence.videoWatched ? "Video watched" : "Video not yet acknowledged"}</strong>
                          <span>
                            {selectedLessonEvidence.videoWatched
                              ? "This evidence is saved on the selected pilot training record."
                              : "If the video does not play inline, open it directly and then mark it watched."}
                          </span>
                        </div>
                        <div className="ac__video-actions">
                          <a className="ac__video-link" href={selectedVideoUrl} rel="noreferrer" target="_blank">Open video</a>
                          <button
                            className="ac__btn ac__btn--primary"
                            disabled={Boolean(selectedLessonEvidence.videoWatched)}
                            onClick={() => updateLessonEvidence(selectedLesson?.id, { videoWatched: true })}
                            type="button"
                          >
                            {selectedLessonEvidence.videoWatched ? "Watched" : "Mark video watched"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="ac__tabs">
                    {tabLabels.map((tab) => (
                      <button className={`ac__tab ${activeTab === tab ? "is-active" : ""}`} key={tab} onClick={() => setActiveTab(tab)} type="button">
                        {tab}
                      </button>
                    ))}
                  </div>

                  {activeTab === "Overview" ? (
                    <div className="ac__content">
                      <h3>{selectedLesson?.title}</h3>
                      {renderLessonContent(lessonContent)}
                      <div className={`ac__verify-status ${selectedEvidenceStatus.complete ? "ac__verify-status--pass" : "ac__verify-status--block"}`}>
                        {selectedEvidenceStatus.complete
                          ? "Verification passed. This lesson can be completed and stored on the pilot training record."
                          : `Verification required before completion: ${selectedEvidenceStatus.pending.join(", ")}.`}
                      </div>
                      <button
                        className="ac__btn ac__btn--primary"
                        disabled={!pathState.isLessonUnlocked(selectedLesson?.id) || completedLessonIds.includes(selectedLesson?.id) || !selectedEvidenceStatus.complete}
                        onClick={markLessonComplete}
                        type="button"
                      >
                        {completedLessonIds.includes(selectedLesson?.id)
                          ? "Lesson Complete"
                          : selectedEvidenceStatus.complete
                            ? "Complete & Unlock Next"
                            : "Complete Verification First"}
                      </button>
                    </div>
                  ) : null}

                  {activeTab === "Lessons" ? (
                    <div className="ac__lessons">
                      {selectedModule?.lessons.map((lesson) => {
                        const locked = !pathState.isLessonUnlocked(lesson.id);
                        return (
                          <button
                            className={`ac__lesson ${lesson.id === selectedLessonId ? "is-active" : ""} ${locked ? "is-locked" : ""}`}
                            disabled={locked}
                            key={lesson.id}
                            onClick={() => selectLesson(lesson)}
                            type="button"
                          >
                            {getLessonIcon(lesson)}
                            <div className="ac__lesson-info">
                              <h3>{lesson.title}</h3>
                              <p>{lesson.description}</p>
                            </div>
                            <span className="ac__lesson-time">{lesson.estimatedMinutes}m</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {activeTab === "Resources" ? (
                    <div className="ac__resources">
                      {selectedModule?.resources.map((resource) => (
                        <div className="ac__resource" key={resource.id}>
                          <div><strong>{resource.title}</strong><p>{resource.category} - {resource.type}</p></div>
                          <Link to={resource.url}>Open</Link>
                        </div>
                      ))}
                      {(!selectedModule?.resources || selectedModule.resources.length === 0) ? (
                        <p style={{ color: "var(--ac-dim)", fontSize: "0.85rem" }}>No resources attached to this module yet.</p>
                      ) : null}
                    </div>
                  ) : null}

                  {activeTab === "Checklist" ? (
                    <div className="ac__checklist">
                      {selectedModule?.completionChecklist.map((item, index) => (
                        <div className="ac__check-row" key={index}>
                          <span className="ac__check-icon">OK</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {activeTab === "Verify" ? (
                    <div className="ac__verify">
                      <div className="ac__evidence-panel">
                        <div className="ac__evidence-head">
                          <div>
                            <h3>Lesson evidence</h3>
                            <p>These items are saved against {selectedPilot?.name || "the selected pilot"} before the lesson can be completed.</p>
                          </div>
                          <span className={`ac__badge ${selectedEvidenceStatus.complete ? "ac__badge--accent" : "ac__badge--warning"}`}>
                            {selectedEvidenceStatus.complete ? "Verified" : "Required"}
                          </span>
                        </div>
                        <div className="ac__evidence-list">
                          <label className="ac__evidence-item">
                            <input
                              checked={Boolean(selectedLessonEvidence.videoWatched)}
                              onChange={(event) => updateLessonEvidence(selectedLesson?.id, { videoWatched: event.target.checked })}
                              type="checkbox"
                            />
                            Briefing watched
                          </label>
                          <label className="ac__evidence-item">
                            <input
                              checked={Boolean(selectedLessonEvidence.contentReviewed)}
                              onChange={(event) => updateLessonEvidence(selectedLesson?.id, { contentReviewed: event.target.checked })}
                              type="checkbox"
                            />
                            Written lesson content reviewed
                          </label>
                        </div>
                      </div>

                      <div className="ac__evidence-panel">
                        <div className="ac__evidence-head">
                          <div>
                            <h3>Knowledge check</h3>
                            <p>Answer correctly to prove the pilot understood the operating standard.</p>
                          </div>
                        </div>
                        {selectedVerification.checks.map((check, questionIndex) => (
                          <div className="ac__question" key={check.question}>
                            <strong>{check.question}</strong>
                            {check.options.map((option, optionIndex) => (
                              <label
                                className={`ac__option ${Number(selectedLessonEvidence.answers?.[questionIndex]) === optionIndex ? "is-selected" : ""}`}
                                key={option}
                              >
                                <input
                                  checked={Number(selectedLessonEvidence.answers?.[questionIndex]) === optionIndex}
                                  name={`${selectedLesson?.id}-check-${questionIndex}`}
                                  onChange={() => answerKnowledgeCheck(questionIndex, optionIndex)}
                                  type="radio"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        ))}
                        <div className={`ac__verify-status ${selectedEvidenceStatus.complete ? "ac__verify-status--pass" : "ac__verify-status--block"}`}>
                          {selectedEvidenceStatus.complete
                            ? "All verification evidence is complete."
                            : `Still needed: ${selectedEvidenceStatus.pending.join(", ")}.`}
                        </div>
                        <button
                          className="ac__btn ac__btn--primary"
                          disabled={!pathState.isLessonUnlocked(selectedLesson?.id) || completedLessonIds.includes(selectedLesson?.id) || !selectedEvidenceStatus.complete}
                          onClick={markLessonComplete}
                          type="button"
                        >
                          {completedLessonIds.includes(selectedLesson?.id) ? "Lesson Complete" : "Complete & Unlock Next"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Module Quiz" ? (
                    <div className="ac__verify">
                      <div className="ac__evidence-panel">
                        <div className="ac__evidence-head">
                          <div>
                            <h3>{selectedModule?.title} quiz</h3>
                            <p>
                              Pass this module quiz after all lessons are complete. The pass is saved against {selectedPilot?.name || "the selected pilot"} and unlocks the next module.
                            </p>
                          </div>
                          <span className={`ac__badge ${selectedModuleQuizPassed ? "ac__badge--accent" : "ac__badge--warning"}`}>
                            {selectedModuleQuizPassed ? "Passed" : selectedModuleQuizLocked ? "Locked" : "Required"}
                          </span>
                        </div>

                        {selectedModuleQuizLocked ? (
                          <div className="ac__verify-status ac__verify-status--block">
                            Complete all lessons in this module before taking the module quiz.
                          </div>
                        ) : null}

                        {!selectedModuleQuizRequired ? (
                          <div className="ac__verify-status ac__verify-status--pass">
                            This module does not require a quiz.
                          </div>
                        ) : null}

                        {selectedModuleQuizIssues.length ? (
                          <div className="ac__verify-status ac__verify-status--block">
                            Quiz setup needs admin attention: {selectedModuleQuizIssues.join(" ")}
                          </div>
                        ) : null}

                        {selectedModule?.moduleQuiz?.map((check, questionIndex) => (
                          <div className="ac__question" key={check.question}>
                            <strong>{check.question}</strong>
                            {check.options.map((option, optionIndex) => (
                              <label
                                className={`ac__option ${Number(selectedModuleQuizAnswers[questionIndex]) === optionIndex ? "is-selected" : ""}`}
                                key={option}
                              >
                                <input
                                  checked={Number(selectedModuleQuizAnswers[questionIndex]) === optionIndex}
                                  disabled={selectedModuleQuizLocked || selectedModuleQuizPassed}
                                  name={`${selectedModule?.id}-module-quiz-${questionIndex}`}
                                  onChange={() => answerModuleQuiz(questionIndex, optionIndex)}
                                  type="radio"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        ))}

                        <div className={`ac__verify-status ${selectedModuleQuizPassed ? "ac__verify-status--pass" : "ac__verify-status--block"}`}>
                          {selectedModuleQuizPassed
                            ? `Module quiz passed with ${selectedModuleQuizScore.percentage}%.`
                            : selectedModuleQuizResult.attemptedAt
                              ? `Latest score: ${selectedModuleQuizScore.percentage}%. Passing score is ${selectedModuleQuizScore.passingScorePct}%.`
                              : `Answer all ${selectedModuleQuizScore.totalQuestions} questions. Passing score is ${selectedModuleQuizScore.passingScorePct}%.`}
                        </div>

                        {selectedModuleQuizResult.attempts?.length ? (
                          <div className="ac__gate-list">
                            {selectedModuleQuizResult.attempts.slice(-3).map((attempt, index) => (
                              <div className="ac__gate-row" key={`${attempt.attemptedAt}-${index}`}>
                                <div>
                                  <strong>Attempt {selectedModuleQuizResult.attempts.length - selectedModuleQuizResult.attempts.slice(-3).length + index + 1}</strong>
                                  <span>{new Date(attempt.attemptedAt).toLocaleString()} - {attempt.correctCount}/{attempt.totalQuestions} correct</span>
                                </div>
                                <span className={`ac__badge ac__gate-status ${attempt.passed ? "ac__badge--accent" : "ac__badge--warning"}`}>
                                  {attempt.scorePct}%
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        <button
                          className="ac__btn ac__btn--primary"
                          disabled={!selectedModuleQuizCanSubmit}
                          onClick={submitModuleQuiz}
                          type="button"
                        >
                          {selectedModuleQuizPassed ? "Module Quiz Passed" : "Submit Module Quiz"}
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === "Q&A" ? (
                    <div className="ac__qa">
                      <form className="ac__qa-form" onSubmit={submitQuestion}>
                        <h3>Ask a question</h3>
                        <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What should the lead operator clarify?" />
                        <button className="ac__btn ac__btn--primary" type="submit">Post Question</button>
                      </form>
                      {moduleComments.map((comment) => (
                        <article className="ac__comment" key={comment.id}>
                          <div className="ac__comment-head">
                            <strong>{comment.author}</strong>
                            <span className={`ac__badge ${comment.pinned ? "ac__badge--accent" : "ac__badge--muted"}`}>
                              {comment.pinned ? "Pinned" : comment.role}
                            </span>
                          </div>
                          <p>{comment.text}</p>
                          {comment.replies?.map((reply) => (
                            <div className="ac__reply" key={reply.id}>
                              <strong>{reply.author}</strong>
                              <p>{reply.text}</p>
                            </div>
                          ))}
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>

                <aside style={{ display: "grid", gap: "1rem" }}>
                  <div className="ac__cert-card">
                    <div className="ac__cert-header">
                      <h3>Pilot Status</h3>
                      <span className={`ac__badge ${pilotTrainingRecord.availableForAssignmentReview ? "ac__badge--accent" : "ac__badge--warning"}`}>
                        {pilotTrainingRecord.availableForAssignmentReview ? "Ready" : "Blocked"}
                      </span>
                    </div>
                    <div className="ac__cert-body">
                      <div>
                        <strong style={{ display: "block", fontSize: "0.9rem" }}>{pilotTrainingRecord.pilotName}</strong>
                        <span style={{ color: "var(--ac-muted)", fontSize: "0.76rem" }}>
                          {pilotTrainingRecord.pilotRole}
                          {pilotTrainingRecord.state ? ` - ${pilotTrainingRecord.state}` : ""}
                        </span>
                      </div>
                      <div className="ac__cert-progress">
                        <div className="ac__cert-fill" style={{ width: `${pilotTrainingRecord.trainingProgressPct}%` }} />
                      </div>
                      <div style={{ color: "var(--ac-muted)", fontSize: "0.78rem" }}>
                        Training is saved against pilot ID {pilotTrainingRecord.pilotId}. Scheduler gates can use this record before assignment.
                      </div>
                      {pilotTrainingRecord.blockers.length ? (
                        <div className="ac__blockers">
                          {pilotTrainingRecord.blockers.map((blocker) => (
                            <div className="ac__blocker" key={blocker}>{blocker}</div>
                          ))}
                        </div>
                      ) : (
                        <div className="ac__path-note ac__path-note--complete">
                          <span className="ac__path-dot ac__path-dot--complete" />
                          <div className="ac__path-text">
                            <strong>Training record is assignment-ready</strong>
                            <span>Final mission readiness still checks aircraft, mission, weather, and checklists.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ac__cert-card">
                    <div className="ac__cert-header">
                      <h3>Certification</h3>
                      <span className={`ac__badge ${updatedCertification.certified ? "ac__badge--accent" : "ac__badge--warning"}`}>
                        {updatedCertification.certified ? "Certified" : "In Progress"}
                      </span>
                    </div>
                    <div className="ac__cert-body">
                      <div className="ac__cert-progress">
                        <div className="ac__cert-fill" style={{ width: `${updatedCertification.percentage}%` }} />
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--ac-muted)" }}>
                        {updatedCertification.completedSteps} of {updatedCertification.totalSteps} required steps
                      </div>
                      <div>
                        <div className="ac__cert-step">
                          <span className={`ac__cert-dot ${updatedCertification.percentage > 0 ? "ac__cert-dot--done" : "ac__cert-dot--pending"}`} />
                          Training modules started
                        </div>
                        <div className="ac__cert-step">
                          <span className={`ac__cert-dot ${updatedCertification.percentage >= 100 ? "ac__cert-dot--done" : "ac__cert-dot--pending"}`} />
                          All modules complete
                        </div>
                        <div className="ac__cert-step">
                          <span className={`ac__cert-dot ${updatedCertification.requiredModuleQuizCount > 0 && updatedCertification.completedModuleQuizCount === updatedCertification.requiredModuleQuizCount ? "ac__cert-dot--done" : "ac__cert-dot--pending"}`} />
                          Module quizzes passed ({updatedCertification.completedModuleQuizCount}/{updatedCertification.requiredModuleQuizCount})
                        </div>
                        <div className="ac__cert-step">
                          <span className="ac__cert-dot ac__cert-dot--pending" />
                          Field review completed
                        </div>
                      </div>
                      <button className="ac__btn ac__btn--primary" disabled={!updatedCertification.readyForFieldReview} type="button">
                        Schedule Field Review
                      </button>
                    </div>
                  </div>

                  <div className="ac__cert-card">
                    <div className="ac__cert-header">
                      <h3>Module Gates</h3>
                      <span className="ac__badge ac__badge--muted">{academyTranscript.passedModuleCount}/{academyTranscript.totalModuleCount}</span>
                    </div>
                    <div className="ac__cert-body">
                      <div className="ac__gate-list">
                        {academyTranscript.modules.map((module) => (
                          <div className="ac__gate-row" key={module.moduleId}>
                            <div>
                              <strong>{module.title}</strong>
                              <span>{module.nextAction}</span>
                            </div>
                            <span className={`ac__badge ac__gate-status ${module.status === "Passed" ? "ac__badge--accent" : "ac__badge--muted"}`}>
                              {module.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ac__cert-card">
                    <div className="ac__cert-header">
                      <h3>SOP Library</h3>
                      <span className="ac__badge ac__badge--muted">{resources.length}</span>
                    </div>
                    <div style={{ padding: "0.5rem 0" }}>
                      {resources.slice(0, 6).map((resource) => (
                        <div
                          key={resource.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "0.8rem",
                            padding: "0.6rem 1.25rem",
                            borderBottom: "1px solid var(--ac-border)",
                            fontSize: "0.8rem",
                          }}
                        >
                          <div>
                            <strong style={{ display: "block", fontSize: "0.8rem" }}>{resource.title}</strong>
                            <span style={{ fontSize: "0.7rem", color: "var(--ac-dim)" }}>{resource.category}</span>
                          </div>
                          <Link to={resource.url} style={{ color: "var(--ac-accent)", textDecoration: "none", fontSize: "0.75rem", fontWeight: 700 }}>
                            {resource.type}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default AcademyPage;
