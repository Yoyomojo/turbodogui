# Turbodog UI

<p align="center">
  <img src="public/turbodog-ui-logo.png" alt="Turbodog UI Logo" width="300" />
</p>

<p align="center">
  <a href="https://turbodogui.com" target="_blank" rel="noopener noreferrer">View it in action https://turbodogui.com</a>
</p>

A lightweight TypeScript UI library built with Web Components, a tiny router, CSS variable theming, a shared Fetch helper, and a responsive grid system.

## Features

- Native Web Components with TypeScript and Shadow DOM
- Lightweight pathname-based router with dynamic route params
- Light and dark theme with CSS variable design tokens and localStorage persistence
- Shared Fetch API wrapper with JSON auto-parsing and error handling
- Responsive 12-column grid with `sm`, `md`, `lg`, `xl` breakpoints
- Data table with sorting, search, CSV export, sticky header, and scrollable body
- Chart components: pie, donut, bar (grouped, horizontal, reference lines, line overlay), line
- Carousel with animated slide transitions, autoplay, touch swipe, and keyboard navigation
- Minimal external dependencies

## Getting started

```bash
npm install
npm run dev
```

## Components

### `<ui-card>`

A styled surface for grouping content.

```html
<ui-card>
  <h2>Title</h2>
  <p>Content goes here.</p>
</ui-card>

<!-- Force equal height with sibling cards in the same row -->
<ui-card stretch>
  <h2>Title</h2>
  <p>Content goes here.</p>
</ui-card>
```

| Attribute | Type    | Default | Description |
|-----------|---------|---------|-------------|
| `stretch` | boolean |   | Makes the card fill the full height of its grid column: use on all cards in a row for equal heights |

---

### `<ui-button>`

A styled button supporting size variants, variants, and states.

```html
<ui-button type="button" variant="success" size="large">Click Me</ui-button>
<ui-button type="submit" disabled>Submit</ui-button>
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

### `<ui-text-input>`

A styled input field with label, size variants, validation states, and accessibility support.

```html
<ui-text-input
  type="email"
  label="Email Address"
  placeholder="name@example.com"
  size="large"
  required
  error
></ui-text-input>
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

### `<ui-select>`

A styled select dropdown supporting option groups, multiple selection, and accessibility.

```html
<ui-select label="Favorite Fruit" name="fruit" value="orange">
  <option value="apple">Apple</option>
  <option value="orange">Orange</option>
  <optgroup label="Berries">
    <option value="strawberry">Strawberry</option>
  </optgroup>
</ui-select>
```

| Attribute  | Type    | Default |
|------------|---------|---------|
| `label`    | string  |   |
| `name`     | string  |   |
| `value`    | string  |   |
| `required` | boolean |   |
| `disabled` | boolean |   |
| `multiple` | boolean |   |

**Events:** `change`: `detail: { value: string }`

**Methods:** `value` getter/setter

---

### `<ui-multi-select>`

A dropdown multi-select component. Clicking the trigger opens a checkbox list; selected items are shown as pill badges inside the trigger with an `×` to deselect individually. Supports live search, a Select/Deselect All row, and can be populated from an API via the JS `options` setter.

```html
<!-- Static with search and select-all -->
<ui-multi-select
  label="Favorite Fruits"
  search
  select-all
  options='[{"value":"apple","label":"Apple"},{"value":"banana","label":"Banana"}]'
  value='["banana"]'>
</ui-multi-select>
```

```js
// Dynamic (API-populated)
const ms = document.querySelector('ui-multi-select');
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
| `options`            | string  |               | JSON array of `{ value, label }` objects |
| `value`              | string  |               | JSON array of initially selected values |
| `search`             | boolean |               | Shows a live search input at the top of the dropdown |
| `search-placeholder` | string  | `"Search..."` | Placeholder text for the search input |
| `select-all`         | boolean |               | Adds a Select all / Deselect all row (three-state checkbox: empty / partial / full) |
| `placeholder`        | string  |               | Trigger placeholder when nothing is selected. Falls back to `label` if not set |

**Events:** `change`: `detail: { value: string[] }` - fires on every toggle with the full selected array

**JS properties:** `options` (get/set `MultiSelectOption[]`), `value` (get/set `string[]`)

**Keyboard:** `Enter`/`Space` toggle, `ArrowDown`/`ArrowUp` navigate, `Escape` closes the dropdown

---

### `<ui-tabs>`

A tabbed content container with keyboard navigation.

```html
<ui-tabs labels="Overview | Details | Settings" default-tab="0">
  <div slot="tab-0"><p>Overview content</p></div>
  <div slot="tab-1"><p>Details content</p></div>
  <div slot="tab-2"><p>Settings content</p></div>
