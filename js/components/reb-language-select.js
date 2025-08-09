class RebLanguageSelect extends HTMLElement {
  static get observedAttributes() {
    return ['label', 'options', 'name'];
  }

  // Centralized markup template (no Shadow DOM)
  static get template() {
    if (!this._template) {
      const tpl = document.createElement('template');
      tpl.innerHTML = `
        <div class="reb-lang-wrapper d-inline-flex align-items-center gap-2">
          <label class="form-label mb-0"></label>
          <select class="form-select form-select-sm"></select>
        </div>
      `;
      this._template = tpl;
    }
    return this._template;
  }

  constructor() {
    super();
    this._onChange = this._onChange.bind(this);
    // Do not render DOM in constructor. Just initialize fields.
    this._labelEl = null;
    this._selectEl = null;
    this._listenerAttached = false;
    this._cachedSelectId = null;

    this._storageKey = 'reb-language-select:value';
    try {
      const stored = localStorage.getItem(this._storageKey);
      this._selectedValue = stored ?? null;
    } catch (e) {
      // localStorage may be unavailable (privacy mode). Fail gracefully.
      this._selectedValue = null;
    }
  }

  connectedCallback() {
    this._render();
  }

  disconnectedCallback() {
    if (this._selectEl && this._listenerAttached) {
      this._selectEl.removeEventListener('change', this._onChange);
      this._listenerAttached = false;
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this._render();
  }

  _render() {
    // Create DOM if not present
    if (!this._labelEl || !this._selectEl) {
      if (!this.querySelector('select')) {
        const fragment = RebLanguageSelect.template.content.cloneNode(true);
        this.appendChild(fragment);
      }
      this._labelEl = this.querySelector('label');
      this._selectEl = this.querySelector('select');
    }

    if (!this._labelEl || !this._selectEl) return; // safety guard

    // Accessibility: connect label and select with id/for
    const baseId = this.getAttribute('id');
    if (baseId) {
      this._cachedSelectId = `${baseId}-select`;
    } else if (!this._cachedSelectId) {
      this._cachedSelectId = `reb-lang-sel-${Math.random().toString(36).slice(2, 9)}`;
    }
    this._selectEl.id = this._cachedSelectId;
    this._labelEl.setAttribute('for', this._cachedSelectId);

    // Reflect name
    const nameAttr = this.getAttribute('name');
    this._selectEl.name = nameAttr ?? '';

    // Render content
    this._renderLabel();
    this._renderOptions();

    // Attach listener once
    if (!this._listenerAttached) {
      this._selectEl.addEventListener('change', this._onChange);
      this._listenerAttached = true;
    }
  }

  _renderLabel() {
    this._labelEl.textContent = this.getAttribute('label') ?? '';
  }

  _parseOptionsAttr() {
    const raw = this.getAttribute('options');
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (Array.isArray(item)) {
            return { value: String(item[0]), label: String(item[1] ?? item[0]) };
          }
          if (item && typeof item === 'object') {
            const v = 'value' in item ? item.value : item.code ?? item.lang ?? '';
            const l = 'label' in item ? item.label : item.name ?? v;
            return { value: String(v), label: String(l) };
          }
          return { value: String(item), label: String(item) };
        });
      }
      console.error('reb-language-select: options attribute must be a JSON array');
      return [];
    } catch (e) {
      console.error('reb-language-select: options attribute must be valid JSON array', e);
      return [];
    }
  }

  _renderOptions() {
    const options = this._parseOptionsAttr();

    // Remember the current or persisted value before re-rendering options
    const preferredValue = this._selectEl?.value || this._selectedValue || '';

    this._selectEl.innerHTML = '';
    for (const opt of options) {
      const optionEl = document.createElement('option');
      optionEl.value = opt.value;
      optionEl.textContent = opt.label;
      this._selectEl.appendChild(optionEl);
    }

    // Try to restore previous or persisted selection
    if (preferredValue) {
      this._selectEl.value = preferredValue;
    }

    // Ensure _selectedValue tracks the actual selection
    this._selectedValue = this._selectEl.value || null;

    // If we restored a value successfully, no need to do more. If not found, the browser keeps first option.
  }

  _onChange() {
    // Update internal state and persist selection
    this._selectedValue = this._selectEl.value;
    try {
      localStorage.setItem(this._storageKey, this._selectedValue);
    } catch (e) {
      // ignore storage failures
    }

    const selectedOption = this._selectEl.options[this._selectEl.selectedIndex];
    const detail = {
      value: this._selectEl.value,
      label: selectedOption ? selectedOption.textContent : undefined,
    };
    // Note: event name follows the exact spelling requested: reb-langauge-select:change
    const ev = new CustomEvent('reb-langauge-select:change', {
      bubbles: true,
      composed: true,
      detail,
    });
    this.dispatchEvent(ev);
  }
}

customElements.define('reb-language-select', RebLanguageSelect);
