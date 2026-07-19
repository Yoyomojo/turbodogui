# Turbodog UI

<p align="center">
  <img src="public/turbodog-td-logo.png" alt="Turbodog UI Logo" width="300" />
</p>

<p align="center">
  <a href="https://turbodogui.com" target="_blank" rel="noopener noreferrer">View it in action https://turbodogui.com</a>
</p>

A lightweight TypeScript UI library built with Web Components, a tiny router, CSS variable theming, a shared Fetch helper, and a responsive grid system.

## Features

### Core

- **Web Components**  -  every UI element is a native Custom Element with Shadow DOM encapsulation, built in TypeScript
- **Router**  -  lightweight pathname-based router with dynamic route params, lifecycle listeners, and SEO-friendly title/description support
- **Theme system**  -  light/dark mode via CSS custom properties with `localStorage` persistence and system-preference detection
- **HTTP helper**  -  thin `fetch` wrapper with automatic JSON serialisation/parsing, `Content-Type` injection, and non-2xx error throwing
- **Responsive grid**  -  mobile-first 12-column layout with `sm` (576 px), `md` (768 px), `lg` (992 px), and `xl` (1200 px) breakpoints
- **Zero runtime dependencies**  -  dev tooling only: [TypeScript](https://www.typescriptlang.org/) `^5.6.3` and [Vite](https://vitejs.dev/) `^8.0.8`

### App shell

The application bootstraps a shared shell layout and swaps only page content per route.

- **Shell template**: [src/shared/app-shell.html](src/shared/app-shell.html)
- **App bootstrap**: [src/main.ts](src/main.ts)
- **Route setup + registration**: [src/pages/app-routes.ts](src/pages/app-routes.ts)
- **Sidebar navigation component**: [src/components/sidebar/td-sidebar.ts](src/components/sidebar/td-sidebar.ts)

The shell contains:

- A persistent top bar (brand, GitHub link, theme toggle)
- A persistent sidebar (`<td-sidebar>`) for component/layout routes
- A main content outlet (`#app-content`) where routed HTML is rendered

At runtime, the shell is mounted once, then the router updates only the outlet:

```ts
app.innerHTML = shellHtml;
initializeAppRoutes(contentEl);
```

`initializeAppRoutes` in [src/pages/app-routes.ts](src/pages/app-routes.ts) wires listeners, registers routes, and starts the router:

```ts
router.addListener(async () => {
  const html = await router.resolve();
  contentEl.innerHTML = html;
  runPageScripts(contentEl);
  router.runOnMount();
});

router.start();
```

Benefits of this pattern:

- Consistent navigation and visual frame across all pages
- Clear separation between shared chrome and route-specific content
- Simple scaling: add a page by lazy-loading HTML and registering a route in [src/pages/app-routes.ts](src/pages/app-routes.ts)

### Components

| Component | Description |
|---|---|
| `<td-accordion>` | Expandable/collapsible content sections with optional multi-open support and full keyboard navigation |
| `<td-alert>` | Dismissible status banners in `info`, `success`, `warning`, and `alert` variants; supports optional `toast` overlay mode with stacking, configurable position, and auto-dismiss |
| `<td-breadcrumb>` | Accessible page-trail navigation with HTML slot mode, JSON `items` attribute, and dynamic `src`/API population; supports configurable separators and a `breadcrumb-click` event |
| `<td-bar-chart>` | Vertical and horizontal bar chart with grouped multi-series mode, reference lines, line-series overlay, interactive legend, group-highlight tooltip, and auto-angling labels |
| `<td-bubble-chart>` | Multi-series bubble chart with auto-scaling X/Y axes, proportional bubble sizing, interactive legend, hover tooltips, and optional axis labels |
| `<td-radar-chart>` | Multi-series radar chart with configurable axis labels, normalized score-style data, interactive legend, hover tooltips, and `src`/API loading |
| `<td-button>` | Styled button with `success`, `warning`, and `alert` variants plus `small`, `medium`, `large`, and `extra-large` size options |
| `<td-button-group>` | Layout wrapper for grouping multiple `<td-button>` actions in a horizontal strip with configurable spacing, alignment, wrapping, and optional pill ends |
| `<td-card>` | Surface container for grouping content; supports a `stretch` attribute for equal-height columns |
| `<td-carousel>` | Animated slideshow with dot indicators, prev/next arrows, autoplay, loop, touch swipe, and keyboard navigation |
| `<td-checkbox>` | Accessible styled checkbox with label, error state, and `change` event |
| `<td-code>` | Syntax-highlighted code block with language badge, optional filename label, and copy-to-clipboard button |
| `<td-date-picker>` | Accessible calendar date picker with size variants, min/max constraints, keyboard navigation, error state, and a `change` event carrying the ISO 8601 value |
| `<td-donut-chart>` | Ring chart with configurable hole size, optional center label, interactive legend, and toggleable segments |
| `<td-dropdown>` | Accessible dropdown menu with HTML slot items, JSON `items` attribute, remote `src`/API loading, placement control, size variants, color variants, selected-item tracking, and full keyboard navigation |
| `<td-drawer>` | Slide-in panel from any viewport edge (`top`, `right`, `bottom`, `left`) with configurable `width`/`height`, overlay backdrop, Escape key dismissal, and `drawer-close` event |
| `<td-file-input>` | Drag-and-drop or click-to-upload file input with single/multiple mode, type filtering, max file size validation, size variants, and customizable drop-zone labels/content |
| `<td-line-chart>` | Multi-series line chart with per-point tooltips, toggleable legend, auto-angling x-axis labels, and optional value labels |
| `<td-link>` | Router-aware anchor that prevents full page reloads; optionally renders as a fully styled `<td-button>`-equivalent |
| `<td-loader>` | Full-screen or contained loading overlay with `spinner` and `dots` variants, configurable size/color, and `show()`/`hide()` API |
| `<td-modal>` | Centered dialog with focus trap, optional overlay/escape-key dismissal, configurable width, and a default content slot |
| `<td-mosaic>` / `<td-mosaic-item>` | CSS Grid photo mosaic with auto-square cells, configurable column count and gap, `col-span`/`row-span` spanning, and hover overlay |
| `<td-multi-select>` | Dropdown multi-select with size variants, pill badges, live search, Select/Deselect All, keyboard navigation, and JSON/HTML/JS option population |
| `<td-pagination>` | Page navigation control driven by total item count and page size; emits `td-page-change` with offset/limit ready for API queries |
| `<td-progress-bar>` | Determinate and indeterminate progress indicator with semantic color variants, striped/animated patterns, custom height and color, and full ARIA support |
| `<td-color-picker>` | Fully custom color picker with a 2D saturation/brightness picker, hue and opacity sliders, hex/RGB/HSL inputs, preset swatches, and full keyboard navigation |
| `<td-pie-chart>` | Pie chart with interactive legend, toggleable slices, optional percentage labels, and configurable legend position |
| `<td-select>` | Styled `<select>` wrapper with size variants, option groups, multiple selection, label, and `change` event |
| `<td-sidebar>` | Collapsible side-navigation with search filtering, section labels, badge counts, SVG icon support, and a responsive mobile drawer |
| `<td-table>` | Feature-rich data table with sorting, live search, CSV export, sticky header, scrollable body, nested column headers, cell rendering, row/cell highlighting, and editable cells |
| `<td-tabs>` | Tabbed content container with keyboard navigation (arrow keys, Home, End), scroll overflow arrows, and `tab-changed` event |
| `<td-text-input>` | Labelled text input with size variants, validation/error state, and full accessibility support |
| `<td-text-area>` | Labelled textarea with size variants, validation/error state, and full accessibility support |
| `<td-theme-toggle>` | One-click light/dark theme toggle button |
| `<td-tooltip>` | Hover/focus tooltip anchored to any element with configurable position and max-width |
| `<td-video-player>` | Custom video player supporting direct files, Vimeo and YouTube embeds, drag-and-drop, keyboard shortcuts, fullscreen, and a timestamped share button |

## Getting started

```bash
npm install
npm run dev
```

## Components

### `<td-alert>`

Contextual feedback banners in four semantic variants. Supports inline display or a fixed `toast` overlay mode with animated stacking.

```html
<td-alert variant="info">Informational message.</td-alert>
<td-alert variant="success" title="Saved!">Your changes were saved.</td-alert>
<td-alert variant="warning" dismissible>This action cannot be undone.</td-alert>
<td-alert variant="alert" title="Error" dismissible>Something went wrong.</td-alert>
```

**Toast mode**  -  appends itself to a shared fixed container and slides in:

```html
<!-- Positioned top-right, auto-dismisses after 4 s -->
<td-alert toast variant="success" title="Saved!" duration="4000">
  Your changes have been saved.
</td-alert>

<!-- Bottom-right, no auto-dismiss -->
<td-alert toast toast-position="bottom-right" variant="warning" title="Warning">
  Check your input and try again.
</td-alert>
```

Or trigger programmatically:

```js
const toast = document.createElement('td-alert');
toast.setAttribute('toast', '');
toast.setAttribute('variant', 'success');
toast.setAttribute('title', 'Saved!');
toast.setAttribute('duration', '3000');
toast.textContent = 'Your changes have been saved.';
document.body.appendChild(toast);
```

| Attribute        | Type    | Default     | Description |
|------------------|---------|-------------|-------------|
| `variant`        | string  | `info`      | `info` \| `success` \| `warning` \| `alert` |
| `title`          | string  |             | Bold heading above the message |
| `dismissible`    | boolean |             | Shows a close button that hides the alert |
| `toast`          | boolean |             | Renders as a fixed overlay toast; close button always shown |
| `toast-position` | string  | `top-right` | `top-right` \| `top-left` \| `bottom-right` \| `bottom-left` \| `top-center` \| `bottom-center` |
| `duration`       | number  |             | Auto-dismiss delay in ms; `0` or omitted = no auto-dismiss |

**Events:** `dismiss` (bubbles, composed)  -  fires on close button click or auto-dismiss expiry.

---

### `<td-card>`

A styled surface for grouping content.

```html
<td-card>
  <h2>Title</h2>
  <p>Content goes here.</p>
</td-card>

<!-- Force equal height with sibling cards in the same row -->
<td-card stretch>
  <h2>Title</h2>
  <p>Content goes here.</p>
</td-card>
```

| Attribute | Type    | Default | Description |
|-----------|---------|---------|-------------|
| `stretch` | boolean |   | Makes the card fill the full height of its grid column: use on all cards in a row for equal heights |

---

### `<td-button>`

A styled button supporting size variants, variants, and states.

```html
<td-button type="button" variant="success" size="large">Click Me</td-button>
<td-button type="submit" disabled>Submit</td-button>
```

| Attribute  | Type    | Values                                            | Default    |
|------------|---------|---------------------------------------------------|------------|
| `type`     | string  | `button`, `submit`, `reset`                       | `button`   |
| `variant`  | string  | `success`, `warning`, `alert`                     | primary    |
| `size`     | string  | `small` \| `medium` \| `large` \| `extra-large`  | `medium`   |
| `label`    | string  | any                                               |   |
| `disabled` | boolean |   |   |

**Size variants:**

| Value         | Padding           | Font size  |
|---------------|-------------------|------------|
| `small`       | 0.3rem 0.65rem    | 0.8rem     |
| `medium`      | 0.7rem 1rem       | 1rem       |
| `large`       | 0.85rem 1.4rem    | 1.125rem   |
| `extra-large` | 1.1rem 1.9rem     | 1.375rem   |

---

### `<td-button-group>`

A layout wrapper for grouped button actions. Use it to keep related actions together in a connected horizontal strip.

Button variants come from each child `<td-button>`: use default (primary), `success`, `warning`, and `alert` exactly as you would outside a group.

Usage guidance:
- Group only closely related actions in one context.
- Keep ordering intentional (primary action first, destructive action last).
- Use `pill` when you want rounded outer edges for a segmented control look.

```html
<td-button-group gap="0.5rem" align="center" justify="start">
  <td-button>Save</td-button>
  <td-button variant="warning">Review</td-button>
  <td-button variant="alert">Delete</td-button>
</td-button-group>

<td-button-group pill>
  <td-button>Draft</td-button>
  <td-button variant="success">Publish</td-button>
  <td-button variant="alert">Archive</td-button>
</td-button-group>
```

| Attribute    | Type    | Values                                                                 | Default   |
|--------------|---------|------------------------------------------------------------------------|-----------|
| `wrap`       | boolean |                                                                        |           |
| `gap`        | string  | Any valid CSS gap value                                                | `0.5rem`  |
| `align`      | string  | `start` \| `center` \| `end` \| `stretch`                            | `stretch` |
| `justify`    | string  | `start` \| `center` \| `end` \| `between` \| `around` \| `evenly` | `start`   |
| `full-width` | boolean |                                                                        |           |
| `pill`       | boolean | Fully rounds the left side of the first button and the right side of the last button |           |

---

### `<td-text-input>`

A styled input field with label, size variants, validation states, and accessibility support.

```html
<td-text-input
  type="email"
  label="Email Address"
  placeholder="name@example.com"
  size="large"
  required
  error
></td-text-input>
```

| Attribute     | Type    | Values                                            | Default      |
|---------------|---------|---------------------------------------------------|--------------|
| `type`        | string  | any HTML input type                               | `text`       |
| `label`       | string  | any                                               |   |
| `placeholder` | string  | any                                               | `Enter text` |
| `value`       | string  | any                                               | `""`         |
| `name`        | string  | any                                               | `""`         |
| `size`        | string  | `small` \| `medium` \| `large` \| `extra-large`  | `medium`     |
| `required`    | boolean |   |   |
| `disabled`    | boolean |   |   |
| `error`       | boolean |   |   |

**Size variants:**

| Value         | Height  | Font size  | Use case                        |
|---------------|---------|------------|---------------------------------|
| `small`       | 1.75rem | 0.8rem     | Compact UIs, table cell editors |
| `medium`      | 2.75rem | 1rem       | Default: standard forms        |
| `large`       | 3.25rem | 1.125rem   | Prominent inputs, hero search   |
| `extra-large` | 4rem    | 1.375rem   | Display-scale inputs            |

---

### `<td-date-picker>`

A fully accessible calendar date picker built as a native Custom Element. Opens a month-view popup with keyboard navigation, supports `min`/`max` date constraints, configurable display formats, all four size variants, and form integration via a hidden `<input>` with the ISO 8601 value.

Try it in the examples app: `/examples/date-picker`.

```html
<!-- Basic -->
<td-date-picker label="Date of Birth" name="dob" placeholder="Select a date"></td-date-picker>

<!-- Pre-selected value -->
<td-date-picker label="Appointment" value="2025-12-25"></td-date-picker>

<!-- Custom display formats (stored/emitted value stays YYYY-MM-DD) -->
<td-date-picker display-format="MM/DD/YYYY"></td-date-picker>
<td-date-picker display-format="DD/MM/YYYY"></td-date-picker>
<td-date-picker display-format="MMMM Do, YYYY"></td-date-picker>
<td-date-picker display-format="dddd, MMMM D, YYYY"></td-date-picker>
<td-date-picker display-format="ddd MMM DD, YYYY"></td-date-picker>

<!-- Date range constraint -->
<td-date-picker label="Available Dates" min="2025-01-01" max="2025-12-31"></td-date-picker>

<!-- States -->
<td-date-picker disabled></td-date-picker>
<td-date-picker required></td-date-picker>
<td-date-picker error></td-date-picker>
```

Listen to selection changes:

```js
// e.detail.value is always YYYY-MM-DD regardless of display-format
const picker = document.querySelector('td-date-picker');
picker.addEventListener('change', (e) => {
  console.log('ISO date:', e.detail.value); // e.g. "2025-12-25"
});

// Programmatic API
picker.getValue();             // → current ISO date string or ""
picker.setValue('2025-06-15'); // sets and re-renders
picker.clear();                // clears the selection
```

| Attribute        | Type    | Values                                           | Default         |
|------------------|---------|--------------------------------------------------|-----------------|
| `label`          | string  | any                                              |                 |
| `name`           | string  | any                                              | `""`            |
| `value`          | string  | `YYYY-MM-DD`                                     | `""`            |
| `placeholder`    | string  | any                                              | `Select a date` |
| `display-format` | string  | Format string using tokens below                 | `MMMM D, YYYY`  |
| `size`           | string  | `small` \| `medium` \| `large` \| `extra-large` | `medium`        |
| `min`            | string  | `YYYY-MM-DD`                                     |                 |
| `max`            | string  | `YYYY-MM-DD`                                     |                 |
| `disabled`       | boolean |                                                  |                 |
| `required`       | boolean |                                                  |                 |
| `error`          | boolean |                                                  |                 |

**Format tokens** (longer tokens always take precedence in alternation):

| Token  | Output                  | Example     |
|--------|-------------------------|-------------|
| `YYYY` | 4-digit year            | `2026`      |
| `YY`   | 2-digit year            | `26`        |
| `MMMM` | Full month name         | `January`   |
| `MMM`  | Short month name        | `Jan`       |
| `MM`   | 2-digit month           | `01`        |
| `M`    | Month (no leading zero) | `1`         |
| `dddd` | Full weekday name       | `Monday`    |
| `ddd`  | Short weekday name      | `Mon`       |
| `DD`   | 2-digit day             | `06`        |
| `Do`   | Day with ordinal suffix | `6th`       |
| `D`    | Day (no leading zero)   | `6`         |

**Common format presets:**

| Format string              | Example output            |
|----------------------------|---------------------------|
| `MM/DD/YYYY`               | `07/14/2026`              |
| `MM/DD/YY`                 | `07/14/26`                |
| `DD/MM/YYYY`               | `14/07/2026`              |
| `YYYY-MM-DD`               | `2026-07-14`              |
| `MMMM D, YYYY` *(default)* | `July 14, 2026`           |
| `MMMM Do, YYYY`            | `July 14th, 2026`         |
| `MMM D, YYYY`              | `Jul 14, 2026`            |
| `D MMMM YYYY`              | `14 July 2026`            |
| `Do MMMM YYYY`             | `14th July 2026`          |
| `dddd, MMMM D, YYYY`       | `Tuesday, July 14, 2026`  |
| `ddd, MMM D`               | `Tue, Jul 14`             |

**Keyboard navigation:**

| Key                              | Action                                |
|----------------------------------|---------------------------------------|
| `Enter` / `Space` / `↓` on input | Opens the calendar                    |
| `Arrow keys` in calendar         | Move focus between days               |
| `Enter` / `Space` on a day       | Selects the day                       |
| `Escape`                         | Closes the calendar without selecting |

**Events:** `change` (bubbles, composed)  -  fires on day selection with `{ detail: { value: 'YYYY-MM-DD' } }`.

---

### `<td-file-input>`

Drag-and-drop or click-to-upload file picker with type filtering, optional max file size, size variants, and customizable drop-zone labels/content.

Try it in the examples app: `/examples/file-input`.

```html
<td-file-input label="Upload Attachment"></td-file-input>

<td-file-input
  label="Upload Images"
  mode="multiple"
  accept="image/*"
  max-size="5MB"
  size="large"
  drop-title="Drop image files"
  drop-subtitle="or click to browse"
  accepted-label="Allowed types"
  max-size-label="Per-file limit"
  no-files-label="Nothing selected yet"
></td-file-input>

<td-file-input label="Custom Content" mode="multiple">
  <div slot="content">
    <strong>Drop assets here</strong>
    <span style="display:block">PNG, JPG, SVG, PDF</span>
  </div>
</td-file-input>
```

| Attribute | Type | Values | Default |
|---|---|---|---|
| `label` | string | any | `File Upload` |
| `size` | string | `small` \| `medium` \| `large` \| `extra-large` | `medium` |
| `accept` | string | Standard file input accept syntax, e.g. `image/*`, `.pdf,.docx`, `application/pdf` | `*/*` |
| `mode` | string | `single` \| `multiple` | `single` |
| `multiple` | boolean | Legacy/alternate multi-file flag (equivalent to `mode="multiple"`) |   |
| `max-size` | string/number | Bytes (`1048576`) or unit strings (`500KB`, `5MB`, `1GB`) |   |
| `drop-title` | string | any | `Drag and drop files here` |
| `drop-subtitle` | string | any | `or click to browse` |
| `accepted-label` | string | any | `Accepted` |
| `max-size-label` | string | any | `Max size per file` |
| `no-files-label` | string | any | `No file selected` |
| `disabled` | boolean |   |   |

**Slots:**

- `content`: Replaces the default drop-zone body with custom markup.

**Events:**

- `change`: `detail: { files: File[], names: string[] }` for accepted files.
- `file-reject`: `detail: { rejectedByType: string[], rejectedBySize: string[], maxSizeBytes: number | null }` when dropped/selected files are filtered out.

**JS properties:**

- `files`: returns the currently accepted `File[]`.
- `label`: get/set label text.
- `multiple`: get/set multi-file mode (`boolean`).

---

### `<td-select>`

A styled select dropdown supporting option groups, multiple selection, and accessibility.

```html
<td-select label="Favorite Fruit" name="fruit" value="orange">
  <option value="apple">Apple</option>
  <option value="orange">Orange</option>
  <optgroup label="Berries">
    <option value="strawberry">Strawberry</option>
  </optgroup>
</td-select>
```

| Attribute  | Type    | Default |
|------------|---------|---------|
| `label`    | string  |   |
| `name`     | string  |   |
| `value`    | string  |   |
| `size`     | string  | `medium` |
| `required` | boolean |   |
| `disabled` | boolean |   |
| `multiple` | boolean |   |

**Size variants:**

| Value         | Height  | Font size  |
|---------------|---------|------------|
| `small`       | 1.75rem | 0.8rem     |
| `medium`      | 2.75rem | 1rem       |
| `large`       | 3.25rem | 1.125rem   |
| `extra-large` | 4rem    | 1.375rem   |

**Events:** `change`: `detail: { value: string }`

**Methods:** `value` getter/setter

---

### `<td-checkbox>`

A styled checkbox with label, error state, and accessibility support.

```html
<td-checkbox label="Accept terms" name="terms" required></td-checkbox>
<td-checkbox label="Subscribe to newsletter" name="subscribe" checked></td-checkbox>
<td-checkbox label="Disabled option" disabled></td-checkbox>
```

```js
const cb = document.querySelector('td-checkbox');
cb.checked = true;
cb.addEventListener('change', e => console.log(e.detail)); // { checked, value }
```

| Attribute  | Type    | Default | Description |
|------------|---------|---------|-------------|
| `label`    | string  |         | Text label displayed beside the checkbox |
| `name`     | string  | `""`    | Form field name |
| `value`    | string  | `on`    | Value submitted when checked |
| `checked`  | boolean |         | Pre-checked state |
| `disabled` | boolean |         | Disables interaction |
| `required` | boolean |         | Marks the field as required |
| `error`    | boolean |         | Shows error state and message |

**Events:** `change`: `detail: { checked: boolean, value: string }`

**JS properties:** `checked` (get/set `boolean`), `disabled` (get/set `boolean`)

---

A dropdown multi-select component. Clicking the trigger opens a checkbox list; selected items are shown as pill badges inside the trigger with an `×` to deselect individually. Supports live search, a Select/Deselect All row, and can be populated via JSON `options`, native HTML `<option>/<optgroup>` children, or the JS `options` setter.

```html
<!-- Static with search and select-all -->
<td-multi-select
  label="Favorite Fruits"
  search
  select-all
  options='[{"value":"apple","label":"Apple"},{"value":"banana","label":"Banana"}]'
  value='["banana"]'>
</td-multi-select>

<!-- Native HTML options -->
<td-multi-select label="Frameworks" search select-all>
  <optgroup label="Frontend">
    <option value="react">React</option>
    <option value="vue">Vue</option>
  </optgroup>
  <optgroup label="Backend">
    <option value="express">Express</option>
  </optgroup>
</td-multi-select>
```

```js
// Dynamic (API-populated)
const ms = document.querySelector('td-multi-select');
fetch('https://api.example.com/categories')
  .then(r => r.json())
  .then(data => {
    ms.options = data.map(c => ({ value: c.id, label: c.name }));
  });
ms.addEventListener('change', e => console.log(e.detail.value));
```

| Attribute            | Type    | Default       | Description |
|----------------------|---------|---------------|-------------|
| `label`              | string  |               | Display label shown above the trigger |
| `size`               | string  | `medium`      | `small` \| `medium` \| `large` \| `extra-large` |
| `options`            | string  |               | JSON array of `{ value, label }` objects. Optional when using HTML `<option>` children |
| `value`              | string  |               | JSON array of initially selected values |
| `search`             | boolean |               | Shows a live search input at the top of the dropdown |
| `search-placeholder` | string  | `"Search..."` | Placeholder text for the search input |
| `select-all`         | boolean |               | Adds a Select all / Deselect all row (three-state checkbox: empty / partial / full) |
| `placeholder`        | string  |               | Trigger placeholder when nothing is selected. Falls back to `label` if not set |

**Size variants:**

| Value         | Height  | Font size  |
|---------------|---------|------------|
| `small`       | 1.75rem | 0.8rem     |
| `medium`      | 2.75rem | 1rem       |
| `large`       | 3.25rem | 1.125rem   |
| `extra-large` | 4rem    | 1.375rem   |

**Events:** `change`: `detail: { value: string[] }` - fires on every toggle with the full selected array

**JS properties:** `options` (get/set `MultiSelectOption[]`), `value` (get/set `string[]`)

**Keyboard:** `Enter`/`Space` toggle, `ArrowDown`/`ArrowUp` navigate, `Escape` closes the dropdown

---

### `<td-tabs>`

A tabbed content container with keyboard navigation.

```html
<td-tabs labels="Overview | Details | Settings" default-tab="0">
  <div slot="tab-0"><p>Overview content</p></div>
  <div slot="tab-1"><p>Details content</p></div>
  <div slot="tab-2"><p>Settings content</p></div>
</td-tabs>
```

| Attribute     | Type   | Default |
|---------------|--------|---------|
| `labels`      | string |   |
| `default-tab` | number | `0`     |

Labels are pipe-separated: `"Tab 1 | Tab 2 | Tab 3"`.

**Events:** `tab-changed`: `detail: { activeIndex: number }`

**Slots:** `tab-0`, `tab-1`, `tab-2`, etc.

---

### `<td-accordion>`

Expandable content sections with optional multi-open support and keyboard navigation.

```html
<td-accordion
  items="3"
  item-0-title="Section One"
  item-1-title="Section Two"
  item-2-title="Section Three"
  allow-multiple
>
  <div slot="item-0"><p>First section content</p></div>
  <div slot="item-1"><p>Second section content</p></div>
  <div slot="item-2"><p>Third section content</p></div>
</td-accordion>
```

| Attribute        | Type    | Default |
|------------------|---------|---------|
| `items`          | number  |   |
| `item-{n}-title` | string  |   |
| `allow-multiple` | boolean |   |

**Events:** `accordion-toggle`: `detail: { activeIndex: number, isActive: boolean }`

**Slots:** `item-0`, `item-1`, `item-2`, etc.

---

### `<td-modal>`

A centered dialog overlay with focus trap and keyboard support.

```html
<td-modal
  title="Confirm Action"
  close-on-overlay
  close-on-escape
  width="600px"
>
  <p>Are you sure you want to continue?</p>
  <td-button type="button">Confirm</td-button>
</td-modal>
```

| Attribute         | Type    | Default  |
|-------------------|---------|----------|
| `title`           | string  | `Modal`  |
| `width`           | string  | `500px`  |
| `close-on-overlay`| boolean |   |
| `close-on-escape` | boolean |   |

**Methods:** `close()`

**Slots:** Default slot for modal body content.

---

### `<td-loader>`

A loading spinner overlay with optional message, size, color, and containment.

```html
<td-loader
  message="Loading..."
  size="64px"
  color="#FF8C00"
  variant="dots"
  contained
></td-loader>
```

| Attribute   | Type    | Values             | Default    |
|-------------|---------|--------------------|------------|
| `message`   | string  | any                |   |
| `size`      | string  | any CSS size       | `48px`     |
| `color`     | string  | any CSS color      | primary    |
| `variant`   | string  | `spinner`, `dots`  | `spinner`  |
| `contained` | boolean |   |:          |

**Methods:** `show()`, `hide()`

**Events:** `loader-show`, `loader-hide`

---

### `<td-carousel>`

A responsive slideshow component with animated transitions, dot indicators, prev/next arrows, touch swipe, keyboard navigation, and optional autoplay. Slides are placed via named slots and can contain any HTML or other components.

```html
<!-- Basic image carousel -->
<td-carousel label="Nature Photography">
  <div slot="slide-0">
    <img src="photo1.jpg" alt="Mountain landscape" style="width:100%">
    <p>Caption one</p>
  </div>
  <div slot="slide-1">
    <img src="photo2.jpg" alt="Ocean waves" style="width:100%">
    <p>Caption two</p>
  </div>
  <div slot="slide-2">
    <img src="photo3.jpg" alt="Forest path" style="width:100%">
    <p>Caption three</p>
  </div>
</td-carousel>

<!-- Autoplay with loop -->
<td-carousel label="Highlights" autoplay loop interval="4000">
  <div slot="slide-0"><p>Slide one</p></div>
  <div slot="slide-1"><p>Slide two</p></div>
  <div slot="slide-2"><p>Slide three</p></div>
</td-carousel>
```

**Inside a `<td-modal>`:**

```js
const modal = document.createElement("td-modal");
modal.setAttribute("title", "Gallery");
modal.setAttribute("close-on-overlay", "");
modal.setAttribute("close-on-escape", "");

const carousel = document.createElement("td-carousel");
carousel.setAttribute("label", "Gallery");

const slide = document.createElement("div");
slide.setAttribute("slot", "slide-0");
slide.innerHTML = `<img src="photo.jpg" alt="Photo" style="width:100%">`;
carousel.appendChild(slide);

modal.appendChild(carousel);
document.body.appendChild(modal);
```

| Attribute  | Type    | Default    | Description |
|------------|---------|------------|-------------|
| `label`    | string  | `Carousel` | Accessible name for the carousel region (`aria-label`) |
| `loop`     | boolean |            | Wraps around from the last slide back to the first (and vice versa) |
| `autoplay` | boolean |            | Automatically advances to the next slide on an interval |
| `interval` | number  | `4000`     | Milliseconds between auto-advances (requires `autoplay`; minimum `500`) |

**Slots:** `slide-0`, `slide-1`, `slide-2`, ... one slot per slide, zero-indexed. Any HTML or components are valid slot content.

**Events:** `slide-change`: `detail: { index: number, total: number }` fires on every slide transition.

**Methods:** `next()`, `prev()`, `goTo(n: number)` navigate programmatically.

**Properties:** `currentIndex` (read-only) zero-based index of the visible slide.

**Keyboard:** `ArrowLeft` / `ArrowRight` navigate between slides. Dot indicators are fully keyboard accessible with `Tab` and `Enter`/`Space`.

**Touch:** Swipe left/right on touch devices to advance or go back (threshold: 40 px).

---

### `<td-theme-toggle>`

A button that toggles between light and dark themes.

```html
<td-theme-toggle></td-theme-toggle>
```

No attributes, methods, or events.

---

### `<td-link>`

An internal navigation link that uses the router instead of a full page reload. Supports a `button` mode that renders the link styled identically to `<td-button>`.

```html
<!-- Plain links -->
<td-link href="/examples">Examples</td-link>
<td-link to="/about" label="About" title="Go to about page"></td-link>
<td-link href="https://github.com/Yoyomojo/turbodogui" new-window title="View on GitHub">GitHub</td-link>

<!-- Button-styled links -->
<td-link href="/examples" button>Examples</td-link>
<td-link href="/examples" button variant="success">Go</td-link>
<td-link href="/examples" button variant="warning">Warning</td-link>
<td-link href="/examples" button variant="alert">Alert</td-link>
<td-link href="/examples" button disabled>Disabled</td-link>

<!-- Button-styled link sizes -->
<td-link href="/" button size="small">Small</td-link>
<td-link href="/" button size="medium">Medium</td-link>
<td-link href="/" button size="large">Large</td-link>
<td-link href="/" button size="extra-large">Extra Large</td-link>
```

| Attribute    | Type    | Default  | Description |
|--------------|---------|----------|-------------|
| `href`       | string  | `/`      | Route path or URL |
| `to`         | string  |   | Alias for `href` |
| `label`      | string  |   | Link text (falls back to element text content) |
| `title`      | string  |   | Tooltip shown on hover |
| `new-window` | boolean |   | Opens in a new tab with `target="_blank" rel="noopener noreferrer"` |
| `button`     | boolean |   | Renders as a button-styled anchor |
| `size`       | string  | `medium` | `small` \| `medium` \| `large` \| `extra-large`: padding and font size (button mode only) |
| `variant`    | string  |   | `success` \| `warning` \| `alert`: applies variant colour (button mode only) |
| `disabled`   | boolean |   | Disables navigation and applies disabled styles (button mode only) |

**Size variants (button mode):**

| Size          | Padding           | Font size  | Border radius |
|---------------|-------------------|------------|---------------|
| `small`       | 0.3rem 0.65rem    | 0.8rem     | 6px           |
| `medium`      | 0.7rem 1rem       | 1rem       | 12px          |
| `large`       | 0.85rem 1.4rem    | 1.125rem   | 14px          |
| `extra-large` | 1.1rem 1.9rem     | 1.375rem   | 16px          |

> When `new-window` is present the router is bypassed and the browser handles navigation natively.

---

### `<td-table>`

A sortable, exportable data table. Accepts data via JSON attributes or JavaScript property setters.

**Static data (HTML attributes):**

```html
<td-table
  csv-export
  csv-filename="team"
  zebra
  columns='[
    {"key":"name",  "label":"Name",  "sortable":true},
    {"key":"role",  "label":"Role",  "sortable":true},
    {"key":"joined","label":"Joined","sortable":true}
  ]'
  data='[
    {"name":"Alice","role":"Engineer","joined":"2019-03-12"},
    {"name":"Bob",  "role":"Designer","joined":"2020-07-01"}
  ]'>
</td-table>
```

**Sticky header with scrollable body:**

```html
<!-- Show 5 rows at a time; header stays pinned while scrolling -->
<td-table sticky-header max-rows="5" zebra search
  columns='[{"key":"name","label":"Name","sortable":true},{"key":"role","label":"Role"}]'
  data='[...]'>
</td-table>
```

**Dynamic data (JavaScript):**

```ts
const table = document.querySelector('td-table') as UITable;

table.columns = [
  { key: 'name',  label: 'Name',  sortable: true },
  { key: 'email', label: 'Email', sortable: true },
];

table.data = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob',   email: 'bob@example.com'   },
];
```

| Attribute      | Type    | Default    | Description |
|----------------|---------|------------|-------------|
| `columns`       | string  |            | JSON array of `{ key, label, sortable?, render? }` |
| `data`          | string  |            | JSON array of row objects |
| `search`        | boolean |            | Show a live search input that filters rows across all columns |
| `csv-export`    | boolean |            | Show the Export CSV button above the table |
| `csv-filename`  | string  | `"export"` | Download filename (without extension) |
| `zebra`         | boolean |            | Alternating row background colours |
| `sticky-header` | boolean |            | Pins the `<thead>` row so it stays visible while scrolling the body |
| `max-rows`      | number  |            | Limits the visible row count and enables vertical scroll on the table body (works on its own or together with `sticky-header`) |

**Column definition:**

| Field      | Type       | Description |
|------------|------------|-------------|
| `key`      | string     | Property name matched against row data. Use `""` for group-only headers that have no data key. |
| `label`    | string     | Column header text |
| `sortable` | boolean    | Enables click-to-sort on the column (leaf columns only) |
| `children` | `TableColumn[]` | Optional sub-columns. When present the column renders as a spanning group header and `key`/`sortable` are ignored. |
| `render`   | function   | Optional: `(value, row) => string`. Return HTML string to fully control the cell's content. The cell receives `data-row-index` and `data-col-key` attributes for event delegation. |

**Nested / grouped column headers:**

Add a `children` array to any column to create a multi-row spanning header. Nesting is unlimited. Compatible with `sticky-header`; each header row sticks at the correct offset.

**Via JS property setter:**

```ts
table.columns = [
  {
    label: "Employee", key: "",
    children: [
      { key: "name",       label: "Name",       sortable: true },
      { key: "department", label: "Department",  sortable: true },
    ],
  },
  {
    label: "Performance", key: "",
    children: [
      { key: "y2024", label: "2024", sortable: true },
      { key: "y2025", label: "2025", sortable: true },
    ],
  },
  { key: "status", label: "Status", sortable: true },
];

table.data = [
  { name: "Alice", department: "Engineering", y2024: 91, y2025: 94, status: "Active" },
];
```

**Via JSON attributes (HTML):**

```html
<td-table
  zebra center-headers sticky-header max-rows="5" search csv-export csv-filename="report"
  columns='[
    {"key":"","label":"Employee","children":[
      {"key":"name","label":"Name","sortable":true},
      {"key":"department","label":"Department","sortable":true}
    ]},
    {"key":"","label":"Performance","children":[
      {"key":"y2024","label":"2024","sortable":true},
      {"key":"y2025","label":"2025","sortable":true}
    ]},
    {"key":"status","label":"Status","sortable":true}
  ]'
  data='[
    {"name":"Alice","department":"Engineering","y2024":91,"y2025":94,"status":"Active"}
  ]'>
</td-table>
```

**Via custom HTML template (manual markup):**

```html
<td-table zebra>
  <template>
    <thead>
      <tr>
        <th rowspan="2">Name</th>
        <th colspan="2">Performance</th>
        <th rowspan="2">Status</th>
      </tr>
      <tr>
        <th>2024</th>
        <th>2025</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Alice</td><td>91</td><td>94</td><td>Active</td></tr>
    </tbody>
  </template>
</td-table>
```

**Editable cells (JavaScript):**

```ts
table.columns = [
  {
    key: 'name',
    label: 'Name',
    render: (val) =>
      `<td-text-input size="small" value="${val}" placeholder="Name"></td-text-input>`,
  },
  { key: 'email', label: 'Email', sortable: true },
];

table.addEventListener('cell-change', (e) => {
  const { rowIndex, colKey, value } = e.detail;
  console.log(`Row ${rowIndex} · ${colKey}: ${value}`);
});
```

**`cell-change` event:** Fired on `input` events within rendered cells. `detail: { rowIndex: number, colKey: string, value: string }`.

**Sorting:** Click a sortable header to cycle ascending → descending → unsorted. Keyboard accessible (Enter / Space).

**JS properties:** `columns` and `data` setters trigger a re-render immediately.

**Highlighting:**

Use special `_variant` fields in row objects to apply colour-coded backgrounds. The same four variants used by `<td-button>` are available: `primary`, `success`, `warning`, `alert`.

*Row highlight*  -  add `_variant` to the row:

```ts
table.data = [
  { name: 'Alice', score: 94, status: 'Active',   _variant: 'success' },
  { name: 'Bob',   score: 55, status: 'Inactive', _variant: 'alert'   },
  { name: 'Carol', score: 67, status: 'Warning',  _variant: 'warning' },
];
```

*Cell highlight*  -  add `_variant_<colKey>` to target a single cell:

```ts
table.data = [
  { name: 'Alice', score: 95, _variant_score: 'success' },
  { name: 'Bob',   score: 42, _variant_score: 'alert'   },
  { name: 'Carol', score: 73, _variant_score: 'warning' },
];
```

*Badge spans*  -  use inside a column `render()` function for inline pill labels:

```ts
{
  key: 'status', label: 'Status',
  render: (v) => {
    const cls = v === 'Active'   ? 'badge--success'
              : v === 'Warning'  ? 'badge--warning'
              : v === 'Inactive' ? 'badge--alert'
              :                    'badge--primary';
    return `<span class="badge ${cls}">${v}</span>`;
  },
}
```

Badge class reference:

| Class | Style |
|---|---|
| `.badge--primary` | Solid primary colour |
| `.badge--success` | Solid green |
| `.badge--warning` | Solid amber |
| `.badge--alert` | Solid red |
| `.badge--primary-subtle` | Tinted background, primary text |
| `.badge--success-subtle` | Tinted background, green text |
| `.badge--warning-subtle` | Tinted background, amber text |
| `.badge--alert-subtle` | Tinted background, red text |

---

### `<td-pie-chart>`

A pie chart component for visualizing categorical data.

**Static data (HTML attribute):**

```html
<td-pie-chart
  height="300"
  data='[
    {"label":"Apples","value":30,"color":"#e57373"},
    {"label":"Bananas","value":20,"color":"#ffd54f"},
    {"label":"Cherries","value":25,"color":"#81c784"},
    {"label":"Dates","value":15,"color":"#64b5f6"},
    {"label":"Elderberries","value":10,"color":"#ba68c8"}
  ]'
  colors='["#e57373","#ffd54f","#81c784","#64b5f6","#ba68c8"]'
  show-values
></td-pie-chart>
```

**Dynamic data (JavaScript/TypeScript):**

```ts
import { getPieChartData } from "../api/example-pie-chart-data";

const data = await getPieChartData();
const pie = document.getElementById("pie-demo") as UIPieChart;
pie.data = data;
```

| Attribute         | Type    | Default  | Description |
|-------------------|---------|----------|-------------|
| `data`            | string  |   | JSON array of `{ label, value, color? }` |
| `src`             | string  |   | URL to fetch JSON data from: array of `{ label, value }` |
| `colors`          | string  |   | JSON array of fallback colors |
| `title`           | string  |   | Bold title displayed above the chart |
| `height`          | number  | `200`    | Chart height in px |
| `width`           | string  | `100%`   | CSS width value |
| `legend-position` | string  | `bottom` | `top` \| `bottom` \| `left` \| `right` |
| `show-values`     | boolean |   | Renders a percentage label centered inside each slice (slices <5° are skipped) |

---

### `<td-dropdown>`

An accessible dropdown menu built as a native Custom Element. The trigger label updates to reflect the selected item, the panel anchors to the viewport so it always renders above overflow-clipping containers, and items can come from HTML children, a JSON attribute, or a remote API endpoint.

Try it in the examples app: `/examples/dropdown`.

```html
<!-- HTML slot items -->
<td-dropdown label="Actions">
  <button type="button">Edit</button>
  <button type="button">Duplicate</button>
  <hr>
  <a href="/delete">Delete</a>
</td-dropdown>

<!-- JSON items -->
<td-dropdown
  label="File"
  items='[
    {"label":"New",   "value":"new"},
    {"label":"Open",  "value":"open"},
    {"label":"---"},
    {"label":"Export","value":"export"},
    {"label":"Delete","value":"delete","disabled":true}
  ]'
></td-dropdown>

<!-- Remote API (endpoint must return DropdownItem[]) -->
<td-dropdown label="Load from API" src="/api/menu-items.json"></td-dropdown>

<!-- Variants and sizes -->
<td-dropdown label="Primary" variant="primary" items="[…]"></td-dropdown>
<td-dropdown label="Small"   size="small"   items="[…]"></td-dropdown>

<!-- Placement -->
<td-dropdown label="Top end" placement="top-end" items="[…]"></td-dropdown>
```

Listen for selection:

```js
dropdown.addEventListener('select', (e) => {
  console.log(e.detail); // { value: 'new', label: 'New' }
});

// Programmatic API
dropdown.value = 'open';  // pre-select an item and update the trigger label
dropdown.value = null;    // clear selection, restore placeholder label
dropdown.open();          // open programmatically
dropdown.close();         // close programmatically
console.log(dropdown.isOpen); // boolean
```

**JSON item schema** (`DropdownItem`):

| Field      | Type    | Description |
|------------|---------|-------------|
| `label`    | string  | Display text. Use `"---"` or set `divider: true` for a separator |
| `value`    | string  | Emitted in the `select` event; triggers label update on the trigger |
| `href`     | string  | Renders the item as an `<a>` link; navigation items do not update the trigger |
| `target`   | string  | Link target, e.g. `"_blank"` |
| `icon`     | string  | Raw HTML (typically an inline SVG) rendered before the label |
| `disabled` | boolean | Dims the item and blocks interaction |
| `divider`  | boolean | Renders a horizontal rule separator |

| Attribute   | Type    | Values | Default |
|-------------|---------|--------|---------|
| `label`     | string  | any    | `"Menu"` |
| `value`     | string  | any    | — |
| `items`     | string  | JSON `DropdownItem[]` | — |
| `src`       | string  | URL    | — |
| `placement` | string  | `bottom-start` \| `bottom-end` \| `top-start` \| `top-end` | `bottom-start` |
| `variant`   | string  | `primary` \| `success` \| `warning` \| `alert` | — |
| `size`      | string  | `small` \| `medium` \| `large` \| `extra-large` | `medium` |
| `disabled`  | boolean | | — |

**Events:** `select` (bubbles, composed) — fires on item selection with `{ detail: { value, label } }`.

---

### `<td-donut-chart>`

A donut (ring) chart: identical to `<td-pie-chart>` but renders a hollow center with a configurable hole size and optional center label.

**Static data (HTML attribute):**

```html
<td-donut-chart
  height="300"
  hole-size="0.6"
  center-label="Total"
  data='[
    {"label":"Apples","value":30,"color":"#e57373"},
    {"label":"Bananas","value":20,"color":"#ffd54f"},
    {"label":"Cherries","value":25,"color":"#81c784"},
    {"label":"Dates","value":15,"color":"#64b5f6"},
    {"label":"Elderberries","value":10,"color":"#ba68c8"}
  ]'
  colors='["#e57373","#ffd54f","#81c784","#64b5f6","#ba68c8"]'
  show-values
></td-donut-chart>
```

**Dynamic data (JavaScript/TypeScript):**

```ts
import { getDonutChartData } from "../api/example-donut-chart-data";

const data = await getDonutChartData();
const donut = document.getElementById("donut-demo") as UIDonutChart;
donut.data = data;
```

| Attribute         | Type    | Default  | Description |
|-------------------|---------|----------|-------------|
| `data`            | string  |   | JSON array of `{ label, value, color? }` |
| `src`             | string  |   | URL to fetch JSON data from: array of `{ label, value }` |
| `colors`          | string  |   | JSON array of fallback colors |
| `title`           | string  |   | Bold title displayed above the chart |
| `hole-size`       | number  | `0.6`    | Inner radius as a fraction of the outer radius (0.1 to 0.95) |
| `center-label`    | string  |   | Text rendered in the center hole of the ring |
| `height`          | number  | `200`    | Chart height in px |
| `width`           | string  | `100%`   | CSS width value |
| `legend-position` | string  | `bottom` | `top` \| `bottom` \| `left` \| `right` |
| `show-values`     | boolean |   | Renders a percentage label on each arc segment (segments <5° are skipped) |

---

### `<td-drawer>`

A slide-in panel anchored to any viewport edge. Controlled via the `open` attribute or `open()`/`close()` methods. Left and right drawers span the full viewport height; top and bottom drawers span the full viewport width.

```html
<!-- Trigger -->
<td-button id="open-btn">Open Drawer</td-button>

<!-- Drawer (closed by default) -->
<td-drawer id="my-drawer" title="Settings" position="right" width="400px">
  <p>Content goes here.</p>
</td-drawer>

<script>
  document.getElementById('open-btn')
    .addEventListener('click', () => document.getElementById('my-drawer').open());

  document.getElementById('my-drawer')
    .addEventListener('drawer-close', () => console.log('closed'));
</script>
```

| Attribute  | Type   | Default  | Description |
|------------|--------|----------|-------------|
| `position` | string | `right`  | `top` \| `right` \| `bottom` \| `left`  -  which edge the drawer slides from |
| `width`    | string | `320px`  | Panel width; applies to `left`/`right` drawers |
| `height`   | string | `320px`  | Panel height; applies to `top`/`bottom` drawers |
| `title`    | string |          | Header title text |
| `open`     | boolean attr | | Present when the drawer is visible |

**JS API:** `drawer.open()` / `drawer.close()`  -  also togglable via `setAttribute`/`removeAttribute('open')`.

**Events:** `drawer-close` (bubbles, composed)  -  fires on close button click, overlay click, or Escape key.

**Accessibility:** Rendered as `role="dialog" aria-modal="true"`. Close button receives focus on open; Escape key always closes.

---

### `<td-bar-chart>`

A vertical or horizontal bar chart with interactive legend, axis grid lines, and auto-scaling labels.

**Static data (HTML attribute):**

```html
<td-bar-chart
  title="Avg Price by Category"
  height="300"
  width="100%"
  legend-position="bottom"
  show-values
  data='[
    {"label":"Q1","value":40,"color":"#42a5f5"},
    {"label":"Q2","value":55,"color":"#66bb6a"},
    {"label":"Q3","value":30,"color":"#ffa726"}
  ]'
  colors='["#42a5f5","#66bb6a","#ffa726"]'
></td-bar-chart>
```

**Horizontal mode:**

```html
<td-bar-chart
  horizontal
  title="Avg Price by Category"
  width="100%"
  legend-position="left"
  data='[{"label":"Accessories","value":45},{"label":"Laptops","value":125}]'
></td-bar-chart>
```

**Dynamic data (JavaScript/TypeScript):**

```ts
import { getBarChartData } from "../api/example-bar-chart-data";

const data = await getBarChartData();
const bar = document.getElementById("bar-demo") as UIBarChart;
bar.data = data;
```

| Attribute          | Type    | Default  | Description |
|--------------------|---------|----------|-------------|
| `data`             | string  |   | JSON array of `{ label, value, color? }` |
| `src`              | string  |   | URL to fetch JSON data from: array of `{ label, value }` |
| `colors`           | string  |   | JSON array of fallback colors |
| `title`            | string  |   | Bold title displayed above the chart |
| `height`           | number  | `200`    | Chart height in px (ignored in horizontal mode) |
| `width`            | string  | `100%`   | CSS width value |
| `horizontal`       | boolean |   | Render bars horizontally |
| `font-size`        | number  | auto     | Label font size in px; auto-scales to chart area if omitted |
| `legend-position`  | string  | `bottom` | `top` \| `bottom` \| `left` \| `right` |
| `show-values`      | boolean |   | Renders value labels on each bar: above vertical bars, to the right of horizontal bars |
| `reference-lines`  | string  |   | JSON array of `{ value, label?, color? }`: overlays dashed horizontal target lines (vertical mode only) |
| `line-series`      | string  |   | JSON array of `{ label, values: number[], color? }`: overlays line series with dots on top of bars (vertical mode only) |
| `bar-series`       | string  |   | JSON array of `{ label, values: number[], color? }`: activates grouped multi-series mode |
| `categories`       | string  |   | JSON string array: x-axis category labels for grouped mode (defaults to `"1"`, `"2"`, … if omitted) |
| `group-tooltip`    | boolean |   | Grouped mode only: hovering any bar highlights all bars in that category group and shows a combined tooltip listing every series' value for that group |

**Reference line definition:**

| Field   | Type   | Description |
|---------|--------|-------------|
| `value` | number | Y-axis position of the line |
| `label` | string | Optional: shown on the chart and in the legend |
| `color` | string | Optional CSS color: defaults to `#ef5350` |

**Line series definition:**

| Field    | Type       | Description |
|----------|------------|-------------|
| `label`  | string     | Series name: shown in the legend and tooltip |
| `values` | `number[]` | One value per bar category (must match bar count) |
| `color`  | string     | Optional CSS color: auto-assigned if omitted |

**Features:**
- Legend items are clickable to toggle individual bars, reference lines, and line series on/off
- Hover or focus a legend item to highlight the corresponding bar
- Labels auto-angle at -40° when bars are too narrow to fit horizontal text
- Label font size dynamically scales with available bar width/height
- Reference lines and line series automatically expand the Y-axis scale if their values exceed the data max
- `group-tooltip` mode highlights the entire category group on hover and shows all series values in a single combined tooltip
- Tooltips are edge-clamped to the chart area so they never overflow on any side

---

### `<td-line-chart>`

A multi-series line chart with interactive tooltips, toggleable legend, and auto-angling x-axis labels.

**Static data (HTML attribute):**

```html
<td-line-chart
  title="My Chart"
  height="400"
  width="100%"
  legend-position="bottom"
  x-labels='["Jan","Feb","Mar","Apr"]'
  data='[
    {"label":"Series A","values":[10,25,18,30]},
    {"label":"Series B","values":[5,12,20,15]}
  ]'
  colors='["#42a5f5","#66bb6a"]'
></td-line-chart>
```

**Dynamic data (JavaScript/TypeScript):**

```ts
import { getLineChartData } from "../api/example-line-chart-data";

const { labels, data } = await getLineChartData();
const chart = document.getElementById("line-demo") as UILineChart;
chart.setAttribute("x-labels", JSON.stringify(labels));
chart.data = data;
```

| Attribute         | Type    | Default  | Description |
|-------------------|---------|----------|-------------|
| `data`            | string  |   | JSON array of `{ label, values: number[], color? }` series objects |
| `src`             | string  |   | URL to fetch JSON data from: `{ labels: string[], data: { label, values }[] }` |
| `x-labels`        | string  |   | JSON array of strings for the x-axis category labels |
| `colors`          | string  |   | JSON array of fallback colors (used when a series has no `color`) |
| `title`           | string  |   | Bold title displayed above the chart |
| `height`          | number  | `300`    | Chart height in px |
| `width`           | string  | `100%`   | CSS width value |
| `legend-position` | string  | `bottom` | `top` \| `bottom` \| `left` \| `right` |
| `show-values`     | boolean |   | Renders value labels above each data point, colored to match the series |

**Features:**
- Multiple series rendered as separate labelled lines
- Tooltips on every data point showing series name, x-label, and value
- Legend items are clickable to toggle individual series on/off
- Hover a legend item to highlight its line and dim others
- X-axis labels auto-angle at -40° when there are too many points to fit
- Keyboard accessible: Tab to each data point, tooltip shown on focus

---

### `<td-bubble-chart>`

A multi-series bubble chart where each point has `x`, `y`, and `r` (radius/size) dimensions. Axes auto-scale, bubbles are proportionally sized, and multiple datasets can be toggled via the interactive legend.

**Static data (HTML attribute):**

```html
<td-bubble-chart
  title="Products: Price vs Stock"
  height="360"
  width="100%"
  x-label="Avg Price ($)"
  y-label="Avg Stock"
  legend-position="bottom"
  show-values
  data='[
    {
      "label": "High Volume",
      "color": "#4db6ac",
      "points": [
        { "x": 30, "y": 120, "r": 8, "label": "Groceries" },
        { "x": 55, "y": 80,  "r": 6, "label": "Cosmetics" }
      ]
    },
    {
      "label": "Low Volume",
      "color": "#f06292",
      "points": [
        { "x": 800, "y": 15, "r": 3, "label": "Laptops" },
        { "x": 400, "y": 25, "r": 4, "label": "Smartphones" }
      ]
    }
  ]'
></td-bubble-chart>
```

**Dynamic data (JavaScript/TypeScript setter):**

```ts
const chart = document.getElementById("bubble-demo") as any;
chart.data = [
  {
    label: "Series A",
    color: "#4db6ac",
    points: [
      { x: 30, y: 120, r: 8, label: "Groceries" },
      { x: 55, y: 80,  r: 6, label: "Cosmetics" }
    ]
  }
];
```

**API / fetch (src attribute):**

```html
<td-bubble-chart src="/api/bubble-data.json"></td-bubble-chart>
```

The JSON at that URL should be an array of series objects (same shape as the `data` attribute), or `{ "data": [...] }`.

**Series object:**

| Field    | Type           | Description |
|----------|----------------|-------------|
| `label`  | string         | Series name shown in the legend |
| `color`  | string         | Optional CSS color; auto-assigned if omitted |
| `points` | `BubblePoint[]` | Array of data points for this series |

**Point object (`BubblePoint`):**

| Field   | Type   | Description |
|---------|--------|-------------|
| `x`     | number | Horizontal axis value |
| `y`     | number | Vertical axis value |
| `r`     | number | Bubble size (relative; scaled proportionally between 6-32 px) |
| `label` | string | Optional label shown in the tooltip and inside the bubble when `show-values` is set |

**Attributes:**

| Attribute         | Type    | Default  | Description |
|-------------------|---------|----------|-------------|
| `data`            | string  |          | JSON array of series objects |
| `src`             | string  |          | URL to fetch JSON data from |
| `colors`          | string  |          | JSON array of fallback CSS colors |
| `title`           | string  |          | Bold title displayed above the chart |
| `height`          | number  | `360`    | SVG height in px |
| `width`           | string  | `100%`   | CSS width value |
| `x-label`         | string  |          | Label displayed below the X axis |
| `y-label`         | string  |          | Label displayed to the left of the Y axis |
| `legend-position` | string  | `bottom` | `top` \| `bottom` \| `left` \| `right` |
| `show-values`     | boolean |          | Renders the point `label` inside each bubble |

**JavaScript setters:**

| Setter    | Type             | Description |
|-----------|------------------|-------------|
| `.data`   | `BubbleSeries[]` | Set data programmatically |
| `.colors` | `string[]`       | Override the auto-color palette |
| `.height` | `number`         | Update chart height |
| `.width`  | `string`         | Update chart width |
| `.title`  | `string`         | Update chart title |

**Features:**
- Multiple series with distinct colors and a toggleable legend
- Bubbles sized proportionally to the `r` value (clamped between 6 and 32 px radius)
- Auto-scaling X and Y axes with nice tick intervals
- Dashed vertical gridlines, solid horizontal gridlines
- Hover or focus a bubble to show a tooltip with series name, x, y, and size
- Click a legend item to show/hide that series; hover to highlight/dim
- Keyboard accessible: Tab to each bubble, tooltip shown on focus
- Optional `show-values` renders point labels inside bubbles
- Supports static HTML attribute, JS setter, or remote `src` fetch

---

### `<td-radar-chart>`

A multi-series radar chart for comparing normalized scores across the same axis set. It works best when each series shares a common 0-100 style scale, making relative differences easy to compare.

**Static data (HTML attribute):**

```html
<td-radar-chart
  title="Category Score Radar"
  height="460"
  width="100%"
  legend-position="right"
  show-values
  axis-labels='["smartphones","laptops","fragrances","groceries","home-decoration","furniture"]'
  data='[
    {"label":"Affordability","values":[92,84,97,98,90,88]},
    {"label":"Availability","values":[66,48,74,92,60,55]},
    {"label":"Customer Rating","values":[88,92,84,90,86,89]},
    {"label":"Discount Appeal","values":[62,71,58,77,69,64]}
  ]'
  colors='["#42a5f5","#66bb6a","#ffa726","#ef5350"]'
></td-radar-chart>
```

**Dynamic data (JavaScript/TypeScript setter):**

```ts
const chart = document.getElementById("radar-demo") as any;
chart.setAttribute("axis-labels", JSON.stringify(["Q1", "Q2", "Q3", "Q4", "Q5"]));
chart.data = [
  { label: "Team A", values: [78, 86, 72, 91, 80] },
  { label: "Team B", values: [68, 74, 84, 79, 72] }
];
```

**API / fetch (src attribute):**

```html
<td-radar-chart src="/api/radar-data.json"></td-radar-chart>
```

The JSON at that URL can be either an array of series objects (`[{ "label": "...", "values": [...] }]`) or an object with `labels` and `data` keys.

**Series object:**

| Field   | Type       | Description |
|---------|------------|-------------|
| `label` | string     | Series name shown in the legend |
| `color` | string     | Optional CSS color; auto-assigned if omitted |
| `values` | `number[]` | One value per axis label |

**Attributes:**

| Attribute         | Type    | Default  | Description |
|-------------------|---------|----------|-------------|
| `data`            | string  |          | JSON array of series objects |
| `src`             | string  |          | URL to fetch JSON data from |
| `axis-labels`     | string  |          | JSON array of axis labels around the radar |
| `colors`          | string  |          | JSON array of fallback CSS colors |
| `title`           | string  |          | Bold title displayed above the chart |
| `height`          | number  | `420`    | SVG height in px |
| `width`           | string  | `100%`   | CSS width value |
| `legend-position` | string  | `bottom` | `top` \| `bottom` \| `left` \| `right` |
| `show-values`     | boolean |          | Renders the value label near each point |
| `max-value`       | number  |          | Optional fixed radial scale maximum |

**Features:**
- Multiple overlaid series with a toggleable legend
- Hover or focus a point to show the series label and axis value
- Optional `show-values` renders numeric labels near each point
- Supports static JSON, JS setter updates, or remote `src` loading

---

### `<td-code>`

A styled code block with a copy-to-clipboard button. Inner code is supplied via a `<template>` child element so the browser never parses it, or as plain text content.

**Via `<template>` (recommended  -  preserves HTML markup exactly):**

```html
<td-code language="html">
  <template>
    <td-button variant="success">Click me</td-button>
  </template>
</td-code>
```

**Via plain text content:**

```html
<td-code language="js">console.log('hello world');</td-code>
```

**With a filename label:**

```html
<td-code language="ts" filename="app-routes.ts">
  <template>
    import { router } from "./core/router";
    router.start();
  </template>
</td-code>
```

**Via JavaScript property setter:**

```js
const codeEl = document.querySelector('td-code');
codeEl.code = 'const x = 42;';
```

| Attribute  | Type   | Default | Description |
|------------|--------|---------|-------------|
| `language` | string |         | Badge label shown in the header (e.g. `html`, `js`, `ts`, `css`) |
| `filename` | string |         | Filename shown in the header alongside the language badge |

**JS property:** `code` (get/set string)  -  setting this overrides the `<template>` / text-content extraction and triggers a re-render.

**Copy button:** Copies the raw (unescaped) code to the clipboard using the Clipboard API with an `execCommand` fallback. Shows a checkmark for 2 seconds after a successful copy.

**CSS custom properties:**

| Variable          | Default (light/dark) | Description |
|-------------------|----------------------|-------------|
| `--td-code-bg`    | `#0d1117` / `#060d18` | Code block background |
| `--td-code-fg`    | `#e6edf3`            | Code text colour |

---

### `<td-sidebar>`

A collapsible side-navigation panel with optional search filtering, section labels, badge counts, icon support, and a responsive mobile drawer. Section labels can be stacked to create nested groupings (for example Components and Inputs). Nav items can be supplied as **static HTML markup** inside the component tags, as a **JSON `items` attribute**, or as a **JavaScript property**  -  all three modes work identically.

**HTML markup (recommended  -  declarative, no JavaScript required):**

```html
<td-sidebar search active="dashboard" label="Main Navigation">
  <span slot="header">My App</span>

  <div class="nav-section" role="listitem">
    <span class="nav-section-label">Components</span>
  </div>

  <button class="nav-item" type="button" data-key="dashboard" data-tooltip="Dashboard">
    <span class="nav-icon">🏠</span>
    <span class="nav-label">Dashboard</span>
  </button>

  <button class="nav-item" type="button" data-key="users" data-tooltip="Users">
    <span class="nav-icon">👤</span>
    <span class="nav-label">Users</span>
    <span class="nav-badge">12</span>
  </button>

  <div class="nav-section" role="listitem">
    <span class="nav-section-label">Inputs</span>
  </div>

  <button class="nav-item" type="button" data-key="button" data-tooltip="Button">
    <span class="nav-icon">🔘</span>
    <span class="nav-label">Button</span>
  </button>

  <button class="nav-item" type="button" data-key="text-input" data-tooltip="Text Input">
    <span class="nav-icon">⌨️</span>
    <span class="nav-label">Text Input</span>
  </button>

  <div class="nav-section" role="listitem">
    <span class="nav-section-label">Settings</span>
  </div>

  <button class="nav-item" type="button" data-key="profile" data-tooltip="Profile">
    <span class="nav-icon">⚙️</span>
    <span class="nav-label">Profile</span>
  </button>
</td-sidebar>
```

**Items via JSON attribute:**

```html
<td-sidebar
  search
  active="dashboard"
  label="Main Navigation"
  items='[
    {"key":"sec-components","label":"Components","section":true},
    {"key":"dashboard","label":"Dashboard","icon":"🏠"},
    {"key":"users","label":"Users","icon":"👤","badge":"12"},
    {"key":"sec-inputs","label":"Inputs","section":true},
    {"key":"button","label":"Button","icon":"🔘"},
    {"key":"text-input","label":"Text Input","icon":"⌨️"},
    {"key":"s1","label":"Settings","section":true},
    {"key":"profile","label":"Profile","icon":"⚙️"}
  ]'>
  <span slot="header">My App</span>
</td-sidebar>
```

**Items via JavaScript API (supports full SVG icons and API-fetched data):**

```js
const sidebar = document.querySelector('td-sidebar');

sidebar.items = [
  { key: 'sec-components', label: 'Components', section: true },
  { key: 'dashboard', label: 'Dashboard', icon: '<svg ...>' },
  { key: 'reports',   label: 'Reports',   icon: '<svg ...>', badge: '3' },
  { key: 'sec-inputs', label: 'Inputs', section: true },
  { key: 'button',    label: 'Button',   icon: '<svg ...>' },
  { key: 'text-input', label: 'Text Input', icon: '<svg ...>' },
  { key: 's1',        label: 'Admin',     section: true },
  { key: 'settings',  label: 'Settings',  icon: '<svg ...>' },
];

sidebar.activeKey = 'dashboard';
```

**Listening to events:**

```js
sidebar.addEventListener('nav-item-click', (e) => {
  console.log('Clicked:', e.detail.key, e.detail.item);
  sidebar.activeKey = e.detail.key;
});

sidebar.addEventListener('sidebar-toggle', (e) => {
  console.log('Collapsed:', e.detail.collapsed);
});
```

**Mobile drawer:**

On viewports ≤ 767 px the sidebar becomes a fixed full-height drawer. Wire up a hamburger button anywhere in your layout, or use the pre-built `mobileToggleBtn` element exposed by the component:

```js
const sidebar = document.querySelector('td-sidebar');

// Option A - use your own button
document.getElementById('menu-btn').addEventListener('click', () => sidebar.toggle());

// Option B - use the ready-made button
document.getElementById('topbar').appendChild(sidebar.mobileToggleBtn);
```

**Slots:**

| Slot | Description |
|------|-------------|
| `header` | Content rendered in the header row beside the toggle button |
| `body` | Arbitrary markup / components rendered below the nav item list |
| `footer` | Content pinned to the bottom of the sidebar |
| *(default)* | Static HTML nav items when the `items` attribute / JS setter is not used. Place `<button class="nav-item">` and `<div class="nav-section">` elements here (see HTML markup example above) |

**HTML markup element reference:**

| Element | Required attributes | Optional | Description |
|---------|---------------------|----------|-------------|
| `<button class="nav-item" type="button">` | `data-key` | `data-tooltip`, `aria-current` | Clickable nav item. Add `active` class for the initial active state |
| `<a class="nav-item">` | `data-key`, `href` | `data-tooltip` | Link-style nav item |
| `<div class="nav-section" role="listitem">` |  -  |  -  | Non-interactive section divider |
| `<span class="nav-label">` |  -  |  -  | Item label text (hidden when collapsed) |
| `<span class="nav-icon">` |  -  |  -  | Item icon (SVG, emoji, or any inline markup) |
| `<span class="nav-badge">` |  -  |  -  | Pill badge (hidden when collapsed) |
| `<span class="nav-section-label">` |  -  |  -  | Section heading text (hidden when collapsed) |

**Attributes:**

| Attribute | Type | Description |
|-----------|------|-------------|
| `items` | JSON string | Array of `SidebarItem` objects (see below) |
| `active` | `string` | Key of the initially active item |
| `collapsed` | boolean | Start in collapsed state |
| `search` | boolean | Show the live-filter search input |
| `search-placeholder` | `string` | Placeholder for the search input (default `"Search…"`) |
| `label` | `string` | `aria-label` for the `<nav>` element (default `"Navigation"`) |
| `no-toggle` | boolean | Hide the collapse / expand arrow button |

**`SidebarItem` interface:**

| Field | Type | Description |
|-------|------|-------------|
| `key` | `string` | **Required.** Unique identifier |
| `label` | `string` | **Required.** Display text; also used as the collapsed tooltip |
| `icon` | `string` | HTML string  -  SVG, emoji, or any inline markup. Falls back to the first letter of `label` |
| `href` | `string` | If set, renders an `<a>` tag; otherwise renders a `<button>` that fires `nav-item-click` |
| `badge` | `string` | Optional pill badge (e.g. a count). Hidden when collapsed |
| `section` | `boolean` | `true`  -  renders a non-interactive section divider / label |
| `data` | `unknown` | Arbitrary payload passed through in the `nav-item-click` event detail |

**JavaScript API:**

| Member | Description |
|--------|-------------|
| `items` | Get / set the full `SidebarItem[]` array. Setting re-renders the nav |
| `activeKey` | Get / set the active item key. Setting updates styles without full re-render |
| `collapsed` | Get / set collapsed state |
| `open()` | Open the mobile drawer |
| `close()` | Close the mobile drawer |
| `toggle()` | Toggle the mobile drawer |
| `mobileToggleBtn` | A pre-built `<button>` element you can place anywhere in your layout |

**Events:**

| Event | Detail | Description |
|-------|--------|-------------|
| `sidebar-toggle` | `{ collapsed: boolean }` | Fired when the collapse arrow is clicked |
| `nav-item-click` | `{ key: string, item: SidebarItem }` | Fired when a button-type nav item is clicked |
| `sidebar-mobile-toggle` | `{ open: boolean }` | Fired when the mobile drawer opens or closes |

**Keyboard navigation:**

| Key | Behaviour |
|-----|-----------|
| `ArrowDown` | Move focus to next nav item |
| `ArrowUp` | Move focus to previous nav item |
| `Home` | Move focus to first nav item |
| `End` | Move focus to last nav item |

**CSS custom properties:**

| Variable | Default | Description |
|----------|---------|-------------|
| `--td-sidebar-width` | `260px` | Expanded sidebar width |
| `--td-sidebar-collapsed-width` | `56px` | Collapsed sidebar width |

---

## API data modules

Example data fetchers live in `src/api/`. Each module imports `http` from `src/core/http` and returns typed, pre-processed data ready to pass directly to a chart or table component.

| Module                       | Function              | Returns                                        |
|------------------------------|-----------------------|------------------------------------------------|
| `example-bar-chart-data.ts`  | `getBarChartData()`   | `{ label, value }[]`: avg price per category  |
| `example-pie-chart-data.ts`  | `getPieChartData()`   | `{ label, value }[]`: total stock per category |
| `example-line-chart-data.ts` | `getLineChartData()`  | `{ labels, data }`: avg price & stock, 2-series |
| `example-donut-chart-data.ts`| `getDonutChartData()` | `{ label, value }[]`: total stock per category |
| `example-users-list.ts`      | `getUsers()`          | `unknown`: raw JSONPlaceholder user array     |

All functions fetch from [dummyjson.com](https://dummyjson.com) (charts) or [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) (users). Replace or extend these to point at your own API.

---

## Router

Routes are registered in [src/pages/app-routes.ts](src/pages/app-routes.ts), and bootstrapped from [src/main.ts](src/main.ts) via `initializeAppRoutes(contentEl)`.

```ts
import { router } from "../core/router";
const loadMyPageHtml = () => import("./my-page.html?raw").then((module) => module.default);

router.register("/my-page", async () => loadMyPageHtml(), {
  title: "My Page",
  description: "Page description for SEO"
});

// Dynamic route params
router.register("/users/:id", async (params) => {
  return navHtml + `<h1>User ${params.id}</h1>`;
});

router.start();
```

| Method                                    | Description                                   |
|-------------------------------------------|-----------------------------------------------|
| `register(path, render, options?)`        | Register a route                              |
| `navigate(path)`                          | Navigate programmatically                     |
| `start()`                                 | Begin listening for route changes             |
| `stop()`                                  | Stop listening                                |
| `addListener(fn)` / `removeListener(fn)` | Subscribe to route changes                    |
| `subscribe(fn)`                           | Subscribe and returns an unsubscribe function |
| `resolve(pathname?)`                      | Resolves rendered HTML for the current route  |

---

## HTTP helper

```ts
import { http } from "../core/http";

const data = await http("/api/example");

// With type safety
const users = await http<User[]>("/api/users");

// With request options
const result = await http("/api/data", {
  method: "POST",
  headers: { Authorization: "Bearer token" },
  body: { name: "John" }
});
```

- Auto-sets `Content-Type: application/json` for JSON bodies
- Parses JSON responses automatically
- Throws on non-2xx responses

---

## Theming

```ts
import { initializeTheme, toggleTheme, setTheme, getTheme } from "../theme/theme";

initializeTheme(); // Call on app start: reads localStorage or system preference
toggleTheme();     // Toggle light/dark and persist
setTheme("dark");  // Set explicitly
getTheme();        // Returns "light" or "dark"
```

The selected theme is persisted under `turbodogtd-theme` in `localStorage` and applied as a `data-theme` attribute on `<html>`.

---

## Environment variables

Vite loads `.env.development` during `npm run dev` and `.env.production` during `npm run build`. Both files are gitignored: copy the `.example` templates to get started.

```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
```

All variables exposed to the client must be prefixed with `VITE_`:

**.env.development**
```
VITE_APP_NAME=Turbodog UI
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development
```

**.env.production**
```
VITE_APP_NAME=Turbodog UI
VITE_API_URL=https://api.example.com
VITE_APP_ENV=production
```

**Usage in TypeScript:**
```ts
const appName = import.meta.env.VITE_APP_NAME;
const apiUrl  = import.meta.env.VITE_API_URL;
const env     = import.meta.env.VITE_APP_ENV;
```

Types are declared in `src/env.d.ts`. Add a new entry there whenever you add a new variable:

```ts
interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;
  readonly VITE_APP_ENV: "development" | "production";
}
```

---

## Grid system

Mobile-first 12-column layout with breakpoints:

| Breakpoint | Min width |
|------------|-----------|
| `sm`       | 576px     |
| `md`       | 768px     |
| `lg`       | 992px     |
| `xl`       | 1200px    |

```html
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6 col-lg-4">A</div>
    <div class="col-12 col-md-6 col-lg-4">B</div>
    <div class="col-12 col-lg-4">C</div>
  </div>
</div>
```

**Row modifiers:** `.row--center`, `.row--between`, `.row--dense`

**Column classes:** `.col`, `.col-auto`, `.col-1` through `.col-12` at each breakpoint (`sm`, `md`, `lg`, `xl`).

---

### `<td-pagination>`

A centered pagination control driven by a total item count and a page size. Prev / Next arrows are always visible (faded when at boundaries) and live inside the scrollable page strip directly beside page 1 and the last page. When there are more pages than fit in the available width, scroll arrows appear at the edges.

```html
<td-pagination
  total="350"
  page-size="25"
  page="1">
</td-pagination>
```

| Attribute   | Property   | Default | Description |
|-------------|------------|---------|-------------|
| `total`     | `total`    | `0`     | Total number of items. Component is hidden when 0. |
| `page-size` | `pageSize` | `10`    | Number of rows per page. |
| `page`      | `page`     | `1`     | Current page (1-based). |

**Event: `td-page-change`**

Fired on every navigation. Bubbles and is composed (crosses shadow DOM boundaries).

```ts
pager.addEventListener('td-page-change', (e: Event) => {
  const { page, pageSize, offset, limit } = (e as CustomEvent).detail;
  // offset = (page - 1) * pageSize   -  ready to drop into an API query
  fetch(`/api/items?offset=${offset}&limit=${limit}`)
    .then(r => r.json())
    .then(data => renderTable(data));
});
```

**`detail` shape:**

| Key        | Type   | Description |
|------------|--------|-------------|
| `page`     | number | Current page (1-based) |
| `pageSize` | number | Rows per page |
| `offset`   | number | `(page - 1) * pageSize` |
| `limit`    | number | Same as `pageSize` |

**Setting properties from JavaScript:**

```ts
const pager = document.querySelector('td-pagination');

// After receiving total from API
pager.total = 350;

// Change page size programmatically
pager.pageSize = 25;

// Jump to a specific page
pager.page = 5;
```

**Full integration example (client-side slicing):**

```ts
const pager    = document.querySelector('#my-pager');
const myTable  = document.querySelector('#my-table');
let allRows    = [];

// Fetch all data once
fetch('/api/items?limit=100')
  .then(r => r.json())
  .then(data => {
    allRows       = data.items;
    pager.total   = allRows.length;
    pager.page    = 1;
    renderPage();
  });

function renderPage() {
  const { page, pageSize } = pager;
  myTable.data = allRows.slice((page - 1) * pageSize, page * pageSize);
}

pager.addEventListener('td-page-change', renderPage);
```

---

### `<td-progress-bar>`

A progress indicator supporting determinate values, indeterminate animation, semantic color variants, striped patterns, and full ARIA attributes.

```html
<!-- Determinate with label and percentage display -->
<td-progress-bar value="60" label="Uploading" show-value></td-progress-bar>

<!-- Semantic variants -->
<td-progress-bar value="80" variant="success" label="Complete" show-value></td-progress-bar>
<td-progress-bar value="40" variant="warning" label="Low storage" show-value></td-progress-bar>
<td-progress-bar value="25" variant="danger" label="Critical" show-value></td-progress-bar>

<!-- Striped and animated -->
<td-progress-bar value="55" striped animated></td-progress-bar>

<!-- Indeterminate (unknown duration) -->
<td-progress-bar indeterminate label="Loading..."></td-progress-bar>

<!-- Custom height and color -->
<td-progress-bar value="70" height="1rem" color="#8b5cf6"></td-progress-bar>
```

| Attribute      | Type    | Default | Description |
|----------------|---------|---------|-------------|
| `value`        | number  | `0`     | Current progress value |
| `max`          | number  | `100`   | Maximum value |
| `label`        | string  |         | Text label displayed above the bar |
| `show-value`   | boolean |         | Shows the computed percentage next to the label |
| `variant`      | string  |         | `success` \| `warning` \| `danger` |
| `striped`      | boolean |         | Applies a diagonal stripe overlay |
| `animated`     | boolean |         | Animates the stripes (use with `striped`) |
| `indeterminate`| boolean |         | Pulsing bar for unknown progress duration |
| `height`       | string  |         | CSS length for bar height, e.g. `4px`, `1rem` |
| `color`        | string  |         | Custom CSS color for the bar fill |

**JavaScript API:**

```js
const bar = document.querySelector('td-progress-bar');

// Set/get value
bar.value = 75;
console.log(bar.percentage); // 75

// Set/get max
bar.max = 200;
bar.value = 150; // 75%
```

**CSS Custom Properties:**

| Property            | Description |
|---------------------|-------------|
| `--progress-height` | Bar track height (overridden by `height` attribute) |
| `--progress-color`  | Bar fill color (overridden by `color` attribute) |

---

### `<td-color-picker>`

A fully custom color picker with a 2D saturation/brightness gradient, hue and optional opacity sliders, hex/RGB/HSL text inputs, and optional preset swatches. All interaction is handled with pointer events and includes full keyboard navigation.

```html
<!-- Basic -->
<td-color-picker label="Brand color" value="#3b82f6"></td-color-picker>

<!-- With alpha channel -->
<td-color-picker label="Overlay" value="#000000" alpha></td-color-picker>

<!-- RGB output format -->
<td-color-picker label="Fill" value="#22c55e" format="rgb"></td-color-picker>

<!-- Preset swatches -->
<td-color-picker
  label="Theme color"
  value="#6366f1"
  presets='["#ef4444","#22c55e","#3b82f6","#6366f1","#000000"]'>
</td-color-picker>
```

| Attribute  | Type    | Default | Description |
|------------|---------|---------|-------------|
| `value`    | string  | `#3b82f6` | Initial color — hex (`#rrggbb`), 8-digit hex with alpha, or `rgb()`/`rgba()` |
| `label`    | string  |         | Field label displayed above the trigger |
| `format`   | string  | `hex`   | Output format: `hex` \| `rgb` \| `hsl` |
| `alpha`    | boolean |         | Enables the opacity slider and alpha channel in the emitted value |
| `disabled` | boolean |         | Prevents opening the picker |
| `size`     | string  | `medium` | `small` \| `medium` \| `large` \| `extra-large` |
| `presets`  | string  |         | JSON array of hex strings rendered as clickable swatches |

**`change` event detail:**

| Key     | Type               | Description |
|---------|--------------------|-------------|
| `value` | string             | Formatted per the `format` attribute |
| `hex`   | string             | Always `#rrggbb` regardless of format |
| `rgb`   | `[number, number, number]` | `[r, g, b]` each 0–255 |
| `alpha` | number             | 0–1 |

**JavaScript API:**

```js
const cp = document.querySelector('td-color-picker');

// Set value programmatically
cp.value = '#ff6600';

// Listen for changes
cp.addEventListener('change', (e) => {
  const { value, hex, rgb, alpha } = e.detail;
  console.log(value);  // formatted per `format` attr
  console.log(hex);    // always #rrggbb
  console.log(rgb);    // [r, g, b]
  console.log(alpha);  // 0–1
});
```

**Keyboard navigation:**

- **Gradient area** — Arrow keys adjust saturation (←/→) and brightness (↑/↓); hold Shift for 10× steps
- **Hue / Alpha sliders** — Arrow keys adjust value; hold Shift for 10× steps
- **Escape** — Closes the panel and returns focus to the trigger

---

### `<td-mosaic>` + `<td-mosaic-item>`

An Instagram-style CSS Grid mosaic layout. Cells are automatically kept square by a ResizeObserver (one row height = one column width). Use `col-span` and `row-span` to create featured tiles. Hovering a cell reveals a subtle image scale and dark overlay.

```html
<td-mosaic columns="3" gap="4px">

  <!-- Featured tile: 2 columns × 2 rows -->
  <td-mosaic-item col-span="2" row-span="2">
    <img src="photo.jpg" alt="Featured">
    <span slot="overlay">Caption shown on hover</span>
  </td-mosaic-item>

  <!-- Regular cells -->
  <td-mosaic-item>
    <img src="photo2.jpg" alt="">
  </td-mosaic-item>

  <td-mosaic-item>
    <img src="photo3.jpg" alt="">
  </td-mosaic-item>

</td-mosaic>
```

**`<td-mosaic>` attributes:**

| Attribute    | Default    | Description |
|--------------|------------|-------------|
| `columns`    | `3`        | Number of equal-width columns |
| `gap`        | `4px`      | CSS gap between cells |
| `row-height` | auto (square) | Override row height. Omit for auto-square cells driven by column width. |

**`<td-mosaic-item>` attributes:**

| Attribute    | Default | Description |
|--------------|---------|-------------|
| `col-span`   | `1`     | Number of columns to span |
| `row-span`   | `1`     | Number of rows to span |
| `slot="overlay"` |  -  | Content displayed in the hover overlay (bottom-left, white text) |

**Fixed row height** (e.g. for card/dashboard layouts):

```html
<td-mosaic columns="3" gap="12px" row-height="160px">
  <td-mosaic-item col-span="2">
    <div style="width:100%;height:100%;background:var(--td-primary);color:#fff;
                display:flex;align-items:center;padding:20px;box-sizing:border-box;
                border-radius:var(--td-radius);">
      <div>
        <div style="font-size:1.25rem;font-weight:700;">Welcome back</div>
        <div style="font-size:0.875rem;opacity:0.85;">Your dashboard is ready</div>
      </div>
    </div>
  </td-mosaic-item>
  <td-mosaic-item>
    <div style="width:100%;height:100%;display:flex;flex-direction:column;
                align-items:center;justify-content:center;
                background:var(--td-surface-2);border-radius:var(--td-radius);">
      <div style="font-size:2rem;font-weight:700;color:var(--td-primary);">98%</div>
      <div style="font-size:0.8125rem;color:var(--td-fg-muted);">Uptime</div>
    </div>
  </td-mosaic-item>
</td-mosaic>
```

---

### `<td-video-player>`

A custom video player supporting direct video files, Vimeo embeds, and YouTube embeds. Includes a drag-and-drop zone for local files when no `src` is provided.

```html
<!-- Local file drop zone (no src) -->
<td-video-player></td-video-player>

<!-- Direct video file -->
<td-video-player
  src="/videos/my-video.mp4"
  title="My Video"
  poster="/thumbnails/my-video.jpg"
></td-video-player>

<!-- Vimeo embed -->
<td-video-player
  src="https://vimeo.com/2081767"
  title="Vimeo Video"
></td-video-player>

<!-- YouTube embed -->
<td-video-player
  src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  title="YouTube Video"
></td-video-player>

<!-- Autoplay muted loop -->
<td-video-player
  src="/clips/intro.mp4"
  autoplay
  muted
  loop
></td-video-player>
```

| Attribute  | Type    | Default | Description |
|------------|---------|---------|-------------|
| `src`      | string  |         | URL of the video. Vimeo and YouTube URLs are automatically converted to embeds. |
| `title`    | string  |         | Overlay title shown at the top of the video |
| `poster`   | string  |         | Thumbnail image shown before playback starts (direct video only) |
| `autoplay` | boolean |         | Start playing automatically  -  use with `muted` to satisfy browser autoplay policies |
| `muted`    | boolean |         | Start with audio muted |
| `loop`     | boolean |         | Loop playback continuously |

**Supported embed domains:** `vimeo.com`, `player.vimeo.com`, `youtube.com`, `youtu.be`

**Controls (direct video):**

| Control | Keyboard |
|---------|----------|
| Play / Pause | Click video · `Space` · `K` |
| Rewind 10s | `←` |
| Forward 10s | `→` |
| Mute / Unmute | `M` |
| Fullscreen | `F` |

**Share button:** For direct video sources, copies a timestamped URL (`?t=<seconds>`) to the clipboard or invokes the Web Share API. For embeds, copies the original page URL. Append `?t=<seconds>` to any page URL to deep-link to a specific time.

**JavaScript API:**

```js
const player = document.querySelector('td-video-player');

player.play();
player.pause();
player.seek(120);          // seek to 2:00

player.currentTime;        // current playback position (seconds)
player.duration;           // total duration (seconds)
player.paused;             // true / false
```

---

### `<td-breadcrumb>`

An accessible page-trail navigation component that renders a `<nav><ul>` structure. Supports three usage modes: declarative `<li>` children, a JSON `items` attribute, and dynamic population via a `src` URL or the JavaScript `items` setter. Separators are injected automatically between items in all three modes.

**HTML mode  -  declarative `<li>` children:**

Place `<li>` elements inside `<td-breadcrumb>`. The component clones them into a shadow `<ul>` and injects separator items automatically. Mark the active crumb with `aria-current="page"`.

```html
<td-breadcrumb separator="›">
  <li><a href="/">Home</a></li>
  <li><a href="/components">Components</a></li>
  <li aria-current="page">Breadcrumb</li>
</td-breadcrumb>
```

**JSON attribute mode:**

```html
<td-breadcrumb
  separator="›"
  items='[
    {"label":"Home","href":"/"},
    {"label":"Products","href":"/products"},
    {"label":"Laptops","href":"/products/laptops"},
    {"label":"Laptop Pro 15"}
  ]'>
</td-breadcrumb>
```

**Dynamic / API mode:**

```js
// src attribute  -  fetches automatically on connect
const bc = document.querySelector('td-breadcrumb');
bc.setAttribute('src', '/api/breadcrumbs');

// JS property setter
bc.items = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Settings' }
];

// Intercept clicks on non-href items
bc.addEventListener('breadcrumb-click', e => {
  const { index, label, href } = e.detail;
  router.navigate(href);
});
```

| Attribute   | Type   | Default | Description |
|-------------|--------|---------|-------------|
| `items`     | string |         | JSON array of `{ label: string, href?: string }` objects |
| `src`       | string |         | URL to fetch the items array from |
| `separator` | string | `/`     | Divider character injected between crumbs in all three modes |

**JS property:** `items` (get/set `BreadcrumbItem[]`)  -  triggers a re-render immediately.

**Events:** `breadcrumb-click`  -  fires when a non-current crumb without an `href` is clicked; `detail: { index: number, label: string, href: string | undefined }`.

**Accessibility:** Wrapped in `<nav aria-label="Breadcrumb">`. All modes render a semantic `<ul>` with `<li>` items; the last item carries `aria-current="page"`.
