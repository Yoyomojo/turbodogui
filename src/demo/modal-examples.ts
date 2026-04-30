import { router } from "../core/router";
import modalBasicHtml from "../components/demo/modal-basic.html?raw";
import modalOverlayCloseHtml from "../components/demo/modal-overlay-close.html?raw";
import modalOpacityHtml from "../components/demo/modal-opacity.html?raw";
import modalWideHtml from "../components/demo/modal-wide.html?raw";

export function initializeModalExamples(): void {
  setupModalHandlers();

  router.subscribe(() => {
    setTimeout(() => {
      setupModalHandlers();
    }, 50);
  });
}

function setupModalHandlers(): void {
  const buttons = document.querySelectorAll('.modal-trigger');

  if (buttons.length === 0) return;

  buttons.forEach((btn: Element) => {
    const newBtn = btn.cloneNode(true) as HTMLElement;
    btn.replaceWith(newBtn);
  });

  document.querySelectorAll('.modal-trigger').forEach((btn: Element) => {
    btn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      openModal(btn as HTMLElement);
    });
  });
}

function openModal(btn: HTMLElement): void {
  const type = btn.getAttribute('data-modal-type');

  const modal = document.createElement('ui-modal');

  if (type === 'basic') {
    modal.setAttribute('title', 'Welcome');
    modal.setAttribute('close-on-escape', 'true');
    modal.innerHTML = modalBasicHtml;
  } else if (type === 'overlay-close') {
    modal.setAttribute('title', 'Closeable Modal');
    modal.setAttribute('close-on-overlay', 'true');
    modal.setAttribute('close-on-escape', 'true');
    modal.innerHTML = modalOverlayCloseHtml;
  } else if (type === 'opacity') {
    modal.setAttribute('title', 'Darker Overlay');
    modal.innerHTML = modalOpacityHtml;
  } else if (type === 'wide') {
    modal.setAttribute('title', 'Wide Modal');
    modal.setAttribute('width', '90vw');
    modal.innerHTML = modalWideHtml;
  }

  document.body.appendChild(modal);
}