</ui-tabs>
```

| Attribute     | Type   | Default |
|---------------|--------|---------|
| `labels`      | string |   |
| `default-tab` | number | `0`     |

Labels are pipe-separated: `"Tab 1 | Tab 2 | Tab 3"`.

**Events:** `tab-changed`: `detail: { activeIndex: number }`

**Slots:** `tab-0`, `tab-1`, `tab-2`, etc.

---

### `<ui-accordion>`

Expandable content sections with optional multi-open support and keyboard navigation.

```html
<ui-accordion
  items="3"
  item-0-title="Section One"
  item-1-title="Section Two"
  item-2-title="Section Three"
  allow-multiple
>
  <div slot="item-0"><p>First section content</p></div>
  <div slot="item-1"><p>Second section content</p></div>
  <div slot="item-2"><p>Third section content</p></div>
</ui-accordion>
```

| Attribute        | Type    | Default |
|------------------|---------|---------|
| `items`          | number  |   |
| `item-{n}-title` | string  |   |
| `allow-multiple` | boolean |   |

**Events:** `accordion-toggle`: `detail: { activeIndex: number, isActive: boolean }`

**Slots:** `item-0`, `item-1`, `item-2`, etc.

---

### `<ui-modal>`

A centered dialog overlay with focus trap and keyboard support.

```html
<ui-modal
  title="Confirm Action"
  close-on-overlay
  close-on-escape
  width="600px"
>
  <p>Are you sure you want to continue?</p>
  <ui-button type="button">Confirm</ui-button>
</ui-modal>
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

### `<ui-loader>`

A loading spinner overlay with optional message, size, color, and containment.

```html
<ui-loader
  message="Loading..."
  size="64px"
  color="#FF8C00"
  variant="dots"
  contained
></ui-loader>
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

### `<ui-carousel>`

A responsive slideshow component with animated transitions, dot indicators, prev/next arrows, touch swipe, keyboard navigation, and optional autoplay. Slides are placed via named slots and can contain any HTML or other components.

```html
<!-- Basic image carousel -->
<ui-carousel label="Nature Photography">
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
</ui-carousel>

<!-- Autoplay with loop -->
<ui-carousel label="Highlights" autoplay loop interval="4000">
  <div slot="slide-0"><p>Slide one</p></div>
  <div slot="slide-1"><p>Slide two</p></div>
  <div slot="slide-2"><p>Slide three</p></div>
</ui-carousel>
```

**Inside a `<ui-modal>`:**

```js
const modal = document.createElement("ui-modal");
modal.setAttribute("title", "Gallery");
modal.setAttribute("close-on-overlay", "");
modal.setAttribute("close-on-escape", "");

const carousel = document.createElement("ui-carousel");
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

### `<ui-theme-toggle>`

A button that toggles between light and dark themes.

```html
<ui-theme-toggle></ui-theme-toggle>
```

No attributes, methods, or events.

---

### `<ui-link>`

An internal navigation link that uses the router instead of a full page reload. Supports a `button` mode that renders the link styled identically to `<ui-button>`.

```html
<!-- Plain links -->
<ui-link href="/examples">Examples</ui-link>
<ui-link to="/about" label="About" title="Go to about page"></ui-link>
<ui-link href="https://github.com/Yoyomojo/turbodogui" new-window title="View on GitHub">GitHub</ui-link>

<!-- Button-styled links -->
<ui-link href="/examples" button>Examples</ui-link>
<ui-link href="/examples" button variant="success">Go</ui-link>
<ui-link href="/examples" button variant="warning">Warning</ui-link>
<ui-link href="/examples" button variant="alert">Alert</ui-link>
<ui-link href="/examples" button disabled>Disabled</ui-link>

<!-- Button-styled link sizes -->
<ui-link href="/" button size="small">Small</ui-link>
<ui-link href="/" button size="medium">Medium</ui-link>
<ui-link href="/" button size="large">Large</ui-link>
<ui-link href="/" button size="extra-large">Extra Large</ui-link>
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

### `<ui-table>`

A sortable, exportable data table. Accepts data via JSON attributes or JavaScript property setters.

**Static data (HTML attributes):**

```html
<ui-table
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
</ui-table>
```

**Sticky header with scrollable body:**

```html
<!-- Show 5 rows at a time; header stays pinned while scrolling -->
<ui-table sticky-header max-rows="5" zebra search
  columns='[{"key":"name","label":"Name","sortable":true},{"key":"role","label":"Role"}]'
  data='[...]'>
