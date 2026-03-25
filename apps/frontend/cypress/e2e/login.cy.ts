describe("Login Page", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should render the login form with all fields", () => {
    cy.contains("Log in").should("exist");
    cy.get('input[type="email"]').should("exist");
    cy.get('input[type="password"]').should("exist");
    cy.contains("button", /Log In|Logging in/i).should("exist");
  });

  it("should show validation error for empty email", () => {
    cy.get('input[type="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    
    cy.get('input[type="email"]').should("have.attr", "required");
  });

  it("should show validation error for empty password", () => {
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('button[type="submit"]').click();
    
    cy.get('input[type="password"]').should("have.attr", "required");
  });

  it("should successfully login with valid credentials", () => {
    cy.get('input[type="email"]').type("user@example.com");
    cy.get('input[type="password"]').type("password123");
    
    cy.intercept("POST", "**/login", {
      statusCode: 200,
      body: {
        token: "fake-jwt-token",
        user: {
          id: "1",
          email: "user@example.com",
          username: "testuser",
        },
      },
    }).as("loginRequest");

    cy.get('button[type="submit"]').click();
    cy.wait("@loginRequest");
    cy.url().should("include", "/games");
  });

  it("should display error message on login failure", () => {
    cy.get('input[type="email"]').type("wrong@example.com");
    cy.get('input[type="password"]').type("wrongpassword");

    cy.intercept("POST", "**/login", {
      statusCode: 401,
      body: {
        error: "Invalid credentials",
      },
    }).as("failedLogin");

    cy.get('button[type="submit"]').click();
    cy.wait("@failedLogin");
    cy.get("p.text-red-400").should("be.visible");
    cy.url().should("include", "/login");
  });

  it("should have a signup link", () => {
    cy.contains("a", /create one|sign up/i).should("exist");
    cy.contains("a", /create one|sign up/i).should("have.attr", "href", "/signup");
  });
});
