// Cypress support file for E2E tests
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("Hydration failed")) {
    return false;
  }
});

beforeEach(() => {
  // Clear localStorage before each test if needed
  // cy.clearLocalStorage();
});
