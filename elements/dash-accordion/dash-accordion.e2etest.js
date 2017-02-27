const helper = require('../../tools/selenium-helper.js');
const expect = require('chai').expect;
const {Key, By} = require('selenium-webdriver');

describe('dash-accordion', function() {
  let success;
  beforeEach(function() {
    return this.driver.get(`${this.address}/dash-accordion_demo.html`)
      .then(_ => helper.waitForElement(this.driver, 'dash-accordion'));
  });

  it('should handle arrow keys',
    async function() {
      await this.driver.executeScript(_ => {
        window.expectedFirstHeading =
          document.querySelector('[role=heading]:nth-of-type(1)');
        window.expectedSecondHeading =
          document.querySelector('[role=heading]:nth-of-type(2)');
      });

      success = await helper.pressKeyUntil(this.driver, Key.TAB,
        _ => document.activeElement === window.expectedFirstHeading
      );
      expect(success).to.equal(true);
      await this.driver.actions().sendKeys(Key.ARROW_RIGHT).perform();
      success = await this.driver.executeScript(
        _ => document.activeElement === window.expectedSecondHeading
      );
      expect(success).to.equal(true);
      await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
      success = await this.driver.executeScript(
        _ => document.activeElement === window.expectedFirstHeading
      );
      expect(success).to.equal(true);
    }
  );

  it('should focus the last tab on [end]',
    async function() {
      await this.driver.executeScript(_ => {
        window.expectedFirstHeading =
          document.querySelector('[role=heading]:nth-of-type(1)');
        window.expectedLastHeading =
          document.querySelector('[role=heading]:last-of-type');
      });

      success = await helper.pressKeyUntil(this.driver, Key.TAB,
        _ => document.activeElement === window.expectedFirstHeading
      );
      expect(success).to.equal(true);
      await this.driver.actions().sendKeys(Key.END).perform();
      success = await this.driver.executeScript(
        _ => document.activeElement === window.expectedLastHeading
      );
      expect(success).to.equal(true);
    }
  );

  it('should focus the first tab on [home]',
    async function() {
      await this.driver.executeScript(_ => {
        window.expectedFirstHeading =
          document.querySelector('[role=heading]:nth-of-type(1)');
        window.expectedLastHeading =
          document.querySelector('[role=heading]:last-of-type');
      });

      success = await helper.pressKeyUntil(this.driver, Key.TAB,
        _ => document.activeElement === window.expectedFirstHeading
      );
      expect(success).to.equal(true);
      await this.driver.actions().sendKeys(Key.ARROW_LEFT).perform();
      await helper.pressKeyUntil(this.driver, Key.TAB,
        _ => document.activeElement === window.expectedLastHeading
      );
      expect(success).to.equal(true);
      await this.driver.actions().sendKeys(Key.HOME).perform();
      success = await this.driver.executeScript(
        _ => document.activeElement === window.expectedFirstHeading
      );
      expect(success).to.equal(true);
    }
  );

 it('should focus a tab on click',
    async function() {
      const lastHeading =
        await this.driver.findElement(By.css('[role=heading]:last-of-type'));
      const lastPanelId = await lastHeading.getAttribute('aria-controls');
      const lastPanel = await this.driver.findElement(By.id(lastPanelId));
      expect(lastHeading.getAttribute('aria-expanded')).to.not.equal('true');
      await lastHeading.click();
      expect(await lastHeading.getAttribute('aria-expanded')).to.equal('true');
      expect(await lastPanel.getAttribute('aria-hidden')).to.contain('false');
    }
  );
});
