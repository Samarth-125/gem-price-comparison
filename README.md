# Marketplace Price Comparison

A beginner Electron desktop app that compares sample product prices from Amazon, Flipkart, and JioMart.

## About the App

The app searches local product data and shows the matching marketplace listings side by side. It can filter products by category, sort prices, and highlight the lowest listed price.

## Important: Demo Data Only

Product data and prices are hard-coded examples stored in local JSON files. The app does **not** fetch live prices, scrape marketplace websites, or call marketplace APIs.

Prices, stock status, and product links are for demonstration only. They may not match current marketplace listings or prices.

## Features

- Product search with autocomplete suggestions
- Category filter
- Sort prices from low to high or high to low
- Highlight the lowest listed price
- Show links to marketplace listings
- Show a message when no matching product is found
- Responsive layout for different window sizes

## Project Structure

```text
Gem/
├── assets/                 # Images and other visual assets
├── data/                   # Local marketplace demo data in JSON files
├── src/
│   ├── components/         # Autocomplete, price card, and message UI
│   ├── features/           # Search, category filter, sorting, comparison
│   ├── utils/              # Shared text and price helpers
│   └── renderer.js         # Connects the page to app features
├── index.html              # App page structure
├── main.js                 # Electron window and local data loading
├── preload.js              # Safe bridge between Electron and the page
├── styles.css              # App styling and responsive layout
└── package.json            # Project settings and start command