</ui-table>
```

**Dynamic data (JavaScript):**

```ts
const table = document.querySelector('ui-table') as UITable;

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
<ui-table
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
</ui-table>
```

**Via custom HTML template (manual markup):**

```html
<ui-table zebra>
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
</ui-table>
```

**Editable cells (JavaScript):**

```ts
table.columns = [
  {
    key: 'name',
    label: 'Name',
    render: (val) =>
      `<ui-text-input size="small" value="${val}" placeholder="Name"></ui-text-input>`,
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

---

### `<ui-pie-chart>`

A pie chart component for visualizing categorical data.

**Static data (HTML attribute):**

```html
<ui-pie-chart
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
></ui-pie-chart>
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

### `<ui-donut-chart>`

A donut (ring) chart: identical to `<ui-pie-chart>` but renders a hollow center with a configurable hole size and optional center label.

**Static data (HTML attribute):**

```html
<ui-donut-chart
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
></ui-donut-chart>
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

### `<ui-bar-chart>`

A vertical or horizontal bar chart with interactive legend, axis grid lines, and auto-scaling labels.

**Static data (HTML attribute):**

```html
<ui-bar-chart
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
></ui-bar-chart>
```

**Horizontal mode:**

```html
<ui-bar-chart
  horizontal
  title="Avg Price by Category"
  width="100%"
  legend-position="left"
  data='[{"label":"Accessories","value":45},{"label":"Laptops","value":125}]'
></ui-bar-chart>
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

---

### `<ui-line-chart>`

A multi-series line chart with interactive tooltips, toggleable legend, and auto-angling x-axis labels.

**Static data (HTML attribute):**

```html
<ui-line-chart
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
></ui-line-chart>
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

### `<ui-code>`

A styled code block with a copy-to-clipboard button. Inner code is supplied via a `<template>` child element so the browser never parses it, or as plain text content.

**Via `<template>` (recommended — preserves HTML markup exactly):**

```html
<ui-code language="html">
  <template>
    <ui-button variant="success">Click me</ui-button>
  </template>
</ui-code>
```

**Via plain text content:**

```html
<ui-code language="js">console.log('hello world');</ui-code>
```

**With a filename label:**

```html
<ui-code language="ts" filename="main.ts">
  <template>
    import { router } from "./core/router";
    router.start();
  </template>
</ui-code>
```

**Via JavaScript property setter:**

```js
const codeEl = document.querySelector('ui-code');
codeEl.code = 'const x = 42;';
```

| Attribute  | Type   | Default | Description |
|------------|--------|---------|-------------|
| `language` | string |         | Badge label shown in the header (e.g. `html`, `js`, `ts`, `css`) |
| `filename` | string |         | Filename shown in the header alongside the language badge |

**JS property:** `code` (get/set string) — setting this overrides the `<template>` / text-content extraction and triggers a re-render.

**Copy button:** Copies the raw (unescaped) code to the clipboard using the Clipboard API with an `execCommand` fallback. Shows a checkmark for 2 seconds after a successful copy.

**CSS custom properties:**

| Variable          | Default (light/dark) | Description |
|-------------------|----------------------|-------------|
| `--ui-code-bg`    | `#0d1117` / `#060d18` | Code block background |
| `--ui-code-fg`    | `#e6edf3`            | Code text colour |

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

Routes are registered in `src/main.ts`.

```ts
import { router } from "../core/router";

router.register("/my-page", () => navHtml + myPageHtml, {
  title: "My Page",
  description: "Page description for SEO"
});

// Dynamic route params
router.register("/users/:id", (params) => {
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
| `resolve(pathname?)`                      | Returns rendered HTML for the current route   |

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

The selected theme is persisted under `turbodogui-theme` in `localStorage` and applied as a `data-theme` attribute on `<html>`.

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
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=development
```

**.env.production**
```
VITE_API_URL=https://api.example.com
VITE_APP_ENV=production
```

**Usage in TypeScript:**
```ts
const apiUrl = import.meta.env.VITE_API_URL;
const env    = import.meta.env.VITE_APP_ENV;
```

Types are declared in `src/env.d.ts`. Add a new entry there whenever you add a new variable:

```ts
interface ImportMetaEnv {
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
