const logger = require('./Logger');
const { By } = require('selenium-webdriver');
const { expect } = require('chai');

class DynamicTester {
  constructor(seleniumUtils) {
    this.utils = seleniumUtils;
  }

  async scanFormsOnCurrentPage() {
    // JavaScript to execute in browser to extract all form metadata
    const jsExtractForms = `
      return Array.from(document.querySelectorAll('form')).map((form, formIndex) => {
        const inputs = Array.from(form.querySelectorAll('input, select, textarea')).map(input => {
          return {
            name: input.name || input.id || 'unnamed',
            type: input.type || input.tagName.toLowerCase(),
            required: input.required,
            minLength: input.minLength > -1 ? input.minLength : null,
            maxLength: input.maxLength > -1 ? input.maxLength : null,
            pattern: input.pattern || null
          };
        });
        
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        return {
          index: formIndex,
          id: form.id || 'form_' + formIndex,
          action: form.getAttribute('action') || 'none',
          inputs: inputs,
          hasSubmitButton: !!submitBtn
        };
      });
    `;

    try {
      const forms = await this.utils.driver.executeScript(jsExtractForms);
      logger.info(`Scanned ${forms.length} forms on current page.`);
      return forms;
    } catch (err) {
      logger.error('Failed to scan forms: ' + err.message);
      return [];
    }
  }

  generateTestCasesForForm(formSchema) {
    const testCases = [];
    
    // 1. Test empty submission if required fields exist
    const requiredFields = formSchema.inputs.filter(i => i.required);
    if (requiredFields.length > 0 && formSchema.hasSubmitButton) {
      testCases.push({
        description: `should prevent submission when required fields are empty (Form: ${formSchema.id})`,
        execute: async () => {
          // Clear all required fields
          for (const field of requiredFields) {
            const loc = By.css(`form:nth-of-type(${formSchema.index + 1}) [name="${field.name}"], form:nth-of-type(${formSchema.index + 1}) #${field.name}`);
            try {
              const el = await this.utils.findElement(loc, 2000);
              await el.clear();
            } catch (e) {
              logger.warn(`Could not clear field ${field.name} during dynamic test`);
            }
          }
          // Attempt submit
          const submitLoc = By.css(`form:nth-of-type(${formSchema.index + 1}) button[type="submit"]`);
          await this.utils.click(submitLoc);
          
          // Verify HTML5 validation trigger or check if URL hasn't changed.
          // Note: Full dynamic assertion requires checking JS validity state
          const validityScript = `return document.querySelector('form:nth-of-type(${formSchema.index + 1})').checkValidity();`;
          const isValid = await this.utils.driver.executeScript(validityScript);
          expect(isValid).to.be.false;
        }
      });
    }

    // 2. Test email validation
    const emailFields = formSchema.inputs.filter(i => i.type === 'email');
    if (emailFields.length > 0) {
      testCases.push({
        description: `should validate email format (Form: ${formSchema.id})`,
        execute: async () => {
          for (const field of emailFields) {
            const loc = By.css(`form:nth-of-type(${formSchema.index + 1}) [name="${field.name}"]`);
            await this.utils.type(loc, 'invalid-email');
            
            const validityScript = `return document.querySelector('form:nth-of-type(${formSchema.index + 1}) [name="${field.name}"]').validity.typeMismatch;`;
            const isMismatch = await this.utils.driver.executeScript(validityScript);
            expect(isMismatch).to.be.true;
          }
        }
      });
    }

    return testCases;
  }
}

module.exports = DynamicTester;
