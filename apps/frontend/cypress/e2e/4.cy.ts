describe("Account Like Flow", () => {
  beforeEach(() => {
    Cypress.on("uncaught:exception", (err) => {
      if (err.message.includes("Hydration failed")) {
        return false;
      }

      if (err.message.includes("Failed to fetch dynamically imported module")) {
        return false;
      }

      return true;
    });
  });

  it("logs in, likes a game, verifies, then logs out", () => {
    const email = "btest2@gmail.com";
    const password = "Game!234";

    // Log in
    cy.visit("/login", { failOnStatusCode: false });
    cy.get('input[type="email"]').as("emailInput");
    cy.get('input[type="password"]').as("passwordInput");

    cy.get("@emailInput").should("be.visible").clear({ force: true });
    cy.get("@emailInput").type(email, { force: true, delay: 10 });
    cy.get("@passwordInput").should("be.visible").clear({ force: true });
    cy.get("@passwordInput").type(password, { force: true, delay: 10 });

    cy.contains('button[type="submit"], button', /Log In|Login|Sign In/i).click({ force: true });

    // Go to catalogue
    cy.contains("a", /Catalogue|catalogue/i, { timeout: 5000 }).click({ force: true });

    // Select Cyberpunk 2077
    cy.visit("http://localhost:5173/games/6", { failOnStatusCode: false });

    // Like the game
    cy.contains("span", "Like", { timeout: 5000 }).parent().click({ force: true });

    // Go back to catalogue
    cy.contains("a", /Catalogue|catalogue/i).click({ force: true });

    // Check if the game is liked by revisiting the game page
    cy.visit("http://localhost:5173/games/6", { failOnStatusCode: false });
    cy.contains("span", "Liked", { timeout: 5000 }).should("exist");

    // Go to articles
    cy.contains("a", /Articles|articles/i).click({ force: true });

    // Log out
    cy.window().then((win) => {
      const rawUser = win.localStorage.getItem("user");
      const storedUser = rawUser ? JSON.parse(rawUser) : null;
      const storedUsername = storedUser?.username;

      if (storedUsername) {
        cy.contains("button", storedUsername, { timeout: 5000 }).click({ force: true });
        cy.contains("div", /Log Out/i).click({ force: true });
      }
    });
  });
});
