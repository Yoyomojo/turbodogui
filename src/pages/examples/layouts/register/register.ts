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
export function initRegisterPage(): void {
    const form = document.getElementById("register-form") as HTMLFormElement | null;
    if (!form)
        return;
    const firstNameEl = getField(form, "first-name");
    const lastNameEl = getField(form, "last-name");
    const emailEl = getField(form, "email");
    const passwordEl = getField(form, "password");
    const confirmPasswordEl = getField(form, "confirm-password");
    const termsEl = form.querySelector<HTMLElement>("td-checkbox[name='terms']");
    const clearOnInput = (el: UITextInputEl | null) => {
        el?.shadowRoot?.querySelector("input")?.addEventListener("input", () => setError(el, false));
    };
    clearOnInput(firstNameEl);
    clearOnInput(lastNameEl);
    clearOnInput(emailEl);
    clearOnInput(passwordEl);
    clearOnInput(confirmPasswordEl);
    termsEl?.addEventListener("change", () => setError(termsEl, false));
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const firstName = getInputValue(firstNameEl);
        const lastName = getInputValue(lastNameEl);
        const email = getInputValue(emailEl);
        const password = getInputValue(passwordEl);
        const confirmPassword = getInputValue(confirmPasswordEl);
        const termsChecked = termsEl?.hasAttribute("checked") ?? false;
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const passwordValid = password.length >= 8;
        const passwordsMatch = password === confirmPassword;
        setError(firstNameEl, !firstName);
        setError(lastNameEl, !lastName);
        setError(emailEl, !emailValid);
        setError(passwordEl, !passwordValid);
        setError(confirmPasswordEl, !confirmPassword || !passwordsMatch);
        setError(termsEl, !termsChecked);
        if (firstName && lastName && emailValid && passwordValid && passwordsMatch && termsChecked) {
            console.log("Registration submitted:", { firstName, lastName, email });
        }
    });
}
