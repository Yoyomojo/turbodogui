type UITextInputEl = HTMLElement & {
    shadowRoot: ShadowRoot;
};
function getField(form: HTMLFormElement, name: string): UITextInputEl | null {
    return form.querySelector<UITextInputEl>(`td-text-input[name="${name}"]`);
}
function getInputValue(el: UITextInputEl | null): string {
    return el?.shadowRoot?.querySelector("input")?.value?.trim() ?? "";
}
function setError(el: HTMLElement | null, hasError: boolean): void {
    if (!el)
        return;
    if (hasError) {
        el.setAttribute("error", "");
    }
    else {
        el.removeAttribute("error");
    }
}
export function initLoginPage(): void {
    const form = document.getElementById("login-form") as HTMLFormElement | null;
    if (!form)
        return;
    const emailEl = getField(form, "email");
    const passwordEl = getField(form, "password");
    const termsEl = form.querySelector<HTMLElement>("td-checkbox[name='terms']");
    emailEl?.shadowRoot?.querySelector("input")?.addEventListener("input", () => {
        setError(emailEl, false);
    });
    passwordEl?.shadowRoot?.querySelector("input")?.addEventListener("input", () => {
        setError(passwordEl, false);
    });
    termsEl?.addEventListener("change", () => {
        setError(termsEl, false);
    });
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = getInputValue(emailEl);
        const password = getInputValue(passwordEl);
        const termsChecked = termsEl?.hasAttribute("checked") ?? false;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        setError(emailEl, !emailValid);
        setError(passwordEl, !password);
        setError(termsEl, !termsChecked);
        if (emailValid && password && termsChecked) {
            console.log("Login submitted:", { email });
        }
    });
}
