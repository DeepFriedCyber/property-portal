describe('Authentication Flows', () => {
  beforeEach(() => {
    // Reset any previous authentication state
    cy.clearCookies()
    cy.clearLocalStorage()
  })

  it('should navigate to sign-in page from homepage', () => {
    cy.visit('/')
    cy.contains('Sign In').click()
    cy.url().should('include', '/sign-in')
    cy.get('h1').should('contain', 'Sign In')
  })

  it('should navigate to sign-up page from homepage', () => {
    cy.visit('/')
    cy.contains('Sign Up').click()
    cy.url().should('include', '/sign-up')
    cy.get('h1').should('contain', 'Sign Up')
  })

  it('should show validation errors on sign-in form', () => {
    cy.visit('/sign-in')
    
    // Submit empty form
    cy.get('button[type="submit"]').click()
    
    // Check for validation errors
    cy.contains('Email is required').should('be.visible')
    
    // Fill email but not password
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('button[type="submit"]').click()
    
    // Check for password validation error
    cy.contains('Password is required').should('be.visible')
  })

  it('should show validation errors on sign-up form', () => {
    cy.visit('/sign-up')
    
    // Submit empty form
    cy.get('button[type="submit"]').click()
    
    // Check for validation errors
    cy.contains('Email is required').should('be.visible')
    
    // Fill email but not other required fields
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('button[type="submit"]').click()
    
    // Check for other validation errors
    cy.contains('Password is required').should('be.visible')
    cy.contains('First name is required').should('be.visible')
  })

  it('should show error message for invalid credentials', () => {
    cy.visit('/sign-in')
    
    // Fill in invalid credentials
    cy.get('input[name="email"]').type('invalid@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Check for error message
    cy.contains('Invalid email or password').should('be.visible')
  })

  it('should redirect to dashboard after successful sign-in', () => {
    // This test requires a mock or a test user
    // For this example, we'll use cy.intercept to mock the authentication API
    cy.intercept('POST', '**/api/auth/signin', {
      statusCode: 200,
      body: {
        success: true,
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        },
        token: 'mock-jwt-token'
      }
    }).as('signInRequest')
    
    cy.visit('/sign-in')
    
    // Fill in credentials
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Wait for the request to complete
    cy.wait('@signInRequest')
    
    // Check redirection to dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome, Test User').should('be.visible')
  })

  it('should allow password reset request', () => {
    cy.visit('/sign-in')
    
    // Click on forgot password link
    cy.contains('Forgot password?').click()
    
    // Check we're on the reset password page
    cy.url().should('include', '/reset-password')
    
    // Enter email for password reset
    cy.get('input[name="email"]').type('test@example.com')
    cy.get('button[type="submit"]').click()
    
    // Check for success message
    cy.contains('Password reset email sent').should('be.visible')
  })

  it('should allow user to sign out', () => {
    // Mock authenticated state
    cy.window().then((window) => {
      window.localStorage.setItem('auth', JSON.stringify({
        token: 'mock-token',
        user: { id: '123', name: 'Test User', email: 'test@example.com' }
      }))
    })
    
    // Visit dashboard as authenticated user
    cy.visit('/dashboard')
    
    // Click sign out button
    cy.contains('Sign Out').click()
    
    // Verify redirect to home page
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Verify authentication state is cleared
    cy.window().then((window) => {
      expect(window.localStorage.getItem('auth')).to.be.null
    })
  })
})