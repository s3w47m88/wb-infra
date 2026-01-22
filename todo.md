# Website Builder Tasks

## Components
[ ] Add a robust set of Components

## Brand
[ ] Add a button for "Brand" with the following features:
    [ ] Logo management
    [ ] Photo library
    [ ] Staff portraits
    [ ] Bio/About section
    [ ] Link to social media profiles
    [ ] Brand colors and typography
    [ ] Brand guidelines/style guide
    [ ] Company values and mission statement
    [ ] Press kit/media resources
    [ ] Brand assets download section

## Theme
[ ] Fix Theme functionality - clicking it should replace key colors in the selected Template

## Features System
[ ] Add a "+ Features" button with installable features for political campaigns
    [ ] Features list UI showing available features
    [ ] Configuration wizard for each feature with step-by-step questions
    [ ] Status dashboard showing configured vs. not configured state
    [ ] Support for active/inactive/needs attention status
    [ ] Allow customization of feature pages after creation
    [ ] Support multiple instances of features (e.g., multiple donation pages)
    [ ] Feature removal/uninstall capability
    [ ] Donation Module (mock system for now, API integration later)
        [ ] Multiple donation page support
        [ ] Custom donation amounts
        [ ] Recurring donation options
    [ ] eCommerce (merchandise/swag store)
        [ ] Creates new page with product catalog
        [ ] Fake checkout process
        [ ] Shopping cart functionality
    [ ] Volunteer Sign-up & Management
    [ ] Event Calendar & RSVP
    [ ] Email Newsletter Subscription
    [ ] Petition/Pledge Forms
    [ ] Endorsements Display
    [ ] Policy Platform Pages
    [ ] Town Hall/Meeting Scheduler
    [ ] Voter Registration Tools
    [ ] Phone Banking Integration
    [ ] Canvassing Tools
    [ ] Social Media Feed Integration
    [ ] News/Press Release Section

## Content Conversion
[ ] Rewrite all content to be about political campaigns for Republicans and Conservatives
    [ ] Update all text content and copy
    [ ] Replace all images with Republican/Conservative campaign imagery
    [ ] Update templates to reflect political campaign themes
    [ ] Ensure brand colors align with Republican/Conservative branding
    [ ] Update example data and placeholders

## UI/UX Improvements
[ ] Update the website browser title to say "Website Builder by Spencer Hill"
[ ] Right align the buttons
[ ] Change the Add Components icon to something that represents Components
[ ] Ensure all buttons just show the icon until you hover and then they show the text

## Onboarding Experience
[ ] Ensure the blank page on load has a call to action to populate their brand details and select a template
    [ ] Make it a full blown paginated onboarding process with basic quick questions
    [ ] Design multi-step wizard interface
    [ ] Collect brand details progressively
    [ ] Template selection as part of onboarding flow

## User Account System (LOW PRIORITY BIG FEATURE)
[ ] Create a My Account icon in the top right
[ ] Build out user registration and login utilizing Supabase's features
    [ ] User registration
    [ ] User login
    [ ] Lost password recovery
[ ] My Account menu features:
    [ ] Billing as an option
    [ ] Place to enter their card on file
    [ ] "Link to My Politogy Account" to import features

## AI Chatbot Integration (LOWEST PRIORITY)
[ ] BIG PROJECT - Implement an AI chatbot that utilizes Claude Code to make changes to the layout
    [ ] Ask clarifying questions to ensure full scope understanding
    [ ] Design as separate application communicating via API (not directly in codebase)
    [ ] Capabilities to include:
        [ ] Color changes
        [ ] Content changes
        [ ] Template selections
        [ ] Theme selections
        [ ] Populating brand content
        [ ] Adding and configuring features
    [ ] Create robust prompt with instructions on accessing the AI
    [ ] Deploy as separate app
    [ ] Include on page to modify things
