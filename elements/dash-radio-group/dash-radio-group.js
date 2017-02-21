/**
 * A `RadioGroup` is a set of checkable buttons, where only one button may be
 * checked at a time. The `RadioGroup` element wraps a set of `RadioButton`
 * children and manages their checked states in response to user keyboard
 * actions such as pressing arrow keys to select the next radio button, or if
 * the user clicks with a mouse.
 *
 * The `RadioGroup` uses a technique called [roving tabindex](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_Roving_tabindex)
 * to manage which `RadioButton` child is currently focusable. In a nutshell,
 * the currently focusable child will have a `tabindex=0`, and all other
 * children will have a `tabindex=-1`. This ensures that the `RadioGroup` itself
 * is only a single tab stop, and focus always lands on whichever child is
 * currently checked. In the case where no child is checked, focus will land
 * on the first `RadioButton` child in the `RadioGroup`.
 *
 * The `RadioGroup` uses `aria-checked=true` to indicate the checked state of
 * its `RadioButton` children. Only one child may be set to `aria-checked=true`.
 * Note that unlike most boolean attributes in HTML, boolean ARIA attributes
 * take a literal string value of either `"true"` or `"false"`.
 */

(function() {
  /**
   * Define keycodes to help with handling keyboard events.
   */
  const KEYCODE = {
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
    UP: 38,
  };

  /**
   * `RadioButton` is a simple, checkable button.
   */
  class RadioButton extends HTMLElement {
    constructor() {
      super();
    }

    /**
     * The `RadioButton` sets its initial ARIA attributes when it's attached to
     * the DOM. The surrounding RadioGroup handles dynamic changes to the ARIA
     * attributes. The RadioButton should always set a `role` of `radio`, and
     * should check to see if its `tabindex` and `aria-checked` values have been
     * set by the user. Otherwise, it can set these attributes to default
     * values. Here, the tabindex and aria-checked values are set to defaults
     * just to indcate that they will likely change in the future.
     */
    connectedCallback() {
      this.setAttribute('role', 'radio');
      this.setAttribute('tabindex', this.getAttribute('tabindex') || -1);
      this.setAttribute('aria-checked',
        this.getAttribute('aria-checked') || false);
    }
  }

  /**
   * Define a custom element, `<dash-radio-button>`, and associate it with the
   * `RadioButton` class.
   */
  window.customElements.define('dash-radio-button', RadioButton);

  /**
   * `RadioGroup` is responsible for handling user input, and updating the state
   * of its `RadioButton` children. It uses the [roving tabindex](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_Roving_tabindex)
   * technique to respond to keyboard events. This ensures that the entire
   * `RadioGroup` is a single tabstop, and tabbing into the `RadioGroup` will
   * always focus the previously checked item, if one exists.
   */
  class RadioGroup extends HTMLElement {
    constructor() {
      super();
    }

    /**
     * The `RadioGroup` sets its ARIA role to `radiogroup` and sets the
     * `tabindex` on its first `RadioButton` child to 0 if no other child is
     * already checked. This makes the first `RadioButton` focusable. If a
     * child is already checked, the `RadioGroup` calls `_setChecked` to
     * uncheck any other `RadioButton` children and ensure that only this first
     * child is checked. The `RadioGroup` also adds listeners for keyboard and
     * mouse events.
     * Note that any code manipulating `RadioButton` children assumes they are
     * already in the DOM and their definitions have been loaded. For a more
     * robust implementation you might consider using a Mutation Observer to
     * detect if children are present yet.
     */
    connectedCallback() {
      this.setAttribute('role', 'radiogroup');
      let firstCheckedButton = this.checkedRadioButton;
      if (firstCheckedButton) {
        this._uncheckAll();
        this._checkNode(firstCheckedButton);
      } else {
        this.querySelector('[role="radio"]').setAttribute('tabindex', 0);
      }
      this.addEventListener('keydown', this._onKeyDown);
      this.addEventListener('click', this._onClick);
    }

    /**
     * If the `RadioGroup` is removed from the DOM, clean up any event
     * listeners.
     */
    disconnectedCallback() {
      this.removeEventListener('keydown', this._onKeyDown);
      this.removeEventListener('click', this._onClick);
    }

    /**
     * If the user pressed an arrow key, call preventDefault to prevent the
     * page from scrolling. If the up or left arrow keys were pressed, select
     * the previous `RadioButton`. If the down or right keys were pressed,
     * select the next `RadioButton`.
     */
    _onKeyDown(e) {
      switch (e.keyCode) {
        case KEYCODE.UP:
        case KEYCODE.LEFT:
          e.preventDefault();
          this._setCheckedToPrevButton();
          break;

        case KEYCODE.DOWN:
        case KEYCODE.RIGHT:
          e.preventDefault();
          this._setCheckedToNextButton();
          break;

        default:
          break;
      }
    }

    /**
     * A getter for whichever `RadioButton` is currently checked.
     */
    get checkedRadioButton() {
      return this.querySelector('[aria-checked="true"]');
    }

    /**
     * A getter for the first `RadioButton` child.
     */
    get firstRadioButton() {
      return this.querySelector('[role="radio"]:first-of-type');
    }

    /**
     * A getter for the last `RadioButton` child.
     */
    get lastRadioButton() {
      return this.querySelector('[role="radio"]:last-of-type');
    }

    /**
     * A helper for when the user tries to moves backwards through the
     * `RadioGroup` using their keyboard. Return the `RadioButton` coming before
     * the one passed as an argument. If no previous `RadioButton` is found,
     * return null.
     */
    _prevRadioButton(node) {
      let prev = node.previousElementSibling;
      while (prev) {
        if (prev.getAttribute('role') === 'radio') {
          return prev;
        }
        prev = prev.previousElementSibling;
      }
      return null;
    }

    /**
     * A helper for when the user tries to moves forwards through the
     * `RadioGroup` using their keyboard. Return the `RadioButton` coming after
     * the one passed as an argument. If no next `RadioButton` is found, return
     * null.
     */
    _nextRadioButton(node) {
      let next = node.nextElementSibling;
      while (next) {
        if (next.getAttribute('role') === 'radio') {
          return next;
        }
        next = next.nextElementSibling;
      }
      return null;
    }

    /**
     * This method is called in response to a user pressing a key to move
     * backwards through the `RadioGroup`.
     * Check to see if the currently checked `RadioButton` is the first child.
     * If so, loop around and focus the last child. Otherwise, find the previous
     * sibling of the currently checked `RadioButton`, and make it the new
     * checked button.
     */
    _setCheckedToPrevButton() {
      let checkedButton = this.checkedRadioButton || this.firstRadioButton;
      if (checkedButton === this.firstRadioButton) {
        this._setChecked(this.lastRadioButton);
      } else {
        this._setChecked(this._prevRadioButton(checkedButton));
      }
    }

    /**
     * This method is called in response to a user pressing a key to move
     * forwards through the `RadioGroup`.
     * Check to see if the currently checked `RadioButton` is the last child.
     * If so, loop around and focus the first child. Otherwise, find the next
     * sibling of the currently checked `RadioButton`, and make it the new
     * checked button.
     */
    _setCheckedToNextButton() {
      let checkedButton = this.checkedRadioButton || this.firstRadioButton;
      if (checkedButton === this.lastRadioButton) {
        this._setChecked(this.firstRadioButton);
      } else {
        this._setChecked(this._nextRadioButton(checkedButton));
      }
    }

    /**
     * Any user action (a keypress or mouse click) eventually funnels down to
     * this method which ensures that only the passed in element is checked.
     * Uncheck _all_ `RadioButton` children. Then set the `RadioButton` that was
     * passed in to `aria-checked=true`. Also make it focusable with
     * `tabIndex=0` and call its `focus()` method.
     */
    _setChecked(node) {
      this._uncheckAll();
      this._checkNode(node);
      this._focusNode(node);
    }

    /**
     * Only one `RadioButton` should be checked at any time. To ensure this,
     * loop through all `RadioButton` children and set them to
     * `aria-checked=false` and `tabindex=-1`.
     */
    _uncheckAll() {
      const radioButtons = this.querySelectorAll('[role="radio"]');
      for (let i = 0; i < radioButtons.length; i++) {
        let btn = radioButtons[i];
        btn.setAttribute('aria-checked', 'false');
        btn.tabIndex = -1;
      }
    }

    /**
     * Mark the passed in node as being checked by setting `aria-checked=true`,
     * and make it focusable by setting `tabindex=0`.
     */
    _checkNode(node) {
      node.setAttribute('aria-checked', 'true');
      node.tabIndex = 0;
    }

    /**
     * Call `focus()` on the passed in node to direct keyboard focus to it.
     */
    _focusNode(node) {
      node.focus();
    };

    /**
     * If the user clicks inside of the `RadioGroup`, verify that the clicked
     * element has a `role` of `radio`, and if so, make it the new checked
     * button.
     */
    _onClick(e) {
      if (e.target.getAttribute('role') === 'radio') {
        this._setChecked(e.target);
      }
    }
  }

  /**
   * Define a custom element, `<dash-radio-group>`, and associate it with the
   * `RadioGroup` class.
   */
  window.customElements.define('dash-radio-group', RadioGroup);
})();
