import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { NavigationBar } from "./NavigationBar";
import { AuthProvider } from "../../context/AuthContext";

// Mock store with minimal required state
const mockStore = configureStore({
  reducer: {
    radarlist: () => ({ radars: [] }),
    ringlist: () => ({ rings: [] }),
    quadlist: () => ({ quadrants: [] }),
  },
});

describe("NavigationBar", () => {
  it("Renders Navigation Bar", async () => {
    const navBar = render(
      <MemoryRouter>
        <Provider store={mockStore}>
          <AuthProvider>
            <NavigationBar brand="test" />
          </AuthProvider>
        </Provider>
      </MemoryRouter>,
    );

    // Use getAllByText since the NavigationBar renders for both desktop and mobile
    const items = await navBar.findAllByText("test");
    expect(items.length).toBe(2); // One for desktop, one for mobile
    expect(items[0]).toBeDefined();
  });
});
