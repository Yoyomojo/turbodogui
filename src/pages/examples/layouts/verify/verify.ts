const CODE_LENGTH = 6;

type OTPInputEl = HTMLElement & { shadowRoot: ShadowRoot };

function getInnerInput(el: Element): HTMLInputElement | null {
    return (el as OTPInputEl).shadowRoot?.querySelector<HTMLInputElement>("input") ?? null;
}

function setFieldError(fieldEls: Element[], hasError: boolean): void {
    fieldEls.forEach((f) =>
        hasError ? f.setAttribute("error", "") : f.removeAttribute("error")
    );
}

export function initVerifyPage(): void {
    const form = document.getElementById("verify-form") as HTMLFormElement | null;
    if (!form) return;

    const fieldEls = Array.from(form.querySelectorAll<Element>("td-text-input.otp-field"));
    const inputs = fieldEls.map(getInnerInput);

    // Configure each inner input
    inputs.forEach((input, i) => {
        if (!input) return;
        input.min = "0";
        input.max = "9";
        input.step = "1";
        input.inputMode = "numeric";
        // First field signals browser OTP autofill
        if (i === 0) input.setAttribute("autocomplete", "one-time-code");
    });

    inputs.forEach((input, i) => {
        if (!input) return;

        input.addEventListener("keydown", (e: KeyboardEvent) => {
            // Block non-numeric characters that number inputs allow
            if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
                return;
            }
            if (e.key === "Backspace") {
                e.preventDefault();
                if (input.value) {
                    input.value = "";
                    fieldEls[i].removeAttribute("error");
                } else if (i > 0) {
                    inputs[i - 1]?.focus();
                    inputs[i - 1] && (inputs[i - 1]!.value = "");
                    fieldEls[i - 1]?.removeAttribute("error");
                }
            } else if (e.key === "ArrowLeft" && i > 0) {
                e.preventDefault();
                inputs[i - 1]?.focus();
            } else if (e.key === "ArrowRight" && i < CODE_LENGTH - 1) {
                e.preventDefault();
                inputs[i + 1]?.focus();
            }
        });

        input.addEventListener("input", () => {
            // type=number ignores maxlength; enforce single digit manually
            const raw = input.value.replace(/\D/g, "");
            const digit = raw.slice(-1);
            input.value = digit;
            fieldEls[i].removeAttribute("error");
            if (digit && i < CODE_LENGTH - 1) {
                inputs[i + 1]?.focus();
            }
        });

        input.addEventListener("paste", (e: ClipboardEvent) => {
            e.preventDefault();
            const text = e.clipboardData?.getData("text") ?? "";
            const digits = text.replace(/\D/g, "").slice(0, CODE_LENGTH - i);
            digits.split("").forEach((char, offset) => {
                const idx = i + offset;
                if (idx < CODE_LENGTH && inputs[idx]) {
                    inputs[idx]!.value = char;
                    fieldEls[idx].removeAttribute("error");
                }
            });
            const focusIdx = Math.min(i + digits.length, CODE_LENGTH - 1);
            inputs[focusIdx]?.focus();
        });

        // Select existing value on focus so re-typing replaces it cleanly
        input.addEventListener("focus", () => input.select());
    });

    const resendLink = document.getElementById("resend-link");
    resendLink?.addEventListener("click", (e) => {
        e.preventDefault();
        inputs.forEach((inp, i) => {
            if (inp) inp.value = "";
            fieldEls[i].removeAttribute("error");
        });
        inputs[0]?.focus();
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const code = inputs.map((inp) => inp?.value ?? "").join("");
        const allFilled = code.length === CODE_LENGTH && /^\d{6}$/.test(code);
        setFieldError(fieldEls, !allFilled);
        if (allFilled) {
            console.log("Verification code submitted:", code);
            // Handle successful verification here
        }
    });
}
