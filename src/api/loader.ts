export function showLoader(message?: string): HTMLElement {
  const loader = document.createElement('ui-loader');
  if (message) {
    loader.setAttribute('message', message);
  }
  document.body.appendChild(loader);
  return loader;
}

export function hideLoader(): void {
  const loader = document.querySelector('ui-loader');
  if (loader) {
    loader.remove();
  }
}

export function withLoader<T>(
  promise: Promise<T>,
  message: string = "Loading..."
): Promise<T> {
  const loader = showLoader(message);

  return promise
    .then((result) => {
      hideLoader();
      return result;
    })
    .catch((error) => {
      hideLoader();
      throw error;
    });
}
